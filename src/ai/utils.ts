export const estimateTokensByWords = (messages: string[]) => {
  // 1 token ≈ ¾ words or 100 tokens ≈ 75 words
  const wordsPerToken = 0.75;

  const promptTokens = messages.reduce((total, msg) => {
    const wordCount = msg.split(/\s+/).filter(Boolean).length;
    const numTokens = Math.ceil(wordCount / wordsPerToken);

    return total + numTokens;
  }, 0);

  return promptTokens;
};
