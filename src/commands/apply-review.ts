import { createAIInstance } from '@/md/ai/ai';
import { gitCheckout, gitCommitPush, gitPostReplyPullReviewComment, gitSetConfig } from '@/md/git';
import { modifyFile } from '@/md/utils/file';

export type ApplyReviewCommandOptions = {
  filePath: string;
  suggestions: string;
};

export const applyReviewCommand = async ({ filePath, suggestions }: ApplyReviewCommandOptions) => {
  const aiInstance = createAIInstance();
  const resultText = await aiInstance.applyReview(filePath, suggestions);

  await modifyFile(filePath, resultText);

  await gitSetConfig();
  const branch = await gitCheckout();
  await gitCommitPush({ branch, filePath, message: `Apply review suggestions for file ${filePath}` });

  await gitPostReplyPullReviewComment(`🎉 Suggestions reviews applied`);
};
