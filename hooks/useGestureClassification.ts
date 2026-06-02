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

    console.log('[gesture]', gesture);
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

  // PRAYER: both hands present, wrists close together
  if (hands.length >= 2) {
    const w0 = hands[0]!.landmarks[0]!;
    const w1 = hands[1]!.landmarks[0]!;
    const dist = Math.sqrt((w0.x - w1.x) ** 2 + (w0.y - w1.y) ** 2);
    if (dist < 0.15) return GestureType.PRAYER;
  }

  // Single hand gestures
  const hand = hands[0]!;
  const lm = hand.landmarks;
  const fingers = getFingerStates(lm);

  // OPEN_PALM: all 5 fingers extended
  if (Object.values(fingers).every(Boolean)) return GestureType.OPEN_PALM;

  // FIST: all fingers curled
  if (Object.values(fingers).every((f) => !f)) return GestureType.FIST;

  // ONE (index only): just index extended
  if (fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
    return GestureType.PRAYER; // Map One → PRAYER (rotate)
  }

  return null;
}

/** Determine if each finger is extended (tip above PIP in y-axis) */
function getFingerStates(lm: Array<{ x: number; y: number; z: number }>): Record<string, boolean> {
  return {
    thumb: lm[4]!.x < lm[3]!.x, // thumb tip left of IP (for right hand)
    index: lm[8]!.y < lm[6]!.y,
    middle: lm[12]!.y < lm[10]!.y,
    ring: lm[16]!.y < lm[14]!.y,
    pinky: lm[20]!.y < lm[18]!.y,
  };
}
