'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

interface ReadingPanelProps {
  completion: string;
  isLoading: boolean;
  isVisible: boolean;
}

/** Strip AI markdown formatting characters: **bold**, *italic*, __underline__ */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')   // **bold** → bold
    .replace(/\*(.*?)\*/g, '$1')        // *italic* → italic
    .replace(/__(.*?)__/g, '$1')        // __underline__ → underline
    .replace(/`(.*?)`/g, '$1')          // `code` → code
    .replace(/#{1,6}\s/g, '')           // ## headings
    .replace(/^[-*]\s/gm, '')           // - list markers
    .replace(/\n{3,}/g, '\n\n');       // collapse extra blank lines
}

export default function ReadingPanel({
  completion,
  isLoading,
  isVisible,
}: ReadingPanelProps) {
  // Strip markdown in real-time, split into visible paragraphs
  const cleanText = useMemo(() => stripMarkdown(completion), [completion]);
  const paragraphs = useMemo(() => cleanText.split('\n').filter(Boolean), [cleanText]);
  const isStreaming = isLoading && completion.length > 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="w-full max-w-2xl mx-auto mt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-lg">🔮</span>
              <span className="text-purple-300 text-sm tracking-wider">
                {isStreaming ? '星辰正在解读你的牌面...' : '你的塔罗解读'}
              </span>
            </motion.div>
          </div>

          {/* Reading Content */}
          <motion.div
            className="relative bg-gradient-to-b from-slate-900/80 to-indigo-950/80 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-6 md:p-8 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent" />

            {/* Streaming text — each paragraph fades in as it completes */}
            <div className="text-purple-100/90 leading-relaxed text-sm md:text-base">
              {paragraphs.map((para, i) => {
                const isLast = i === paragraphs.length - 1;
                return (
                  <motion.p
                    key={i}
                    className="mb-3 last:mb-0"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {para}
                    {/* Blinking cursor on last line while streaming */}
                    {isStreaming && isLast && (
                      <span className="inline-block w-0.5 h-4 bg-amber-300/80 ml-0.5 animate-pulse align-middle" />
                    )}
                  </motion.p>
                );
              })}
            </div>

            {/* Empty state while waiting for first response */}
            {!completion && isLoading && (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-purple-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <span className="text-purple-400/50 text-sm">正在连接星辰之镜...</span>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-indigo-950/50 to-transparent pointer-events-none" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
