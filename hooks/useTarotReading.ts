'use client';

import { useState, useCallback, useRef } from 'react';
import type { CardSelection } from '@/types';

interface UseTarotReadingOptions {
  onFinish?: (completion: string) => void;
  onError?: (error: Error) => void;
}

interface UseTarotReadingReturn {
  completion: string;
  isLoading: boolean;
  error: Error | undefined;
  startReading: (cards: CardSelection[], spreadType: string, question?: string) => void;
  stop: () => void;
}

export function useTarotReading(
  options: UseTarotReadingOptions = {}
): UseTarotReadingReturn {
  const [completion, setCompletion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const startReading = useCallback(
    async (cards: CardSelection[], spreadType: string, question?: string) => {
      setCompletion('');
      setError(undefined);
      setIsLoading(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch('/api/reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cards: cards.map((c) => ({
              name: c.card.name,
              position: c.position,
              orientation: c.orientation,
            })),
            spreadType,
            question: question || undefined,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errBody = await response.text();
          console.error('[useTarotReading] API error:', response.status, errBody);
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
          console.log('[useTarotReading] chunk received, length:', chunk.length);
          fullText += chunk;
          setCompletion(fullText); // Update UI with accumulated text
        }

        console.log('[useTarotReading] stream complete, total length:', fullText.length);
        options.onFinish?.(fullText);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('[useTarotReading] Error:', error);
        setError(error);
        options.onError?.(error);
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [options]
  );

  return { completion, isLoading, error, startReading, stop };
}
