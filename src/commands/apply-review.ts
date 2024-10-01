import { AiBaseCommand } from './types';

import { ACTION_INPUT_KEY_APPLY_REVIEW_COMMIT_MESSAGE_TEMPLATE } from '@/md/utils/const';
import { getCommitMessage, gitCheckout, gitCommitPush, gitPostReplyPullReviewComment, gitSetConfig } from '@/md/git';
import { modifyFile } from '@/md/utils/file';

export type ApplyReviewCommandOptions = AiBaseCommand & {
  filePath: string;
  suggestions: string;
};

export const applyReviewCommand = async ({ aiInstance, filePath, suggestions }: ApplyReviewCommandOptions) => {
  const resultText = await aiInstance.applyReview(filePath, suggestions);

  await modifyFile(filePath, resultText);

  await gitSetConfig();
  const branch = await gitCheckout();

  const commitMessage = getCommitMessage(ACTION_INPUT_KEY_APPLY_REVIEW_COMMIT_MESSAGE_TEMPLATE);
  await gitCommitPush({ branch, filePath, message: commitMessage.replace('%file', filePath) });

  await gitPostReplyPullReviewComment(`🎉 Suggestions reviews applied`);
};
