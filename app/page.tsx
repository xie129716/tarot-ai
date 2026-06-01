'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { ReadingPhase, CarouselPhase, TarotCard, CardSelection } from '@/types';
import type { GestureEvent } from '@/lib/gestures/types';
import { GestureType } from '@/lib/gestures/types';

import TarotSpread from './_components/TarotSpread';
import TarotCarousel from './_components/TarotCarousel';
import CardDeck from './_components/CardDeck';
import ReadingPanel from './_components/ReadingPanel';
import ChatPanel from './_components/ChatPanel';
import GestureOverlay from './_components/GestureOverlay';
import GestureHint from './_components/GestureHint';

import { useCardSelection } from '@/hooks/useCardSelection';
import { useTarotReading } from '@/hooks/useTarotReading';
import { useTarotChat } from '@/hooks/useTarotChat';
import { useHandTracking } from '@/hooks/useHandTracking';
import { useGestureClassification } from '@/hooks/useGestureClassification';
import { getSpread } from '@/lib/tarot/spreads';

const SPREAD_OPTIONS = [
  { key: 'single', name: '单张指引', slots: 1 },
  { key: 'past-present-future', name: '过去·现在·未来', slots: 3 },
  { key: 'celtic-cross', name: '凯尔特十字', slots: 10 },
];

