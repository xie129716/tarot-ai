import { deepseek } from '@ai-sdk/deepseek';
import { streamText, tool, stepCountIs } from 'ai';
import { z } from 'zod';
import { buildChatSystemPrompt } from '@/lib/ai/prompts';
import { trimConversation } from '@/lib/ai/context';
import { getCardDetail, getSpreadPositionMeaning } from '@/lib/ai/tools';

const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
  readingContext: z.object({
    cards: z.array(
      z.object({
        name: z.string(),
        position: z.string(),
        orientation: z.enum(['upright', 'reversed']),
      })
    ),
    spreadType: z.string(),
    reading: z.string(),
  }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { messages, readingContext } = parsed.data;

    // Build the system prompt with the full reading context preserved
    const systemPrompt = buildChatSystemPrompt(readingContext);

    // Trim conversation to ~8K tokens to manage context window
    const trimmedMessages = trimConversation(messages, 7000);

    const result = streamText({
      model: deepseek('deepseek-v4-pro'),
      system: systemPrompt,
      messages: trimmedMessages as { role: 'user' | 'assistant'; content: string }[],
      maxOutputTokens: 1000,
      temperature: 0.7,
      tools: {
        getCardDetail: tool({
          description:
            '获取某张塔罗牌的详细含义、关键词和象征意义。当需要更深入了解一张牌时使用。',
          inputSchema: z.object({
            cardName: z.string().describe('塔罗牌的名称，例如 "愚者"、"权杖王牌"'),
            orientation: z
              .enum(['upright', 'reversed'])
              .describe('牌的方向：正位(upright)或逆位(reversed)'),
          }),
          execute: async (input) => {
            const { cardName, orientation } = input as {
              cardName: string;
              orientation: 'upright' | 'reversed';
            };
            const detail = getCardDetail(cardName, orientation);
            if (!detail) return `未找到名为"${cardName}"的塔罗牌。`;
            return JSON.stringify(detail, null, 2);
          },
        }),
        getSpreadPositionMeaning: tool({
          description:
            '获取牌阵中特定位置的含义。当需要解释某张牌在牌阵中的角色时使用。',
          inputSchema: z.object({
            spreadType: z.string().describe('牌阵类型，例如 "past-present-future"'),
            position: z.string().describe('位置名称，例如 "过去"、"现在"'),
          }),
          execute: async (input) => {
            const { spreadType, position } = input as {
              spreadType: string;
              position: string;
            };
            const meaning = getSpreadPositionMeaning(spreadType, position);
            if (!meaning) return `未找到该位置的信息。`;
            return JSON.stringify(meaning, null, 2);
          },
        }),
      },
      stopWhen: stepCountIs(3),
      onFinish({ usage }) {
        console.log(
          '[token-usage] chat:',
          JSON.stringify({
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
          })
        );
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('[api/chat] Error:', error);
    return Response.json(
      { error: 'The spirits are unclear. Please try again.' },
      { status: 500 }
    );
  }
}
