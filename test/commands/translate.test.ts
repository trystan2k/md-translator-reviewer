import { describe, expect, jest, test, beforeEach } from '@jest/globals';

import { translateCommand, TranslateCommandOptions } from '@/md/commands/translate';
import { AI, createAIInstance } from '@/md/ai/ai';
import { gitSetConfig, gitCommitPush, gitCheckout, gitPostReplyPullReviewComment, getCommitMessage } from '@/md/git';
import { createFile, generateOutputFilePath } from '@/md/utils/file';

jest.mock('@/md/ai/ai');
jest.mock('@/md/git');
jest.mock('@/md/utils/file');

describe('translateCommand', () => {
  const mockAIInstance = {
    translateFile: jest.fn<typeof AI.prototype.translateFile>(),
  } as unknown as jest.Mocked<AI>;

  beforeEach(() => {
    (createAIInstance as jest.Mock).mockReturnValue(mockAIInstance);
    (getCommitMessage as jest.Mock).mockReturnValue('Add translation of file %file for language %lang');
    jest.clearAllMocks();
  });

  test('should translate the file and perform git operations', async () => {
    const options: TranslateCommandOptions = {
      aiInstance: mockAIInstance,
      filePath: 'path/to/file.txt',
      targetLang: 'es',
    };

    const translatedContent = 'translated content';
    const outputFilePath = 'path/to/file_es.txt';

    mockAIInstance.translateFile.mockResolvedValue(translatedContent);
    (generateOutputFilePath as jest.Mock).mockReturnValue(outputFilePath);
    (gitCheckout as jest.Mock<() => Promise<string>>).mockResolvedValue('test-branch');

    await translateCommand(options);

    expect(mockAIInstance.translateFile).toHaveBeenCalledWith(options.filePath, options.targetLang);
    expect(generateOutputFilePath).toHaveBeenCalledWith({ filePath: options.filePath, targetLang: options.targetLang });
    expect(createFile).toHaveBeenCalledWith(translatedContent, outputFilePath);
    expect(gitSetConfig).toHaveBeenCalled();
    expect(gitCheckout).toHaveBeenCalled();
    expect(gitCommitPush).toHaveBeenCalledWith({
      branch: 'test-branch',
      filePath: outputFilePath,
      message: `Add translation of file ${options.filePath} for language ${options.targetLang}`,
    });
    expect(gitPostReplyPullReviewComment).toHaveBeenCalledWith(
      `🎉 Translation of file **"${options.filePath}"** to **"${options.targetLang}"** completed! Generated file **"${outputFilePath}"**`,
    );
  });

  test('should handle errors gracefully', async () => {
    const options: TranslateCommandOptions = {
      aiInstance: mockAIInstance,
      filePath: 'path/to/file.txt',
      targetLang: 'es',
    };

    mockAIInstance.translateFile.mockRejectedValue(new Error('Translation failed'));

    await expect(translateCommand(options)).rejects.toThrow('Translation failed');

    expect(mockAIInstance.translateFile).toHaveBeenCalledWith(options.filePath, options.targetLang);
    expect(generateOutputFilePath).not.toHaveBeenCalled();
    expect(createFile).not.toHaveBeenCalled();
    expect(gitSetConfig).not.toHaveBeenCalled();
    expect(gitCheckout).not.toHaveBeenCalled();
    expect(gitCommitPush).not.toHaveBeenCalled();
    expect(gitPostReplyPullReviewComment).not.toHaveBeenCalled();
  });
});