export default function HomePage() {
  // ─── State ───
  const [phase, setPhase] = useState<ReadingPhase>('WELCOME');
  const [carouselPhase, setCarouselPhase] = useState<CarouselPhase>('idle');
  const [spreadType, setSpreadType] = useState('past-present-future');
  const [gestureEnabled, setGestureEnabled] = useState(false);
  const [showGestureHint, setShowGestureHint] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [latestGesture, setLatestGesture] = useState<GestureEvent | null>(null);
  const imagesReadyRef = useRef<Set<number>>(new Set());

  // Store selected cards for the spread
  const [spreadCards, setSpreadCards] = useState<CardSelection[]>([]);
  const [revealedCards, setRevealedCards] = useState<boolean[]>([]);
  const readingRef = useRef<string>('');

  // Refs to avoid stale closures
  const phaseRef = useRef(phase);
  const carouselPhaseRef = useRef(carouselPhase);
  const spreadCardsRef = useRef(spreadCards);
  const spreadRef = useRef(spreadType);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { carouselPhaseRef.current = carouselPhase; }, [carouselPhase]);
  useEffect(() => { spreadCardsRef.current = spreadCards; }, [spreadCards]);
  useEffect(() => { spreadRef.current = spreadType; }, [spreadType]);

  // ─── Detect mobile ───
  useEffect(() => {
    setIsMobile(typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0));
  }, []);

  // ─── Tarot Reading ───
  const {
    completion: reading,
    isLoading: isReading,
    startReading,
    stop: stopReading,
  } = useTarotReading({
    onFinish: (text) => {
      readingRef.current = text;
      setPhase('COMPLETE');
    },
    onError: () => toast.error('解读连接中断，请重试'),
  });

  // ─── Tarot Chat ───
  const readingContext =
    phase === 'COMPLETE' || phase === 'CHAT_OPEN'
      ? { cards: spreadCards, spreadType, reading: readingRef.current }
      : null;

  const {
    messages: chatMessages,
    input: chatInput,
    handleInputChange: handleChatInputChange,
    handleSubmit: handleChatSubmit,
    isLoading: isChatLoading,
  } = useTarotChat(readingContext, {
    onError: () => toast.error('消息发送失败，请重试'),
  });

  // ─── Reset ───
  const resetGesturesRef = useRef<() => void>(() => {});

  const doReset = useCallback(() => {
    stopReading();
    resetGesturesRef.current();
    setSpreadCards([]);
    setRevealedCards([]);
    readingRef.current = '';
    setPhase('WELCOME');
    setCarouselPhase('idle');
    setLatestGesture(null);
  }, [stopReading]);

  // ─── Select card from carousel (defined first — used by gesture handler) ───
  const pausedCardRef = useRef<TarotCard | null>(null);

  const handleCardSelect = useCallback(() => {
    const card = pausedCardRef.current;
    if (!card) {
      console.log('[page] Select attempted but no card highlighted');
      return;
    }

    // Check if card image has loaded — prevent flip to broken image
    if (!imagesReadyRef.current.has(card.id)) {
      toast.warning('卡牌图片尚未加载完成，请稍候再试');
      console.log('[page] Card image not ready:', card.name, card.imagePath);
      return;
    }

    const spread = getSpread(spreadRef.current);
    const slotCount = spread.slotCount;
    const currentCards = spreadCardsRef.current;

    // Check if this card is already selected
    if (currentCards.some((c) => c.card.id === card.id)) {
      toast.info('这张牌已被选择，请继续旋转选择其他牌');
      return;
    }

    const nextSlotIndex = currentCards.length;
    if (nextSlotIndex >= slotCount) {
      toast.warning(`已选满 ${slotCount} 张牌`);
      return;
    }

    const orientation: 'upright' | 'reversed' = Math.random() > 0.5 ? 'upright' : 'reversed';
    const newCards = [
      ...currentCards,
      {
        card,
        position: spread.positions[nextSlotIndex]!.label,
        orientation,
      },
    ];

    setSpreadCards(newCards);
    setRevealedCards((prev) => [...prev, true]);
    toast.success(`已选：${card.name}（${newCards.length}/${slotCount}）`);

    console.log('[page] Selected card:', card.name, '| slot:', nextSlotIndex + 1, '/', slotCount);
  }, []);

  // ─── Watch for all cards selected → trigger AI analysis ───
  const stopCameraRef = useRef<() => void>(() => {});
  const spread = getSpread(spreadType);
  useEffect(() => {
    if (spreadCards.length >= spread.slotCount && spreadCards.length > 0 && phase === 'CARD_SELECTION') {
      console.log('[page] All', spread.slotCount, 'cards selected → stop camera + start reading');
      stopCameraRef.current();
      setGestureEnabled(false);
      const timer = setTimeout(() => {
        setPhase('READING');
        startReading(spreadCards, spreadType);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [spreadCards.length, spread.slotCount, phase, spreadType, startReading]);

  // Keep pausedCardRef synced
  const handlePauseChange = useCallback((card: TarotCard | null) => {
    pausedCardRef.current = card;
  }, []);

  // ─── Gesture Handling + Cooldown ───
  // Prevent rapid toggling: minimum 600ms between carousel state changes
  const lastStateChangeRef = useRef(0);
  const SELECT_COOLDOWN_MS = 2000;
  const lastSelectRef = useRef(0);
  const COOLDOWN_MS = 600;

  const setCarouselWithCooldown = useCallback((newPhase: CarouselPhase) => {
    const now = Date.now();
    if (now - lastStateChangeRef.current < COOLDOWN_MS) return;
    if (carouselPhaseRef.current === newPhase) return;
    lastStateChangeRef.current = now;
    console.log('[page] Carousel:', newPhase);
    setCarouselPhase(newPhase);
  }, []);

  const handleGesture = useCallback(
    (event: GestureEvent | null) => {
      const currentPhase = phaseRef.current;
      if (currentPhase !== 'CARD_SELECTION') return;

      // ─── null = sustained no-hand (600ms+) → stop rotation ───
      if (!event) {
        if (carouselPhaseRef.current === 'rotating') {
          setCarouselWithCooldown('idle');
        }
        return;
      }

      setLatestGesture(event);
      // Only log state-changing gestures
      if (event.type !== GestureType.PRAYER || carouselPhaseRef.current !== 'rotating') {
        console.log('[page] Gesture:', event.type, '| carousel:', carouselPhaseRef.current);
      }

      switch (event.type) {
        case GestureType.PRAYER:
          if (carouselPhaseRef.current !== 'rotating') {
            setCarouselWithCooldown('rotating');
          }
          break;

        case GestureType.OPEN_PALM:
          if (Date.now() - lastSelectRef.current > SELECT_COOLDOWN_MS) {
            lastSelectRef.current = Date.now();
            handleCardSelect();
          }
          // OK in rotating mode → stop (user wants to select)
          if (carouselPhaseRef.current === 'rotating') {
            setCarouselWithCooldown('idle');
          }
          break;

        case GestureType.FIST:
          // FIST now does nothing (备用)
          break;
        // Other/unknown → ignore
      }
    },
    [doReset, handleCardSelect, setCarouselWithCooldown]
  );

  // ─── Gesture pipeline ───
  const { processResult, reset: resetGestures } = useGestureClassification({
    onGesture: handleGesture,
  });

  useEffect(() => { resetGesturesRef.current = resetGestures; }, [resetGestures]);

  const { videoRef, isLoading: cameraLoading, error: cameraError, startCamera, stopCamera } =
    useHandTracking({
      enabled: gestureEnabled,
      onGestureResult: processResult,
      captureIntervalMs: 300,
    });
  // Wire refs for camera start/stop from effects defined before the hook
  useEffect(() => { stopCameraRef.current = stopCamera; startCameraRef.current = startCamera; }, [stopCamera, startCamera]);

  // ─── Phase transitions ───
  const handleStart = useCallback(() => {
    setSpreadCards([]);
    setRevealedCards([]);
    readingRef.current = '';
    setPhase('SHUFFLING');
    setLatestGesture(null);

    if (gestureEnabled) setShowGestureHint(true);
  }, [gestureEnabled]);

  const startCameraRef = useRef<() => Promise<void>>(async () => {});
  const handleShuffleComplete = useCallback(() => {
    setPhase('CARD_SELECTION');
    setCarouselPhase('idle');
    console.log('[page] SHUFFLING → CARD_SELECTION');
    if (!isMobile && !gestureEnabled) {
      toast('是否开启摄像头进行手势控制？', {
        description: '点击下方按钮或直接用手势操作',
        action: {
          label: '开启',
          onClick: () => {
            setGestureEnabled(true);
            setShowGestureHint(true);
            setTimeout(() => startCameraRef.current(), 200);
          },
        },
        duration: 5000,
      });
    }
  }, [isMobile, gestureEnabled]);

  const handleOpenChat = useCallback(() => setPhase('CHAT_OPEN'), []);

  const handleEnableGesture = useCallback(async () => {
    if (isMobile) {
      toast.info('移动端暂不支持手势控制，请使用触摸操作');
      return;
    }
    setGestureEnabled(true);
    setShowGestureHint(true);
    await new Promise((r) => setTimeout(r, 200));
    await startCamera();
  }, [isMobile, startCamera]);

  const handleDisableGesture = useCallback(() => {
    setGestureEnabled(false);
    setShowGestureHint(false);
    stopCamera();
    resetGestures();
    setLatestGesture(null);
  }, [stopCamera, resetGestures]);

  // ─── Manual carousel controls (non-gesture users) ───
  const handleManualToggle = useCallback(() => {
    setCarouselPhase((prev) => (prev === 'rotating' ? 'idle' : 'rotating'));
  }, []);

  const handleManualSelect = useCallback(() => {
    handleCardSelect();
  }, [handleCardSelect]);

  return (
    <main className="relative flex-1 flex flex-col items-center min-h-screen overflow-hidden">
      <Starfield />

      {/* ─── Header ─── */}
      <header className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔮</span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-300 to-purple-400 bg-clip-text text-transparent">
                星辰之镜
              </h1>
              <p className="text-xs text-purple-400/50 tracking-wider">AI Tarot · 智慧解读</p>
            </div>
          </div>

          {phase === 'WELCOME' && (
            <div className="flex gap-2">
              {SPREAD_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSpreadType(opt.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    spreadType === opt.key
                      ? 'bg-purple-600/40 border border-purple-400/40 text-purple-200'
                      : 'bg-slate-800/40 border border-slate-700/30 text-slate-400 hover:text-purple-300'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          )}

          {/* Progress indicator during selection */}
          {phase === 'CARD_SELECTION' && (
            <div className="text-purple-300/70 text-sm">
              已选 {spreadCards.length}/{getSpread(spreadType).slotCount} 张
            </div>
          )}
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 pb-32">
        <AnimatePresence mode="wait">
          {/* WELCOME */}
          {phase === 'WELCOME' && (
            <motion.div
              key="welcome"
              className="flex flex-col items-center gap-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                <span className="text-8xl md:text-9xl">🔮</span>
              </motion.div>
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-purple-100">
                  塔罗的智慧，<br />
                  <span className="bg-gradient-to-r from-amber-300 to-purple-400 bg-clip-text text-transparent">
                    AI为你解读
                  </span>
                </h2>
                <p className="text-purple-300/60 max-w-md mx-auto leading-relaxed">
                  {isMobile
                    ? '选择牌阵后，点击卡牌选择。DeepSeek AI 为你解读。'
                    : '🙏祈祷=旋转 · 🖐️张手=选择'}
                </p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <motion.button
                  onClick={handleStart}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-lg shadow-lg shadow-purple-900/30 border border-purple-400/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  ✨ 开始占卜
                </motion.button>
                {!isMobile && (
                  <button
                    onClick={handleEnableGesture}
                    className="text-xs text-purple-400/50 hover:text-purple-300 transition-colors"
                  >
                    👋 启用手势控制模式
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* SHUFFLING */}
          {phase === 'SHUFFLING' && (
            <motion.div
              key="shuffling"
              className="flex flex-col items-center gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CardDeck isShuffling={true} onShuffleComplete={handleShuffleComplete} />
              <p className="text-purple-300/60 text-sm animate-pulse">星辰正在洗牌...</p>
            </motion.div>
          )}

          {/* CARD_SELECTION — 78-card 3D carousel */}
          {phase === 'CARD_SELECTION' && (
            <motion.div
              key="selection"
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TarotCarousel
                phase={carouselPhase}
                onPauseChange={handlePauseChange}
                selectedCards={spreadCards.map((c) => c.card.id)}
                orientations={new Map(spreadCards.map(c => [c.card.id, c.orientation]))}
                onImageReady={(ready) => { imagesReadyRef.current = ready; }}
              />

              {/* Manual controls for non-gesture users */}
              {!gestureEnabled && (
                <div className="flex gap-3 justify-center mt-2">
                  <button
                    onClick={handleManualToggle}
                    className="px-4 py-2 rounded-xl bg-slate-800/60 border border-purple-500/20 text-purple-300 hover:bg-slate-700/60 transition-colors text-sm"
                  >
                    {carouselPhase === 'rotating' ? '⏸ 停止' : '▶ 旋转'}
                  </button>
                  <button
                    onClick={handleManualSelect}
                    className="px-4 py-2 rounded-xl bg-amber-600/30 border border-amber-500/30 text-amber-300 hover:bg-amber-500/40 transition-colors text-sm"
                  >
                    🖐️ 选择此牌
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* READING */}
          {phase === 'READING' && (
            <motion.div key="reading" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TarotSpread
                spread={getSpread(spreadType)}
                selectedCards={spreadCards}
                revealedCards={revealedCards}
                cursor={-1}
              />
              <ReadingPanel completion={reading} isLoading={isReading} isVisible={true} />
              {isReading && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => { stopReading(); setPhase('COMPLETE'); }}
                    className="text-xs text-purple-400/50 hover:text-purple-300 transition-colors"
                  >
                    跳过 → 直接看结果
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* COMPLETE / CHAT_OPEN */}
          {(phase === 'COMPLETE' || phase === 'CHAT_OPEN') && (
            <motion.div key="complete" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <TarotSpread
                spread={getSpread(spreadType)}
                selectedCards={spreadCards}
                revealedCards={revealedCards}
                cursor={-1}
              />
              <ReadingPanel completion={reading} isLoading={false} isVisible={true} />
              {phase === 'CHAT_OPEN' ? (
                <ChatPanel
                  messages={chatMessages}
                  input={chatInput}
                  isLoading={isChatLoading}
                  isVisible={true}
                  onInputChange={handleChatInputChange}
                  onSubmit={handleChatSubmit}
                  onClose={() => setPhase('COMPLETE')}
                />
              ) : (
                <div className="text-center mt-6">
                  <button onClick={handleOpenChat} className="px-6 py-2.5 rounded-xl bg-purple-600/30 border border-purple-400/30 text-purple-200 text-sm font-medium hover:bg-purple-500/40 transition-all">
                    💬 追问星辰之镜
                  </button>
                </div>
              )}
              <div className="text-center mt-4">
                <button onClick={doReset} className="text-xs text-purple-400/40 hover:text-purple-300 transition-colors">
                  🔄 开始新的占卜
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Gesture Overlay ─── */}
      <GestureOverlay
        videoRef={videoRef}
        isEnabled={gestureEnabled}
        isLoading={cameraLoading}
        error={cameraError}
        currentGesture={latestGesture}
        onEnable={handleEnableGesture}
        onDisable={handleDisableGesture}
      />

      {/* ─── Gesture Tutorial ─── */}
      <GestureHint isVisible={showGestureHint} onDismiss={() => setShowGestureHint(false)} />

      {/* ─── Footer ─── */}
      <footer className="relative z-10 w-full text-center py-4">
        <p className="text-xs text-purple-500/30">星辰之镜 · AI Tarot · Powered by DeepSeek</p>
      </footer>
    </main>
  );
}

/** Animated starfield — client-side only to avoid hydration mismatch */
function Starfield() {
  const [stars, setStars] = useState<Array<{ left: string; top: string; width: string; height: string; duration: string; delay: string }>>([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 50 }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${Math.random() * 2 + 1}px`,
        height: `${Math.random() * 2 + 1}px`,
        duration: `${Math.random() * 3 + 2}`,
        delay: `${Math.random() * 5}`,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-800/5 rounded-full blur-3xl" />
      {stars.map((s, i) => (
        <div key={i} className="star" style={{ left: s.left, top: s.top, width: s.width, height: s.height, '--duration': `${s.duration}s`, '--delay': `${s.delay}s` } as React.CSSProperties} />
      ))}
    </div>
  );
}
