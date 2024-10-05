import { describe, expect, vi, test, beforeEach, Mocked } from 'vitest';

import { applyReviewCommand, ApplyReviewCommandOptions } from '@/md/commands/apply-review';
import { AI, createAIInstance } from '@/md/ai/ai';
import { getCommitMessage, gitCheckout, gitCommitPush, gitPostReplyPullReviewComment, gitSetConfig } from '@/md/git';
import { modifyFile } from '@/md/utils/file';

vi.mock('@/md/ai/ai');
vi.mock('@/md/git');
vi.mock('@/md/utils/file');

describe('applyReviewCommand', () => {
  const mockAIInstance = {
    applyReview: vi.fn<typeof AI.prototype.applyReview>(),
  } as unknown as Mocked<AI>;

  beforeEach(() => {
    vi.mocked(createAIInstance).mockReturnValue(mockAIInstance);
    vi.mocked(getCommitMessage).mockReturnValue('Apply review suggestions for file %file');
    vi.clearAllMocks();
  });

  test('should apply review suggestions and commit changes', async () => {
    const options: ApplyReviewCommandOptions = {
      aiInstance: mockAIInstance,
      filePath: 'test-file.txt',
      suggestions: 'Some suggestions',
    };

    mockAIInstance.applyReview.mockResolvedValue('Modified content');
    vi.mocked(gitCheckout).mockResolvedValue('test-branch');

    await applyReviewCommand(options);

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
      aiInstance: mockAIInstance,
      filePath: 'test-file.txt',
      suggestions: 'Some suggestions',
    };

    mockAIInstance.applyReview.mockRejectedValue(new Error('AI error'));

    await expect(applyReviewCommand(options)).rejects.toThrow('AI error');

    expect(mockAIInstance.applyReview).toHaveBeenCalledWith(options.filePath, options.suggestions);
    expect(modifyFile).not.toHaveBeenCalled();
    expect(gitSetConfig).not.toHaveBeenCalled();
    expect(gitCheckout).not.toHaveBeenCalled();
    expect(gitCommitPush).not.toHaveBeenCalled();
    expect(gitPostReplyPullReviewComment).not.toHaveBeenCalled();
  });
});
