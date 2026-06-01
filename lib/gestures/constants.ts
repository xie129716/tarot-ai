import type { GestureThresholds } from './types';

export const GESTURE_THRESHOLDS: GestureThresholds = {
  swipeVelocityX: 0.03,
  pointHoldDurationMs: 1500,
  fingerExtensionAngleDeg: 160,
  fingerCurlAngleDeg: 90,
  grabTipRadius: 0.08,
  debounceFrames: 3,
};
