import { createAIInstance } from '@/md/ai/ai';
import { gitPostReplyPullReviewComment } from '@/md/git';

export type ReviewCommandOptions = {
  filePath: string;
};

export const reviewCommand = async ({ filePath }: ReviewCommandOptions) => {
  const aiInstance = createAIInstance();
  const suggestions = await aiInstance.reviewFile(filePath);

  await gitPostReplyPullReviewComment(`🎉 Here are the suggestions:\r\n\r\n${suggestions}`);
};
