'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface DetectedHand {
  landmarks: HandLandmark[];
  handedness: 'Left' | 'Right';
}

interface UseHandTrackingOptions {
  enabled: boolean;
  /** Called at ~30fps with detected hands */
  onHandsDetected?: (hands: DetectedHand[]) => void;
}

interface UseHandTrackingReturn {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function useHandTracking({
  enabled,
  onHandsDetected,
}: UseHandTrackingOptions): UseHandTrackingReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handLandmarkerRef = useRef<any>(null);
  const animFrameRef = useRef(0);
  const onHandsRef = useRef(onHandsDetected);
  onHandsRef.current = onHandsDetected;

  const stopCamera = useCallback(() => {
    console.log('[useHandTracking] Stopping camera...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLoaded(false);
  }, []);

  const detectLoop = useCallback(() => {
    const video = videoRef.current;
    const handLandmarker = handLandmarkerRef.current;
    if (!video || !handLandmarker || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const results = handLandmarker.detectForVideo(video, performance.now());
    if (results?.landmarks?.length > 0) {
      const hands: DetectedHand[] = results.landmarks.map(
        (lm: any, i: number) => ({
          landmarks: lm.map((p: any) => ({ x: p.x, y: p.y, z: p.z })),
          handedness: results.handedness?.[i]?.[0]?.categoryName ?? 'Right',
        })
      );
      onHandsRef.current?.(hands);
    } else {
      onHandsRef.current?.([]);
    }

    animFrameRef.current = requestAnimationFrame(detectLoop);
  }, []);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log('[useHandTracking] Starting camera + MediaPipe...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', '');
        videoRef.current.setAttribute('webkit-playsinline', '');
        // Safari needs the video in DOM and visible (even if 1px)
        await videoRef.current.play().catch(() => {
          // Some browsers need user gesture — try muted autoplay
          videoRef.current!.muted = true;
          return videoRef.current!.play();
        });
      }

      // Load MediaPipe HandLandmarker (WASM, runs in browser)
      if (!handLandmarkerRef.current) {
        const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
        );
        handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        });
      }

      setIsLoaded(true);
      setIsLoading(false);
      console.log('[useHandTracking] MediaPipe ready — starting detection loop');
      detectLoop();
    } catch (err: any) {
      setIsLoading(false);
      const msg = err?.message || err?.name || String(err || '');
      console.error('[useHandTracking] Camera error:', err);
      if (msg.includes('NotAllowed') || msg.includes('Permission')) {
        setError('摄像头权限被拒绝，请在浏览器设置中允许摄像头访问');
      } else if (msg.includes('NotFound') || msg.includes('DevicesNotFound')) {
        setError('未检测到摄像头设备');
      } else if (msg.includes('NotReadable') || msg.includes('InUse')) {
        setError('摄像头被其他应用占用');
      } else {
        setError(`摄像头启动失败：${msg || '未知错误'}`);
      }
    }
  }, [detectLoop]);

  useEffect(() => {
    if (!enabled) stopCamera();
    return () => stopCamera();
  }, [enabled, stopCamera]);

  return { isLoaded, isLoading, error, startCamera, stopCamera, videoRef };
}
