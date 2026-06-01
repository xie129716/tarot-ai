'use client';

import { useState, useCallback, useRef } from 'react';
import type { CardSelection } from '@/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface UseTarotChatOptions {
  onError?: (error: Error) => void;
}

interface UseTarotChatReturn {
  messages: ChatMessage[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  error: Error | undefined;
  stop: () => void;
  setInput: (input: string) => void;
}

let msgCounter = 0;

export function useTarotChat(
  readingContext: {
    cards: CardSelection[];
    spreadType: string;
    reading: string;
  } | null,
  options: UseTarotChatOptions = {}
): UseTarotChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || isLoading || !readingContext) return;

      const userMsg: ChatMessage = {
        id: `msg-${++msgCounter}`,
        role: 'user',
        content: input.trim(),
      };

      setInput('');
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setError(undefined);

      const controller = new AbortController();
      abortRef.current = controller;

      const assistantMsgId = `msg-${++msgCounter}`;
      setMessages((prev) => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            readingContext: {
              cards: readingContext.cards.map((c) => ({
                name: c.card.name,
                position: c.position,
                orientation: c.orientation,
              })),
              spreadType: readingContext.spreadType,
              reading: readingContext.reading,
            },
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errBody = await response.text();
          console.error('[useTarotChat] API error:', response.status, errBody);
          throw new Error(`API error ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let fullText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // AI SDK v6 toTextStreamResponse emits plain text chunks
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: fullText } : m
            )
          );
        }
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('[useTarotChat] Error:', error);
        setError(error);
        options.onError?.(error);
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [input, isLoading, messages, readingContext, options]
  );

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    setInput,
  };
}
