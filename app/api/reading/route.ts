import { deepseek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';
import { z } from 'zod';
import { buildReadingPrompt, formatCardsForPrompt } from '@/lib/ai/prompts';
import { getSpread } from '@/lib/tarot/spreads';
import { getCardByName } from '@/lib/tarot/cards';

const requestSchema = z.object({
  cards: z.array(
    z.object({
      name: z.string().min(1),
      position: z.string().min(1),
      orientation: z.enum(['upright', 'reversed']),
    })
  ),
  spreadType: z.string().min(1),
  question: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { cards, spreadType, question } = parsed.data;
    const spread = getSpread(spreadType);

    // Resolve full card data from card names
    const resolvedCards = cards.map((c) => {
      const card = getCardByName(c.name);
      if (!card) throw new Error(`Unknown card: ${c.name}`);
      return { card, position: c.position, orientation: c.orientation };
    });

    // Build the layered system prompt
    const systemPrompt = buildReadingPrompt(spreadType, resolvedCards);

    // Build user message
    const userContent = question
      ? `我的问题是：${question}\n\n我抽到的牌：\n${formatCardsForPrompt(resolvedCards)}`
      : `我抽到的牌：\n${formatCardsForPrompt(resolvedCards)}`;

    const result = streamText({
      model: deepseek('deepseek-chat'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
      maxOutputTokens: 2000,
      temperature: 0.8,
      onFinish({ usage }) {
        console.log(
          '[token-usage] reading:',
          JSON.stringify({
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
          })
        );
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('[api/reading] Error:', error);
    return Response.json(
      { error: 'The spirits are unclear. Please try again.' },
      { status: 500 }
    );
  }
}
