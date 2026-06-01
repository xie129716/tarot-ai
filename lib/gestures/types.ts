export enum GestureType {
  NONE = 'NONE',
  /** Prayer (Baidu) — start/keep rotating the cards */
  PRAYER = 'PRAYER',
  /** OK (Baidu) — pause rotation, hover on current card */
  OK = 'OK',
  /** Fist (Baidu) — confirm selection */
  FIST = 'FIST',
  /** Generic open palm — reset / go back */
  OPEN_PALM = 'OPEN_PALM',
}

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandState {
  landmarks: HandLandmark[];
  handedness: 'Left' | 'Right';
  timestamp: number;
}

export interface GestureEvent {
  type: GestureType;
  confidence: number;
  hand: 'Left' | 'Right';
  targetIndex?: number;
}

export interface GestureThresholds {
  swipeVelocityX: number;
  pointHoldDurationMs: number;
  fingerExtensionAngleDeg: number;
  fingerCurlAngleDeg: number;
  grabTipRadius: number;
  debounceFrames: number;
}
