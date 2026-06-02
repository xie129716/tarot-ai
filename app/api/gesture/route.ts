import { z } from 'zod';
import { recognizeGesture } from '@/lib/ai/baidu-gesture';

const requestSchema = z.object({
  image: z.string().min(1).describe('Base64-encoded image'),
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

    if (!process.env.BAIDU_API_KEY || !process.env.BAIDU_SECRET_KEY) {
      return Response.json({
        gesture: null, confidence: 0, className: 'unconfigured', bbox: null,
        message: 'Baidu API not configured',
      });
    }

    let result;
    try {
      result = await recognizeGesture(parsed.data.image);
    } catch (err: any) {
      if (err.message?.includes('18') || err.message?.includes('QPS')) {
        return Response.json(
          { gesture: null, confidence: 0, className: 'rate_limited', bbox: null },
          { status: 429 }
        );
      }
      return Response.json({ error: err.message }, { status: 500 });
    }

    return Response.json({
      gesture: result.gesture,
      confidence: result.confidence,
      className: result.className,
      bbox: result.bbox,
    });
  } catch (error: any) {
    console.error('[api/gesture] Error:', error.message);
    return Response.json({ error: 'Gesture recognition failed' }, { status: 500 });
  }
}
