'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect } from 'react';

interface CardDeckProps {
  isShuffling: boolean;
  onShuffleComplete?: () => void;
}

export default function CardDeck({ isShuffling, onShuffleComplete }: CardDeckProps) {
  // Keep callback ref stable across re-renders
  const cbRef = useRef(onShuffleComplete);
  useEffect(() => { cbRef.current = onShuffleComplete; }, [onShuffleComplete]);

  const handleComplete = () => {
    console.log('[CardDeck] Shuffle animation complete');
    cbRef.current?.();
  };

  return (
    <div className="relative w-[140px] h-[220px] md:w-[160px] md:h-[260px] mx-auto">
      {/* Multiple stacked cards for deck effect */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 border-2 border-purple-500/30"
          initial={false}
          animate={
            isShuffling
              ? {
                  x: [0, -30 + i * 15, 30 - i * 10, -10 + i * 5, 0],
                  y: [0, -10, 15, -5, 0],
                  rotateZ: [-3, 5 + i * 3, -4 - i * 2, 2, 0],
                  scale: [1, 1.02, 0.98, 1.01, 1],
                }
              : {
                  x: i * 3 - 3,
                  y: i * 2 - 2,
                  rotateZ: i * 1.5 - 1.5,
                  scale: 1,
                }
          }
          transition={
            isShuffling
              ? {
                  duration: 1.5,
                  repeat: 2,
                  ease: 'easeInOut',
                  onComplete: i === 0 ? handleComplete : undefined,
                }
              : { duration: 0.3 }
          }
        >
          <div className="absolute inset-0 rounded-xl flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-1">✦</div>
              <div className="w-12 h-12 mx-auto rounded-full border border-purple-400/30 flex items-center justify-center">
                <span className="text-purple-300 text-xl">☽</span>
              </div>
              <div className="mt-2 text-purple-400/50 text-[10px] tracking-[0.3em] uppercase">
                塔罗
              </div>
            </div>
          </div>
          {/* Decorative borders */}
          <div className="absolute inset-2 border border-purple-500/15 rounded-lg pointer-events-none" />
        </motion.div>
      ))}

      {/* Glow effect during shuffling */}
      <AnimatePresence>
        {isShuffling && (
          <motion.div
            className="absolute -inset-8 rounded-full bg-purple-500/10 blur-2xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0.8, 0.5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
