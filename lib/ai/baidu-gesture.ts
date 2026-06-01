/**
 * Baidu Cloud Gesture Recognition API client.
 *
 * API docs: https://cloud.baidu.com/doc/IMAGE/s/1k7kxdexe
 *
 * Flow:
 * 1. Get access_token via OAuth (API Key + Secret Key)
 * 2. POST base64-encoded image to gesture endpoint
 * 3. Map Baidu classnames to our app GestureType
 */

import { GestureType } from '@/lib/gestures/types';

// ─── Baidu API endpoints ───
const BAIDU_OAUTH_URL = 'https://aip.baidubce.com/oauth/2.0/token';
const BAIDU_GESTURE_URL = 'https://aip.baidubce.com/rest/2.0/image-classify/v1/gesture';

// ─── Token cache ───
let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const apiKey = process.env.BAIDU_API_KEY;
  const secretKey = process.env.BAIDU_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error('BAIDU_API_KEY and BAIDU_SECRET_KEY must be set in environment');
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: apiKey,
    client_secret: secretKey,
  });

  const response = await fetch(BAIDU_OAUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Baidu OAuth failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`Baidu OAuth error: ${data.error_description}`);
  }

  cachedToken = data.access_token;
  // Token expires in `expires_in` seconds, cache for 90% of that time
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  console.log('[baidu-gesture] Token obtained, expires in', data.expires_in, 's');
  return cachedToken!;
}

// ─── Baidu classname → App GestureType mapping ───
// Interaction model:
//   Prayer → cards rotate
//   Open palm (Five/Palm_up) → select card
//   OK → select card (alternative)
const BAIDU_TO_GESTURE: Record<string, GestureType> = {
  Prayer: GestureType.PRAYER,         // 祈祷 → 开始/继续旋转卡牌
  Five: GestureType.OPEN_PALM,        // 数字5/张开手掌 → 确认选择
  Palm_up: GestureType.OPEN_PALM,     // 掌心向上 → 确认选择
  Fist: GestureType.FIST,             // 拳头 → 备用（无操作）
};

export interface BaiduGestureResult {
  gesture: GestureType | null;
  confidence: number;
  className: string;
  bbox: { left: number; top: number; width: number; height: number } | null;
}

/**
 * Recognize gesture from a base64-encoded image.
 * Called by our /api/gesture endpoint.
 */
export async function recognizeGesture(
  imageBase64: string
): Promise<BaiduGestureResult> {
  const token = await getAccessToken();

  const params = new URLSearchParams({
    image: imageBase64,
  });

  const response = await fetch(`${BAIDU_GESTURE_URL}?access_token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    console.error('[baidu-gesture] API error:', response.status);
    throw new Error(`Baidu API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('[baidu-gesture] Response:', JSON.stringify(data));

  if (!data.result || data.result_num === 0) {
    return { gesture: null, confidence: 0, className: 'none', bbox: null };
  }

  // Find the first hand gesture result (skip Face detections)
  const handResult = data.result.find(
    (r: any) => r.classname !== 'Face' && r.classname !== 'other'
  );

  if (!handResult) {
    return { gesture: null, confidence: 0, className: 'none', bbox: null };
  }

  const className: string = handResult.classname;
  const gesture = BAIDU_TO_GESTURE[className] ?? null;
  const confidence: number = handResult.probability;

  return {
    gesture,
    confidence,
    className,
    bbox: {
      left: handResult.left,
      top: handResult.top,
      width: handResult.width,
      height: handResult.height,
    },
  };
}
