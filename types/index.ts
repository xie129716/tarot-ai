// ─── Shared Type Definitions ───

export type ReadingPhase =
  | 'WELCOME'
  | 'SHUFFLING'
  | 'CARD_SELECTION'
  | 'READING'
  | 'COMPLETE'
  | 'CHAT_OPEN';

/** Sub-states within CARD_SELECTION for the carousel */
export type CarouselPhase = 'idle' | 'rotating';

export interface TarotCard {
  id: number;
  name: string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  number?: number;
  keywords: string[];
  meaningUpright: string;
  meaningReversed: string;
  symbolism: string;
  imagePath: string;
}

export interface CardSelection {
  card: TarotCard;
  position: string;
  orientation: 'upright' | 'reversed';
}

export interface SpreadDefinition {
  name: string;
  description: string;
  slotCount: number;
  positions: SpreadPosition[];
}

export interface SpreadPosition {
  index: number;
  label: string;
  description: string;
  gridArea: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ReadingContext {
  cards: CardSelection[];
  spreadType: string;
  reading: string;
}
