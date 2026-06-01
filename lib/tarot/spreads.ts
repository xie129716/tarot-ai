import type { SpreadDefinition } from '@/types';

export const SPREADS: Record<string, SpreadDefinition> = {
  'single': {
    name: '单张指引',
    description: '抽一张牌，获得当下最需要的指引',
    slotCount: 1,
    positions: [
      { index: 0, label: '指引', description: '当下最需要的指引', gridArea: 'center' },
    ],
  },
  'past-present-future': {
    name: '过去·现在·未来',
    description: '三张牌分别揭示过去的影响、当下的状态与未来的可能',
    slotCount: 3,
    positions: [
      { index: 0, label: '过去', description: '曾影响你的事件与能量', gridArea: 'left' },
      { index: 1, label: '现在', description: '当前的状态与挑战', gridArea: 'center' },
      { index: 2, label: '未来', description: '潜在的发展方向', gridArea: 'right' },
    ],
  },
  'celtic-cross': {
    name: '凯尔特十字',
    description: '最经典的塔罗牌阵，全面解读你的处境',
    slotCount: 10,
    positions: [
      { index: 0, label: '现状', description: '当前的核心议题', gridArea: 'c1' },
      { index: 1, label: '阻碍', description: '横亘在前的挑战', gridArea: 'c2' },
      { index: 2, label: '根源', description: '潜意识中的基础', gridArea: 'c3' },
      { index: 3, label: '过去', description: '已逝的影响', gridArea: 'c4' },
      { index: 4, label: '目标', description: '可企及的高处', gridArea: 'c5' },
      { index: 5, label: '近未来', description: '即将到来之事', gridArea: 'c6' },
      { index: 6, label: '自我', description: '你当前的态度', gridArea: 'c7' },
      { index: 7, label: '环境', description: '周遭的影响', gridArea: 'c8' },
      { index: 8, label: '希望/恐惧', description: '内心的期盼或忧虑', gridArea: 'c9' },
      { index: 9, label: '结果', description: '最终的走向', gridArea: 'c10' },
    ],
  },
};

export function getSpread(name: string): SpreadDefinition {
  return SPREADS[name] ?? SPREADS['past-present-future'];
}
