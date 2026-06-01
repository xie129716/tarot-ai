'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { GestureType } from '@/lib/gestures/types';

interface UseHandTrackingOptions {
  enabled: boolean;
  /** Called with the recognized gesture data */
  onGestureResult?: (result: GestureApiResult) => void;
  /** Interval between API calls in ms (default 400 - ~2.5fps to control API cost) */
  captureIntervalMs?: number;
}

export interface GestureApiResult {
  gesture: GestureType | null;
  confidence: number;
  className: string;
  bbox: { left: number; top: number; width: number; height: number } | null;
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
  onGestureResult,
  captureIntervalMs = 300,
}: UseHandTrackingOptions): UseHandTrackingReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onResultRef = useRef(onGestureResult);
  onResultRef.current = onGestureResult;

  const stopCamera = useCallback(() => {
    console.log('[useHandTracking] Stopping camera...');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLoaded(false);
    console.log('[useHandTracking] Camera stopped.');
  }, []);

  const captureAndSend = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas size to video
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get base64 (remove data:image prefix)
    const fullDataUrl = canvas.toDataURL('image/jpeg', 0.7);
    const base64 = fullDataUrl.split(',')[1];

    if (!base64 || base64.length < 100) return;

    try {
      const response = await fetch('/api/gesture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      if (!response.ok) {
        console.warn('[useHandTracking] API error:', response.status);
        return;
      }

      const result: GestureApiResult = await response.json();
      // DEBUG: suppress gesture API logs
      // if (Math.random() < 0.1) { console.log('[useHandTracking] Gesture result:', JSON.stringify(result)); }
      onResultRef.current?.(result);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('[useHandTracking] Capture error:', err.message);
      }
    }
  }, []);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log('[useHandTracking] Starting camera...');

    try {
      // Start webcam
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
        await videoRef.current.play();
      }

      // Create off-screen canvas for frame capture
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }

      setIsLoaded(true);
      setIsLoading(false);

      // Start periodic capture → API calls
      intervalRef.current = setInterval(() => {
        captureAndSend();
      }, captureIntervalMs);

      console.log('[useHandTracking] Camera started, capturing every', captureIntervalMs, 'ms');
    } catch (err: any) {
      setIsLoading(false);
      if (err.name === 'NotAllowedError') {
        setError('摄像头权限被拒绝。请在浏览器设置中允许摄像头访问。');
      } else {
        setError(`摄像头启动失败：${err.message}`);
      }
    }
  }, [captureAndSend, captureIntervalMs]);

  // Cleanup on unmount or when disabled
  useEffect(() => {
    if (!enabled) {
      stopCamera();
    }
    return () => stopCamera();
  }, [enabled, stopCamera]);

  return {
    isLoaded,
    isLoading,
    error,
    startCamera,
    stopCamera,
    videoRef,
  };
}
