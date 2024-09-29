import { createAIInstance } from '@/md/ai/ai';
import { gitSetConfig, gitCommitPush, gitCheckout, gitPostReplyPullReviewComment } from '@/md/git';
import { createFile, generateOutputFilePath } from '@/md/utils/file';

export type TranslateCommandOptions = {
  filePath: string;
  targetLang: string;
};

export const translateCommand = async ({ filePath, targetLang }: TranslateCommandOptions) => {
  const aiInstance = createAIInstance();
  const outputFileContent = await aiInstance.translateFile(filePath, targetLang);

  const outputFilePath = generateOutputFilePath({ filePath, targetLang });

  await createFile(outputFileContent, outputFilePath);

  await gitSetConfig();
  const branch = await gitCheckout();
  await gitCommitPush({
    branch,
    filePath: outputFilePath,
    message: `Add translation of file ${filePath} for language ${targetLang}`,
  });

  await gitPostReplyPullReviewComment(
    `🎉 Translation of file **"${filePath}"** to **"${targetLang}"** completed! Generated file **"${outputFilePath}"**`,
  );
};
