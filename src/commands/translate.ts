import { AiBaseCommand } from './types';

import { ACTION_INPUT_KEY_TRANSLATE_COMMIT_MESSAGE_TEMPLATE } from '@/md/utils/const';
import { gitSetConfig, gitCommitPush, gitCheckout, gitPostReplyPullReviewComment, getCommitMessage } from '@/md/git';
import { createFile, generateOutputFilePath } from '@/md/utils/file';

export type TranslateCommandOptions = AiBaseCommand & {
  filePath: string;
  targetLang: string;
};

export const translateCommand = async ({ aiInstance, filePath, targetLang }: TranslateCommandOptions) => {
  const outputFileContent = await aiInstance.translateFile(filePath, targetLang);

  const outputFilePath = generateOutputFilePath({ filePath, targetLang });

  await createFile(outputFileContent, outputFilePath);

  await gitSetConfig();
  const branch = await gitCheckout();

  const commitMessage = getCommitMessage(ACTION_INPUT_KEY_TRANSLATE_COMMIT_MESSAGE_TEMPLATE);

  await gitCommitPush({
    branch,
    filePath: outputFilePath,
    message: commitMessage.replace('%file', filePath).replace('%lang', targetLang),
  });

  await gitPostReplyPullReviewComment(
    `🎉 Translation of file **"${filePath}"** to **"${targetLang}"** completed! Generated file **"${outputFilePath}"**`,
  );
};
