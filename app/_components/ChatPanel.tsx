'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/** Strip AI markdown formatting — same as ReadingPanel */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/^[-*]\s/gm, '')
    .replace(/\n{3,}/g, '\n\n');
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  isVisible: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onClose?: () => void;
}

export default function ChatPanel({
  messages,
  input,
  isLoading,
  isVisible,
  onInputChange,
  onSubmit,
  onClose,
}: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="w-full max-w-2xl mx-auto mt-8"
          initial={{ opacity: 0, y: 50, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: 50, height: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="bg-gradient-to-b from-slate-900/90 to-indigo-950/90 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-purple-500/10">
              <div className="flex items-center gap-2">
                <span className="text-lg">💬</span>
                <span className="text-purple-200 text-sm font-medium">追问星辰之镜</span>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-purple-400/50 hover:text-purple-300 transition-colors text-sm"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="h-64 md:h-80 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              {messages.length === 0 && (
                <div className="text-center text-purple-400/40 text-sm py-8">
                  对解读有疑问？在下方输入你的问题吧 ✨
                </div>
              )}

              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === 'user'
                        ? 'bg-purple-600/40 text-purple-100 border border-purple-500/30'
                        : 'bg-slate-800/60 text-purple-100/80 border border-slate-700/30'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert prose-sm max-w-none">
                        {stripMarkdown(msg.content).split('\n').map((line, i) => (
                          <p key={i} className="mb-1 last:mb-0">
                            {line}
                          </p>
                        ))}
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Loading indicator */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="bg-slate-800/60 rounded-2xl px-4 py-3 border border-slate-700/30">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-purple-400"
                            animate={{ opacity: [0.2, 1, 0.2] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 px-4 py-3 border-t border-purple-500/10"
            >
              <input
                type="text"
                value={input}
                onChange={onInputChange}
                placeholder="输入你的问题..."
                className="flex-1 bg-slate-800/50 border border-purple-500/20 rounded-xl px-4 py-2 text-sm text-purple-100 placeholder-purple-400/30 focus:outline-none focus:border-purple-400/50 transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600/50 border border-purple-500/30 text-purple-100 text-sm font-medium hover:bg-purple-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? '...' : '发送'}
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
