import { GestureType } from './types';
import type { HandLandmark, HandState, GestureEvent, GestureThresholds } from './types';
import { GESTURE_THRESHOLDS } from './constants';

export function computeWristVelocity(history: HandState[]): { vx: number; vy: number } {
  if (history.length < 2) return { vx: 0, vy: 0 };

  const recent = history.slice(-5);
  const first = recent[0].landmarks[0];
  const last = recent[recent.length - 1].landmarks[0];

  return {
    vx: last.x - first.x,
    vy: last.y - first.y,
  };
}

function angleBetween(a: HandLandmark, b: HandLandmark, c: HandLandmark): number {
  const ab = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const cb = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
  const magAB = Math.sqrt(ab.x ** 2 + ab.y ** 2 + ab.z ** 2);
  const magCB = Math.sqrt(cb.x ** 2 + cb.y ** 2 + cb.z ** 2);
  if (magAB === 0 || magCB === 0) return 180;
  const cos = Math.max(-1, Math.min(1, dot / (magAB * magCB)));
  return (Math.acos(cos) * 180) / Math.PI;
}

function isFingerExtended(
  landmarks: HandLandmark[],
  tipIdx: number,
  pipIdx: number,
  mcpIdx: number,
  threshold: number
): boolean {
  const angle = angleBetween(landmarks[mcpIdx], landmarks[pipIdx], landmarks[tipIdx]);
  return angle > threshold;
}

function computeFingerExtensions(
  landmarks: HandLandmark[],
  threshold: number
): Record<string, boolean> {
  return {
    thumb: isFingerExtended(landmarks, 4, 3, 2, 140), // thumb uses laxer threshold
    index: isFingerExtended(landmarks, 8, 6, 5, threshold),
    middle: isFingerExtended(landmarks, 12, 10, 9, threshold),
    ring: isFingerExtended(landmarks, 16, 14, 13, threshold),
    pinky: isFingerExtended(landmarks, 20, 18, 17, threshold),
  };
}

function pinchDistance(landmarks: HandLandmark[]): number {
  const thumb = landmarks[4];
  const index = landmarks[8];
  return Math.sqrt((thumb.x - index.x) ** 2 + (thumb.y - index.y) ** 2);
}

function allTipsNearPalm(landmarks: HandLandmark[], threshold: number): boolean {
  const palm = landmarks[0];
  const tips = [4, 8, 12, 16, 20];
  return tips.every((idx) => {
    const tip = landmarks[idx];
    const dist = Math.sqrt((tip.x - palm.x) ** 2 + (tip.y - palm.y) ** 2);
    return dist < threshold;
  });
}

export function classifyGesture(
  history: HandState[],
  thresholds: GestureThresholds = GESTURE_THRESHOLDS
): GestureEvent | null {
  if (history.length === 0) return null;

  const current = history[history.length - 1];
  const { landmarks } = current;

  const { vx, vy } = computeWristVelocity(history);
  const fingers = computeFingerExtensions(landmarks, thresholds.fingerExtensionAngleDeg);
  const pinch = pinchDistance(landmarks);
  const fist = allTipsNearPalm(landmarks, thresholds.grabTipRadius);

  // OPEN_PALM: all 5 fingers extended
  const allExtended = Object.values(fingers).every(Boolean);
  if (allExtended) {
    return { type: GestureType.OPEN_PALM, confidence: 0.9, hand: current.handedness };
  }

  // FIST: all tips near palm
  if (fist) {
    return { type: GestureType.FIST, confidence: 0.85, hand: current.handedness };
  }

  // OK gesture: thumb and index form a circle
  if (pinch < 0.05 && !fingers.middle && !fingers.ring && !fingers.pinky) {
    return { type: GestureType.OK, confidence: 0.8, hand: current.handedness };
  }

  // PRAYER: palms together approximation — both hands close
  // (In practice this is handled by Baidu API; classifier is a fallback)

  return null;
}

/**
 * Detect sustained gesture hold (unused with Baidu API — kept as reference).
 * Baidu API provides gesture classification directly, so this client-side
 * detector is a fallback only.
 */
export function detectHold(
  gestureHistory: GestureEvent[],
  targetType: GestureType,
  holdDurationMs: number = GESTURE_THRESHOLDS.pointHoldDurationMs
): boolean {
  if (gestureHistory.length < 2) return false;
  const recent = gestureHistory.filter((g) => g.type === targetType);
  if (recent.length < gestureHistory.length * 0.7) return false;
  const duration = gestureHistory.length * (1000 / 30);
  return duration > holdDurationMs;
}
