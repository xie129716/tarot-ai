'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { GestureType } from '@/lib/gestures/types';
import type { GestureEvent } from '@/lib/gestures/types';

interface GestureOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  currentGesture: GestureEvent | null;
  onEnable: () => void;
  onDisable: () => void;
}

export default function GestureOverlay({
  videoRef,
  isEnabled,
  isLoading,
  error,
  currentGesture,
  onEnable,
  onDisable,
}: GestureOverlayProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence mode="wait">
        {!isEnabled ? (
          /* Disabled state: button to enable */
          <motion.button
            key="enable"
            onClick={onEnable}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/90 backdrop-blur-lg border border-purple-500/20 text-purple-300 hover:border-purple-400/40 hover:text-purple-200 transition-all shadow-lg shadow-purple-900/20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            <span className="text-xl">👋</span>
            <span className="text-sm font-medium">
              {isLoading ? '加载中...' : '启用手势控制'}
            </span>
          </motion.button>
        ) : (
          /* Enabled state: video preview + gesture indicator */
          <motion.div
            key="enabled"
            className="relative rounded-2xl overflow-hidden border-2 border-purple-500/30 bg-slate-900/90 backdrop-blur-lg shadow-xl shadow-purple-900/30"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            {/* Webcam preview */}
            <video
              ref={videoRef}
              className="w-48 h-36 md:w-64 md:h-48 object-cover mirror bg-slate-950 rounded-lg"
              autoPlay
              playsInline
              muted
            />

            {/* Gesture status indicator (no video preview) */}
            <div className="px-3 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-purple-300/70">手势检测中</span>
              <GestureBadge gesture={currentGesture} />
            </div>

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-purple-300">启动摄像头...</span>
                </div>
              </div>
            )}

            {/* Close button */}
            <div className="absolute bottom-2 right-2">
              <button
                onClick={onDisable}
                className="text-xs text-purple-400/60 hover:text-purple-300 bg-slate-900/70 px-2 py-0.5 rounded-lg"
              >
                关闭
              </button>
            </div>

            {/* Error overlay */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-slate-950/80 p-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <p className="text-xs text-red-300 text-center">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GestureBadge({ gesture }: { gesture: GestureEvent | null }) {
  if (!gesture || gesture.type === GestureType.NONE) {
    return <span className="text-xs text-purple-400/40">等待手势...</span>;
  }

  const labels: Record<string, { text: string; icon: string }> = {
    [GestureType.PRAYER]: { text: '旋转!', icon: '🖐️' },
    [GestureType.OPEN_PALM]: { text: '选择!', icon: '☝️' },
  };

  const label = labels[gesture.type] ?? { text: gesture.type, icon: '❓' };

  return (
    <motion.span
      key={gesture.type}
      className="inline-flex items-center gap-1 text-xs text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      {label.icon} {label.text}
    </motion.span>
  );
}
