import { describe, expect, jest, test, beforeEach } from '@jest/globals';

import { applyReviewCommand, ApplyReviewCommandOptions } from '@/md/commands/apply-review';
import { AI, createAIInstance } from '@/md/ai/ai';
import { gitCheckout, gitCommitPush, gitPostReplyPullReviewComment, gitSetConfig } from '@/md/git';
import { modifyFile } from '@/md/utils/file';

jest.mock('@/md/ai/ai');
jest.mock('@/md/git');
jest.mock('@/md/utils/file');

describe('applyReviewCommand', () => {
  const mockAIInstance = {
    applyReview: jest.fn<typeof AI.prototype.applyReview>(),
  };

  beforeEach(() => {
    (createAIInstance as jest.Mock).mockReturnValue(mockAIInstance);
    jest.clearAllMocks();
  });

  test('should apply review suggestions and commit changes', async () => {
    const options: ApplyReviewCommandOptions = {
      filePath: 'test-file.txt',
      suggestions: 'Some suggestions',
    };

    mockAIInstance.applyReview.mockResolvedValue('Modified content');
    (gitCheckout as jest.Mock<() => Promise<string>>).mockResolvedValue('test-branch');

    await applyReviewCommand(options);

    expect(createAIInstance).toHaveBeenCalled();
    expect(mockAIInstance.applyReview).toHaveBeenCalledWith(options.filePath, options.suggestions);
    expect(modifyFile).toHaveBeenCalledWith(options.filePath, 'Modified content');
    expect(gitSetConfig).toHaveBeenCalled();
    expect(gitCheckout).toHaveBeenCalled();
    expect(gitCommitPush).toHaveBeenCalledWith({
      branch: 'test-branch',
      filePath: options.filePath,
      message: `Apply review suggestions for file ${options.filePath}`,
    });
    expect(gitPostReplyPullReviewComment).toHaveBeenCalledWith('🎉 Suggestions reviews applied');
  });

  test('should handle errors gracefully', async () => {
    const options: ApplyReviewCommandOptions = {
      filePath: 'test-file.txt',
      suggestions: 'Some suggestions',
    };

    mockAIInstance.applyReview.mockRejectedValue(new Error('AI error'));

    await expect(applyReviewCommand(options)).rejects.toThrow('AI error');

    expect(createAIInstance).toHaveBeenCalled();
    expect(mockAIInstance.applyReview).toHaveBeenCalledWith(options.filePath, options.suggestions);
    expect(modifyFile).not.toHaveBeenCalled();
    expect(gitSetConfig).not.toHaveBeenCalled();
    expect(gitCheckout).not.toHaveBeenCalled();
    expect(gitCommitPush).not.toHaveBeenCalled();
    expect(gitPostReplyPullReviewComment).not.toHaveBeenCalled();
  });
});
