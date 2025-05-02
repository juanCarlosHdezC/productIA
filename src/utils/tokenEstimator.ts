export function estimateTokensFromText(text: string): number {
  const avgTokenPerChar = 0.35; // basado en inglés/español
  const tokens = Math.ceil(text.length * avgTokenPerChar);
  return tokens;
}

export function estimateTotalTokens(
  prompt: string,
  expectedOutputLength: number
): number {
  const promptTokens = estimateTokensFromText(prompt);
  return promptTokens + expectedOutputLength;
}
