'use client';

import { motion, AnimatePresence } from 'framer-motion';
import TarotCard from './TarotCard';
import type { CardSelection, SpreadDefinition } from '@/types';
import { cn } from '@/lib/utils/cn';

interface TarotSpreadProps {
  spread: SpreadDefinition;
  selectedCards: CardSelection[];
  revealedCards: boolean[];
  cursor: number;
  onCardClick?: (index: number) => void;
  className?: string;
}

export default function TarotSpread({
  spread,
  selectedCards,
  revealedCards,
  cursor,
  onCardClick,
  className,
}: TarotSpreadProps) {
  const isSingle = spread.slotCount === 1;
  const isTriple = spread.slotCount === 3;
  const isCeltic = spread.slotCount === 10;

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-4 md:gap-6 flex-wrap',
        isSingle && 'flex-col',
        isTriple && 'flex-row',
        isCeltic && 'grid grid-cols-5 gap-3 max-w-3xl mx-auto',
        className
      )}
      style={
        isCeltic
          ? {
              gridTemplateAreas: `". . c3 . ." ". c1 c2 c4 ." ". c5 c6 c7 c8" ". . c9 c10 ."`,
            }
          : undefined
      }
    >
      {selectedCards.map((selection, index) => (
        <motion.div
          key={`${selection.position}-${index}`}
          style={isCeltic ? { gridArea: spread.positions[index]?.gridArea } : undefined}
          initial={{ opacity: 0, y: 50, rotateZ: -10 }}
          animate={{ opacity: 1, y: 0, rotateZ: 0 }}
          transition={{ delay: index * 0.15, type: 'spring', stiffness: 300 }}
        >
          {/* Position label (above card) */}
          <div className="text-center mb-2">
            <span className="text-xs text-purple-400/60 tracking-widest uppercase">
              {selection.position}
            </span>
          </div>

          <TarotCard
            card={selection.card}
            orientation={selection.orientation}
            isRevealed={revealedCards[index] ?? false}
            isSelected={revealedCards[index] ?? false}
            isHighlighted={cursor === index}
            onClick={() => onCardClick?.(index)}
          />

          {/* Position description (below card) */}
          <div className="text-center mt-2">
            <span className="text-[10px] text-purple-500/40">
              {spread.positions[index]?.description}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
