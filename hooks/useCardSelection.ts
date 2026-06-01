'use client';

import { useState, useCallback, useRef } from 'react';
import type { CardSelection, SpreadDefinition } from '@/types';
import { drawCards } from '@/lib/tarot/cards';
import { getSpread } from '@/lib/tarot/spreads';

interface UseCardSelectionReturn {
  cursor: number;
  selectedCards: CardSelection[];
  revealedCards: boolean[];
  spread: SpreadDefinition;
  isComplete: boolean;
  moveCursor: (direction: 'left' | 'right') => void;
  revealCard: () => void;
  revealCardAtIndex: (index: number) => void;
  reset: (newSpreadType?: string) => void;
}

export function useCardSelection(
  spreadType: string = 'past-present-future'
): UseCardSelectionReturn {
  const [spreadKey, setSpreadKey] = useState(spreadType);
  const spread = getSpread(spreadKey);

  const drawnRef = useRef(
    drawCards(spread.slotCount)
  );

  const [cursor, setCursor] = useState(0);
  const [revealedCards, setRevealedCards] = useState<boolean[]>(
    new Array(spread.slotCount).fill(false)
  );

  // Re-initialize if spread type changes
  if (spreadKey !== spreadType) {
    setSpreadKey(spreadType);
    const newSpread = getSpread(spreadType);
    drawnRef.current = drawCards(newSpread.slotCount);
    setCursor(0);
    setRevealedCards(new Array(newSpread.slotCount).fill(false));
  }

  const selectedCards: CardSelection[] = drawnRef.current.map((d, i) => ({
    card: d.card,
    position: spread.positions[i]?.label ?? `位置${i + 1}`,
    orientation: d.orientation,
  }));

  const isComplete = revealedCards.every(Boolean);

  const moveCursor = useCallback((direction: 'left' | 'right') => {
    setCursor((prev) => {
      const max = spread.slotCount - 1;
      if (direction === 'left') return Math.max(0, prev - 1);
      return Math.min(max, prev + 1);
    });
  }, [spread.slotCount]);

  const revealCard = useCallback(() => {
    setRevealedCards((prev) => {
      const next = [...prev];
      // Reveal the first unrevealed card
      const idx = next.findIndex((r) => !r);
      if (idx !== -1) next[idx] = true;
      return next;
    });
  }, []);

  const revealCardAtIndex = useCallback((index: number) => {
    setRevealedCards((prev) => {
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = true;
      return next;
    });
  }, []);

  const reset = useCallback((newSpreadType?: string) => {
    const key = newSpreadType ?? spreadKey;
    const s = getSpread(key);
    setSpreadKey(key);
    drawnRef.current = drawCards(s.slotCount);
    setCursor(0);
    setRevealedCards(new Array(s.slotCount).fill(false));
  }, [spreadKey]);

  return {
    cursor,
    selectedCards,
    revealedCards,
    spread,
    isComplete,
    moveCursor,
    revealCard,
    revealCardAtIndex,
    reset,
  };
}
