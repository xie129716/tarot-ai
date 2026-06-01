'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import type { TarotCard as TarotCardType } from '@/types';

interface TarotCardProps {
  card: TarotCardType;
  orientation: 'upright' | 'reversed';
  isRevealed: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick?: () => void;
  className?: string;
}

export default function TarotCard({
  card,
  orientation,
  isRevealed,
  isSelected,
  isHighlighted,
  onClick,
  className,
}: TarotCardProps) {
  return (
    <motion.div
      className={cn(
        'relative w-[140px] h-[220px] md:w-[160px] md:h-[260px] cursor-pointer',
        'perspective-1000',
        className
      )}
      onClick={onClick}
      animate={{
        scale: isHighlighted ? 1.08 : isSelected ? 0.95 : 1,
        boxShadow: isHighlighted
          ? '0 0 30px rgba(218, 165, 32, 0.6), 0 0 60px rgba(218, 165, 32, 0.3)'
          : isSelected
          ? '0 0 20px rgba(180, 130, 255, 0.5)'
          : '0 4px 20px rgba(0, 0, 0, 0.3)',
        borderColor: isHighlighted
          ? 'rgba(218, 165, 32, 0.8)'
          : isSelected
          ? 'rgba(180, 130, 255, 0.8)'
          : 'rgba(255, 255, 255, 0.15)',
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Card Container with 3D Flip */}
      <motion.div
        className="w-full h-full rounded-xl overflow-hidden border-2"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0.0, 0.2, 1] }}
      >
        {/* Front Face (Card Back) */}
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">✦</div>
            <div className="w-16 h-16 mx-auto rounded-full border-2 border-purple-400/50 flex items-center justify-center">
              <span className="text-purple-300 text-2xl">☽</span>
            </div>
            <div className="mt-3 text-purple-400/70 text-xs tracking-[0.3em] uppercase">
              塔罗
            </div>
            {/* Mystical border pattern */}
            <div className="absolute inset-2 border border-purple-500/20 rounded-lg pointer-events-none" />
            <div className="absolute inset-4 border border-purple-400/10 rounded-md pointer-events-none" />
          </div>
        </div>

        {/* Back Face (Card Front / RWS Image — shows when revealed) */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Orientation indicator */}
          {orientation === 'reversed' && (
            <div className="absolute top-2 right-2 z-10 text-xs text-amber-400/70 bg-amber-400/10 px-1.5 py-0.5 rounded">
              ↻ 逆位
            </div>
          )}

          {/* RWS Card Image — full bleed */}
          <img
            src={card.imagePath}
            alt={card.name}
            className={cn(
              'absolute inset-0 w-full h-full object-cover',
              orientation === 'reversed' && 'rotate-180'
            )}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />

          {/* Card name overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent pt-8 pb-2 px-2">
            <h3 className="text-xs md:text-sm font-bold text-center text-purple-100">
              {card.name}
            </h3>
            <p className="text-[9px] md:text-[10px] text-purple-300/60 text-center leading-tight">
              {card.keywords.slice(0, 3).join(' · ')}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function getMajorArcanaEmoji(id: number): string {
  const emojis: Record<number, string> = {
    0: '🌟', 1: '🪄', 2: '🌙', 3: '👑', 4: '🏰',
    5: '⛪', 6: '💕', 7: '⚔️', 8: '🦁', 9: '🏮',
    10: '🎡', 11: '⚖️', 12: '🙃', 13: '💀', 14: '🏺',
    15: '😈', 16: '⚡', 17: '⭐', 18: '🌕', 19: '☀️',
    20: '📯', 21: '🌍',
  };
  return emojis[id] ?? '🔮';
}

function getSuitEmoji(suit?: string): string {
  switch (suit) {
    case 'wands': return '🪵';
    case 'cups': return '🏆';
    case 'swords': return '🗡️';
    case 'pentacles': return '🪙';
    default: return '🔮';
  }
}
