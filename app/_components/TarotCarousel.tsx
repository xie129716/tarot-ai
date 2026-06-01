'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { shuffleDeck } from '@/lib/tarot/cards';
import type { TarotCard as TarotCardType } from '@/types';
import type { CarouselPhase } from '@/types';

interface TarotCarouselProps {
  phase: CarouselPhase;
  onPauseChange?: (currentCard: TarotCardType | null) => void;
  selectedCards?: number[];
  /** Map of card ID → orientation for reversed cards */
  orientations?: Map<number, 'upright' | 'reversed'>;
  onImageReady?: (readyIds: Set<number>) => void;
}

const RADIUS = 500;
const ROTATION_SPEED = 30;

export default function TarotCarousel({
  phase,
  onPauseChange,
  selectedCards = [],
  orientations = new Map(),
  onImageReady,
}: TarotCarouselProps) {
  // Shuffle the deck once on mount so cards aren't grouped by arcana/suit
  const shuffledDeck = useMemo(() => shuffleDeck(), []);
  const CARD_COUNT = shuffledDeck.length;
  const ANGLE_PER_CARD = 360 / CARD_COUNT;
  const [angle, setAngle] = useState(0);
  const [isSnapping, setIsSnapping] = useState(false);
  const prevSelectedRef = useRef<number[]>([]);
  const flipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const angleRef = useRef(0);
  const lastTimeRef = useRef(0);
  const frameRef = useRef(0);
  const logFrameRef = useRef(0);

  // ─── Compute front index (used by multiple blocks below) ───
  const getFrontIndex = useCallback(() => {
    const norm = ((angleRef.current % 360) + 360) % 360;
    return Math.round(((360 - norm) % 360) / ANGLE_PER_CARD) % CARD_COUNT;
  }, []);
  const frontIndex = getFrontIndex();

  // ─── Flip card: compute synchronously in render, no effect lag ───
  // Track the last selected card that hasn't been "confirmed" by rotation yet
  const lastNewCardRef = useRef<number | null>(null);
  const wasRotatingRef = useRef(false);

  // Detect rotation→idle transition (user just stopped/paused)
  const justStopped = wasRotatingRef.current && phase === 'idle';
  wasRotatingRef.current = phase === 'rotating';

  // Clear pending flip when rotation resumes
  if (phase === 'rotating' && lastNewCardRef.current !== null) {
    console.log('[CAROUSEL] Rotation resumed — clearing pending flip');
    lastNewCardRef.current = null;
  }

  // Compute newly selected cards right in render
  const prev = prevSelectedRef.current;
  const newlySelected = selectedCards.filter((id) => !prev.includes(id));
  prevSelectedRef.current = selectedCards;

  // Remember newly selected card
  if (newlySelected.length > 0) {
    lastNewCardRef.current = newlySelected[0]!;
    console.log('[CAROUSEL] New selection | cardId:', newlySelected[0], '| phase:', phase);
  }

  // Show flip: card that was just selected, while idle, NOT during rotation
  const flippingCardId: number | null =
    (phase === 'idle' && lastNewCardRef.current !== null)
      ? lastNewCardRef.current
      : null;

  // One-time log when flip becomes active
  if (flippingCardId !== null) {
    const card = shuffledDeck.find(c => c.id === flippingCardId);
    console.log('[CAROUSEL] FLIP SHOWING | cardId:', flippingCardId,
      '| name:', card?.name, '| atCenter:', frontIndex < shuffledDeck.length && shuffledDeck[frontIndex]?.id === flippingCardId);
  }

  // Preload card images — track which are ready, notify parent
  const imagesReadyRef = useRef<Set<number>>(new Set());
  const onImageReadyRef = useRef(onImageReady);
  onImageReadyRef.current = onImageReady;

  useEffect(() => {
    const ready = new Set<number>();
    let pending = shuffledDeck.length;
    shuffledDeck.forEach((card) => {
      const img = new window.Image();
      img.onload = () => {
        ready.add(card.id);
        pending--;
        if (pending === 0) onImageReadyRef.current?.(ready);
      };
      img.onerror = () => {
        pending--;
        console.warn('[carousel] Image failed:', card.imagePath);
        if (pending === 0) onImageReadyRef.current?.(ready);
      };
      img.src = card.imagePath;
    });
    imagesReadyRef.current = ready;
  }, [shuffledDeck]);



  // ─── Phase change ───
  const prevPhaseRef = useRef(phase);
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    if (phase === 'rotating') {
      setIsSnapping(false);
      console.log('[CAROUSEL] ▶ rotating | ring:', angleRef.current.toFixed(1), '°');
    } else if (prev === 'rotating') {
      // Snap nearest card to center (animated)
      const fi = getFrontIndex();
      const target = (360 - ((fi * ANGLE_PER_CARD) % 360)) % 360;
      console.log(
        '[CAROUSEL] ⏸ snap | ring:', angleRef.current.toFixed(1), '°',
        '→ card:', fi, shuffledDeck[fi]?.name,
        '| snapTo:', target.toFixed(1), '°'
      );
      angleRef.current = target;
      setAngle(target);
      setIsSnapping(true);
    }
  }, [phase, getFrontIndex]);

  // ─── Rotation loop — update angle state ───
  useEffect(() => {
    if (phase !== 'rotating') return;

    let running = true;
    lastTimeRef.current = 0;

    const tick = (time: number) => {
      if (!running) return;
      if (lastTimeRef.current === 0) lastTimeRef.current = time;

      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (dt > 0 && dt < 0.5) {
        angleRef.current = (angleRef.current + ROTATION_SPEED * dt) % 360;
        setAngle(angleRef.current);

        // DEBUG: rotation log suppressed to focus on flip state
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(frameRef.current); };
  }, [phase, getFrontIndex]);

  const frontCard = shuffledDeck[frontIndex]!;

  useEffect(() => {
    onPauseChange?.(frontCard ?? null);
  }, [frontIndex, frontCard, onPauseChange]);

  const visibleRange = 15;

  return (
    <div className="relative w-full h-[550px] md:h-[650px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-purple-600/5 via-transparent to-transparent" />

      {/* 3D Scene */}
      <div style={{ perspective: '1400px', perspectiveOrigin: '50% 50%' }}>
        {/* Ring: framer-motion handles both rotation and snap */}
        <motion.div
          animate={{ rotateY: angle }}
          transition={{
            duration: isSnapping ? 0.7 : 0,
            ease: isSnapping ? [0.22, 0.1, 0.15, 1.0] : 'linear',
          }}
          style={{
            transformStyle: 'preserve-3d',
            width: 0,
            height: 0,
          }}
        >
          {shuffledDeck.map((card, i) => {
            const dist = Math.min(Math.abs(i - frontIndex), CARD_COUNT - Math.abs(i - frontIndex));
            if (dist > visibleRange && !selectedCards.includes(card.id)) return null;

            const cardAngle = i * ANGLE_PER_CARD;
            const isFront = i === frontIndex;
            const isSelected = selectedCards.includes(card.id);
            const isFlipping = flippingCardId === card.id;
            const anyFlipping = flippingCardId !== null;
            // During idle: selected card shows RWS (not dimmed). During rotating: dim + ✓.
            const showSelectedOverlay = isSelected && phase === 'rotating';
            const cardOpacity = isFlipping ? 1 : (anyFlipping) ? 0.1 : (showSelectedOverlay) ? 0.35 : 1;
            return (
              <div
                key={card.id}
                className="absolute"
                style={{
                  transform: `rotateY(${cardAngle}deg) translateZ(${RADIUS}px)`,
                  width: isFront ? '140px' : '80px',
                  height: isFront ? '220px' : '130px',
                  marginLeft: isFront ? '-70px' : '-40px',
                  marginTop: isFront ? '-110px' : '-65px',
                  opacity: cardOpacity,
                  pointerEvents: isSelected ? 'none' : 'auto',
                }}
              >
                {/* 3D Flip card: back (✦☽) → front (RWS image) */}
                <div style={{ perspective: '600px', width: '100%', height: '100%' }}>
                  <motion.div
                    className="w-full h-full"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{
                      rotateY: isFlipping ? 180 : 0,
                      borderColor: isFront ? 'rgba(218,165,32,0.95)' : 'rgba(147,112,219,0.4)',
                      scale: isFront ? 1.8 : 0.55,
                      boxShadow: isFront
                        ? '0 0 50px rgba(218,165,32,0.5), 0 0 100px rgba(218,165,32,0.15)'
                        : 'none',
                    }}
                    transition={{
                      rotateY: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
                      default: { duration: 0.3 },
                    }}
                  >
                    {/* FRONT — Card back ✦☽ */}
                    <div
                      className="absolute inset-0 rounded-xl border-2 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center overflow-hidden"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="absolute inset-2 border border-purple-500/20 rounded-lg pointer-events-none" />
                      <div className="absolute inset-4 border border-purple-400/10 rounded-md pointer-events-none" />
                      <span className={isFront ? 'text-4xl mb-1' : 'text-xl mb-0.5'}>✦</span>
                      <div className={cn(
                        'rounded-full border border-purple-400/40 flex items-center justify-center',
                        isFront ? 'w-10 h-10' : 'w-6 h-6'
                      )}>
                        <span className={cn('text-purple-300', isFront ? 'text-lg' : 'text-xs')}>☽</span>
                      </div>
                    </div>

                    {/* BACK — RWS card image */}
                    <div
                      className="absolute inset-0 rounded-xl border-2 border-amber-500/40 overflow-hidden"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <img
                        src={card.imagePath}
                        alt={card.name}
                        className="w-full h-full object-cover"
                        style={{
                          transform: orientations.get(card.id) === 'reversed' ? 'rotate(180deg)' : 'none',
                        }}
                        onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                      />
                      {/* Name overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/95 to-transparent pt-6 pb-1.5 px-2">
                        <p className="text-[8px] font-bold text-amber-200 text-center leading-tight">{card.name}</p>
                      </div>
                    </div>

                    {/* Name label — ONLY during flip animation */}
                    {isFlipping && (
                      <motion.div
                        className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-amber-500/30 rounded-xl px-3 py-1.5 text-center whitespace-nowrap z-20"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <p className="text-xs font-bold text-amber-200 leading-tight">{card.name}</p>
                        <p className="text-[9px] text-purple-300/60 leading-tight">{card.keywords.slice(0, 3).join(' · ')}</p>
                      </motion.div>
                    )}

                    {/* ✓ overlay — only when rotating past a confirmed card */}
                    {showSelectedOverlay && !isFlipping && (
                      <div className="absolute inset-0 rounded-xl bg-purple-950/60 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
                        <span className="text-3xl opacity-50">✓</span>
                      </div>
                    )}
                    {/* During flip, the RWS back face already shows — no overlay needed */}
                  </motion.div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* HUD */}
      {phase === 'rotating' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-purple-500/20 rounded-full px-6 py-2.5">
          <p className="text-purple-200/70 text-sm">🙏 祈祷旋转 · 🖐️ 张手选择</p>
        </div>
      )}
      {phase === 'idle' && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 border border-purple-500/20 rounded-full px-6 py-2.5 text-center">
          <p className="text-purple-200/70 text-sm">🖐️ 张手选择当前卡牌 ｜ 🙏 祈祷继续旋转</p>
        </div>
      )}
    </div>
  );
}

function getMaj(id: number) {
  const m: Record<number, string> = { 0:'🌟',1:'🪄',2:'🌙',3:'👑',4:'🏰',5:'⛪',6:'💕',7:'⚔️',8:'🦁',9:'🏮',10:'🎡',11:'⚖️',12:'🙃',13:'💀',14:'🏺',15:'😈',16:'⚡',17:'⭐',18:'🌕',19:'☀️',20:'📯',21:'🌍' };
  return m[id]??'🔮';
}
function getSuit(s: string) { return s==='wands'?'🪵':s==='cups'?'🏆':s==='swords'?'🗡️':'🪙'; }
