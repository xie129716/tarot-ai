'use client';

import { useRef, useCallback } from 'react';
import { GestureType } from '@/lib/gestures/types';
import type { GestureEvent } from '@/lib/gestures/types';
import type { DetectedHand } from './useHandTracking';

interface UseGestureClassificationOptions {
  onGesture?: (event: GestureEvent | null) => void;
}

interface UseGestureClassificationReturn {
  processHands: (hands: DetectedHand[]) => void;
  reset: () => void;
}

/**
 * Real-time gesture classification from MediaPipe hand landmarks.
 *
 * Detected gestures (30fps, browser-side, zero latency):
 *   PRAYER — both palms close together
 *   OPEN_PALM — all fingers extended (select card)
 *   FIST — fingers curled (select card)
 */
export function useGestureClassification({
  onGesture,
}: UseGestureClassificationOptions = {}): UseGestureClassificationReturn {
  const lastFiredRef = useRef<GestureType | null>(null);
  const lastFireTimeRef = useRef(0);
  const nullCountRef = useRef(0);
  const onGestureRef = useRef(onGesture);
  onGestureRef.current = onGesture;

  const NULL_THRESHOLD = 8; // ~250ms of no gesture before firing null

  const processHands = useCallback((hands: DetectedHand[]) => {
    const now = Date.now();
    const gesture = classifyFromLandmarks(hands);

    // Same gesture → persist (don't re-fire too fast)
    if (gesture === lastFiredRef.current) {
      nullCountRef.current = 0;
      if (gesture && now - lastFireTimeRef.current < 1200) return; // debounce 1.2s for non-PRAYER
      if (gesture === GestureType.PRAYER && now - lastFireTimeRef.current < 200) return; // PRAYER re-fires every 200ms
      lastFireTimeRef.current = now;
      if (gesture) onGestureRef.current?.({ type: gesture, confidence: 0.9, hand: 'Right' });
      return;
    }

    // No hands → accumulate nulls
    if (!gesture) {
      nullCountRef.current++;
      if (nullCountRef.current >= NULL_THRESHOLD && lastFiredRef.current !== null) {
        lastFiredRef.current = null;
        onGestureRef.current?.(null);
      }
      return;
    }

    // New/different gesture → fire immediately
    nullCountRef.current = 0;
    lastFiredRef.current = gesture;
    lastFireTimeRef.current = now;

    console.log('[gesture]', gesture, '| hands:', hands.length,
      '| fingers:', JSON.stringify(getFingerDebug(hands[0])));
    onGestureRef.current?.({ type: gesture, confidence: 0.9, hand: 'Right' });
  }, []);

  const reset = useCallback(() => {
    lastFiredRef.current = null;
    nullCountRef.current = 0;
  }, []);

  return { processHands, reset };
}

// ─── Landmark-based gesture classifier ───

function classifyFromLandmarks(hands: DetectedHand[]): GestureType | null {
  if (hands.length === 0) return null;

  // PRAYER: BOTH hands detected, wrists very close, palms roughly facing
  if (hands.length >= 2) {
    const w0 = hands[0]!.landmarks[0]!;
    const w1 = hands[1]!.landmarks[0]!;
    const dist = Math.hypot(w0.x - w1.x, w0.y - w1.y);
    // Both middle fingertips should also be close (hands pressed together)
    const m0 = hands[0]!.landmarks[12]!;
    const m1 = hands[1]!.landmarks[12]!;
    const tipDist = Math.hypot(m0.x - m1.x, m0.y - m1.y);
    if (dist < 0.18 && tipDist < 0.22) {
      return GestureType.PRAYER;
    }
  }

  // Single-hand gestures (use the more confidently detected hand)
  const hand = hands[0]!;
  const lm = hand.landmarks;
  const fingers = getFingerStates(lm);

  // OPEN_PALM (Five): all 5 fingers extended → select card
  if (Object.values(fingers).every((f) => f === true)) return GestureType.OPEN_PALM;

  // ONE: index extended, others curled → rotate
  if (fingers.index === true && fingers.middle === false && fingers.ring === false && fingers.pinky === false) {
    return GestureType.PRAYER; // Map to rotation
  }

  return null;
}

/**
 * Determine if each finger is extended.
 * Returns true=extended, false=curled, null=ambiguous.
 * Uses angle at PIP joint for more reliable detection.
 */
function getFingerStates(lm: Array<{ x: number; y: number; z: number }>): Record<string, boolean | null> {
  const ANGLE_THRESHOLD = 140; // degrees — finger is "extended" if PIP angle > this
  return {
    thumb: isThumbExtended(lm),
    index: isExtended(lm, 8, 6, 5),
    middle: isExtended(lm, 12, 10, 9),
    ring: isExtended(lm, 16, 14, 13),
    pinky: isExtended(lm, 20, 18, 17),
  };
}

function isExtended(lm: Array<{ x: number; y: number; z: number }>, tip: number, pip: number, mcp: number): boolean {
  const a = angleBetween(lm[mcp]!, lm[pip]!, lm[tip]!);
  // Also check that the fingertip is ABOVE the PIP (y is smaller = higher on screen)
  const tipAbovePip = lm[tip]!.y < lm[pip]!.y;
  return a > 155 && tipAbovePip;
}

function isThumbExtended(lm: Array<{ x: number; y: number; z: number }>): boolean {
  // Thumb extended: tip is far from index finger MCP AND far from wrist
  const d1 = Math.hypot(lm[4]!.x - lm[5]!.x, lm[4]!.y - lm[5]!.y);
  const d2 = Math.hypot(lm[4]!.x - lm[0]!.x, lm[4]!.y - lm[0]!.y);
  return d1 > 0.2 && d2 > 0.2;
}

function getFingerDebug(hand?: DetectedHand): string {
  if (!hand) return 'none';
  const f = getFingerStates(hand.landmarks);
  const names = ['thumb','index','middle','ring','pinky'];
  return names.map(n => `${n[0]}:${f[n]?'1':'0'}`).join(' ');
}

function angleBetween(a: {x:number,y:number,z:number}, b: {x:number,y:number,z:number}, c: {x:number,y:number,z:number}): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const mag = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y);
  if (mag === 0) return 180;
  return (Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI;
}
