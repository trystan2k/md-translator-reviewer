import { AiBaseCommand } from './types';

import { gitPostReplyPullReviewComment } from '@/md/git';

export type ReviewCommandOptions = AiBaseCommand & {
  filePath: string;
};

export const reviewCommand = async ({ aiInstance, filePath }: ReviewCommandOptions) => {
  const suggestions = await aiInstance.reviewFile(filePath);

  await gitPostReplyPullReviewComment(`🎉 Here are the suggestions:\r\n\r\n${suggestions}`);
};
