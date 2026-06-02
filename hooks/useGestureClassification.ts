'use client';

import { useRef, useCallback } from 'react';
import { GestureType } from '@/lib/gestures/types';
import type { GestureEvent } from '@/lib/gestures/types';
import type { GestureApiResult } from './useHandTracking';

interface UseGestureClassificationOptions {
  /** Called when gesture changes (not on every frame). Null = no gesture. */
  onGesture?: (event: GestureEvent | null) => void;
}

interface UseGestureClassificationReturn {
  processResult: (result: GestureApiResult) => void;
  reset: () => void;
}

/**
 * Converts Baidu API results into app gesture events.
 *
 * Key behavior: gesture state PERSISTS between detection cycles.
 * - A gesture only "changes" when a new confirmed gesture differs from the last.
 * - Null results require 2 consecutive frames before firing (hysteresis).
 * - This prevents the carousel from stopping during the ~300ms gap
 *   between Baidu API calls while the user is holding a gesture.
 */
export function useGestureClassification({
  onGesture,
}: UseGestureClassificationOptions = {}): UseGestureClassificationReturn {
  const lastFiredGestureRef = useRef<GestureType | null>(null);
  const nullCountRef = useRef(0);
  const onGestureRef = useRef(onGesture);
  onGestureRef.current = onGesture;

  const NULL_THRESHOLD = 2; // ~1s no-hand before releasing (2 frames × 520ms)

  const processResult = useCallback((result: GestureApiResult) => {
    const { gesture } = result;

    // ─── Case 1: Same gesture as last fired → do nothing (persist) ───
    if (gesture === lastFiredGestureRef.current) {
      nullCountRef.current = 0;
      return;
    }

    // ─── Case 2: Null result → accumulate, only fire after threshold ───
    if (!gesture) {
      nullCountRef.current++;
      if (nullCountRef.current >= NULL_THRESHOLD && lastFiredGestureRef.current !== null) {
        // DEBUG: suppress
        // console.log('[gesture] No gesture for', NULL_THRESHOLD, 'frames → releasing');
        lastFiredGestureRef.current = null;
        onGestureRef.current?.(null);
      }
      return;
    }

    // ─── Case 3: New/different gesture → fire immediately ───
    nullCountRef.current = 0;
    lastFiredGestureRef.current = gesture;

    const event: GestureEvent = {
      type: gesture,
      confidence: result.confidence,
      hand: 'Right',
    };

    // DEBUG: suppress
    // console.log(`[gesture] Fired: ${gesture} (Baidu: ${result.className}, ...)` );
    onGestureRef.current?.(event);
  }, []);

  const reset = useCallback(() => {
    lastFiredGestureRef.current = null;
    nullCountRef.current = 0;
  }, []);

  return { processResult, reset };
}
