/**
 * Conversation context manager.
 * Trims history to fit within token budget (conservative estimation: ~4 chars per token).
 */
export function trimConversation(
  messages: { role: string; content: string }[],
  maxTokens: number
): { role: string; content: string }[] {
  let tokenCount = 0;
  const trimmed: typeof messages = [];

  // Walk backward to keep the most recent messages
  for (let i = messages.length - 1; i >= 0; i--) {
    const estimatedTokens = Math.ceil(messages[i]!.content.length / 4);
    if (tokenCount + estimatedTokens > maxTokens) break;
    tokenCount += estimatedTokens;
    trimmed.unshift(messages[i]!);
  }

  return trimmed;
}

/**
 * Estimate token count from a string (rough: ~4 chars per token for Chinese/English mixed).
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Estimate total tokens for a messages array.
 */
export function estimateMessagesTokens(
  messages: { role: string; content: string }[]
): number {
  return messages.reduce((sum, m) => sum + estimateTokens(m.content), 0);
}
