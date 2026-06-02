'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface GestureHintProps {
  isVisible: boolean;
  onDismiss?: () => void;
}

const GESTURE_GUIDE = [
  { icon: '🖐️', action: '张手 数字5', description: '卡牌立体环绕旋转' },
  { icon: '☝️', action: '食指 数字1', description: '确认选择当前卡牌' },
];

export default function GestureHint({ isVisible, onDismiss }: GestureHintProps) {
  const [step, setStep] = useState(0);

  // Auto-advance tutorial steps
  useEffect(() => {
    if (!isVisible) return;
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % GESTURE_GUIDE.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-40"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="flex items-center gap-6 px-5 py-3 rounded-2xl bg-slate-900/90 backdrop-blur-lg border border-purple-500/20 shadow-xl">
            {GESTURE_GUIDE.map((item, i) => (
              <motion.div
                key={i}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                  i === step ? 'scale-110' : 'scale-90 opacity-50'
                }`}
                animate={{
                  scale: i === step ? 1.1 : 0.9,
                  opacity: i === step ? 1 : 0.5,
                }}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs text-purple-200 font-medium">{item.action}</span>
                <span className="text-[10px] text-purple-400/50">{item.description}</span>
              </motion.div>
            ))}

            {onDismiss && (
              <button
                onClick={onDismiss}
                className="ml-2 text-purple-400/40 hover:text-purple-300 text-sm"
              >
                ✕
              </button>
            )}
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-2">
            {GESTURE_GUIDE.map((_, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                animate={{
                  backgroundColor: i === step ? 'rgba(218, 165, 32, 0.8)' : 'rgba(147, 112, 219, 0.3)',
                  scale: i === step ? 1.3 : 1,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
