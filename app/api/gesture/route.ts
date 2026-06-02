/**
 * POST /api/gesture
 *
 * Receives a base64-encoded webcam frame, calls Baidu Cloud Gesture Recognition API,
 * and returns the classified gesture.
 *
 * Request: { image: string (base64) }
 * Response: { gesture: string | null, confidence: number, className: string, bbox: {...} | null }
 *
 * Demonstrates: third-party AI API integration, token management, server-side processing
 */
import { z } from 'zod';
import { recognizeGesture } from '@/lib/ai/baidu-gesture';

const requestSchema = z.object({
  image: z.string().min(1).describe('Base64-encoded image (without data:image prefix)'),
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

    // Check if Baidu credentials are configured
    if (!process.env.BAIDU_API_KEY || !process.env.BAIDU_SECRET_KEY) {
      console.warn('[api/gesture] Baidu credentials not configured, returning null');
      return Response.json({
        gesture: null,
        confidence: 0,
        className: 'unconfigured',
        bbox: null,
        message: 'Baidu API not configured. Set BAIDU_API_KEY and BAIDU_SECRET_KEY.',
      });
    }

    const result = await recognizeGesture(parsed.data.image).catch((err: Error) => {
      if (err.message.includes('18') || err.message.includes('QPS')) {
        return Response.json(
          { gesture: null, confidence: 0, className: 'rate_limited', bbox: null, error: 'rate_limited' },
          { status: 429 }
        );
      }
      throw err;
    });

    // If catch returned a Response (rate limited), forward it
    if (result instanceof Response) return result;
      gesture: result.gesture,
      confidence: result.confidence,
      className: result.className,
      bbox: result.bbox,
    });
  } catch (error: any) {
    console.error('[api/gesture] Error:', error.message);
    return Response.json(
      { error: error.message || 'Gesture recognition failed' },
      { status: 500 }
    );
  }
}
