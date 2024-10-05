import { describe, expect, vi, test, beforeEach, Mocked } from 'vitest';

import { translateCommand, TranslateCommandOptions } from '@/md/commands/translate';
import { AI, createAIInstance } from '@/md/ai/ai';
import { gitSetConfig, gitCommitPush, gitCheckout, gitPostReplyPullReviewComment, getCommitMessage } from '@/md/git';
import { createFile, generateOutputFilePath } from '@/md/utils/file';

vi.mock('@/md/ai/ai');
vi.mock('@/md/git');
vi.mock('@/md/utils/file');

describe('translateCommand', () => {
  const mockAIInstance = {
    translateFile: vi.fn<typeof AI.prototype.translateFile>(),
  } as unknown as Mocked<AI>;

  beforeEach(() => {
    vi.mocked(createAIInstance).mockReturnValue(mockAIInstance);
    vi.mocked(getCommitMessage).mockReturnValue('Add translation of file %file for language %lang');
    vi.clearAllMocks();
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
    vi.mocked(generateOutputFilePath).mockReturnValue(outputFilePath);
    vi.mocked(gitCheckout).mockResolvedValue('test-branch');

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
