import { z } from 'zod';
import { getCardByName, ALL_CARDS } from '@/lib/tarot/cards';
import { getSpread, SPREADS } from '@/lib/tarot/spreads';
import type { TarotCard } from '@/types';

/**
 * Get detailed card meaning, used as a tool for function calling.
 * Allows the AI to look up card details on demand, reducing prompt size.
 */
export function getCardDetail(cardName: string, orientation: 'upright' | 'reversed'): {
  name: string;
  arcana: string;
  keywords: string[];
  meaning: string;
  symbolism: string;
} | null {
  const card = getCardByName(cardName);
  if (!card) return null;

  return {
    name: card.name,
    arcana: card.arcana === 'major' ? '大阿尔卡纳' : `小阿尔卡纳（${card.suit}）`,
    keywords: card.keywords,
    meaning: orientation === 'upright' ? card.meaningUpright : card.meaningReversed,
    symbolism: card.symbolism,
  };
}

/**
 * Get the meaning of a position within a spread.
 */
export function getSpreadPositionMeaning(spreadType: string, position: string): {
  spread: string;
  position: string;
  meaning: string;
} | null {
  const spread = getSpread(spreadType);
  const pos = spread.positions.find((p) => p.label === position);
  if (!pos) return null;

  return {
    spread: spread.name,
    position: pos.label,
    meaning: pos.description,
  };
}

/**
 * Search cards by keyword.
 */
export function searchCardsByKeyword(keyword: string): TarotCard[] {
  const lower = keyword.toLowerCase();
  return ALL_CARDS.filter((c) =>
    c.keywords.some((k) => k.includes(lower)) || c.name.includes(keyword)
  );
}

/**
 * List all available spreads.
 */
export function listSpreads(): Array<{ name: string; description: string; slotCount: number }> {
  return Object.entries(SPREADS).map(([key, s]) => ({
    name: key,
    description: s.description,
    slotCount: s.slotCount,
  }));
}

// ─── Tool Schemas (for AI SDK tool definitions) ───

export const getCardDetailSchema = z.object({
  cardName: z.string().describe('塔罗牌的名称，例如 "愚者"、"权杖王牌"'),
  orientation: z.enum(['upright', 'reversed']).describe('牌的方向：正位(upright)或逆位(reversed)'),
});

export const getSpreadPositionSchema = z.object({
  spreadType: z.string().describe('牌阵类型，例如 "past-present-future"'),
  position: z.string().describe('位置名称，例如 "过去"、"现在"'),
});
