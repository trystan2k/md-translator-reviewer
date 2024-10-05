import { describe, expect, vi, test, beforeEach, Mocked } from 'vitest';

import { reviewCommand } from '@/md/commands/review';
import { AI, createAIInstance } from '@/md/ai/ai';
import { gitPostReplyPullReviewComment } from '@/md/git';

vi.mock('@/md/ai/ai');
vi.mock('@/md/git');

describe('reviewCommand', () => {
  const mockFilePath = 'path/to/file';
  const mockSuggestions = 'Mocked suggestions';
  const mockAIInstance = {
    reviewFile: vi.fn<typeof AI.prototype.reviewFile>(),
  } as unknown as Mocked<AI>;

  beforeEach(() => {
    vi.mocked(createAIInstance).mockReturnValue(mockAIInstance);
    vi.clearAllMocks();
  });

  test('should call createAIInstance and reviewFile with the correct filePath', async () => {
    await reviewCommand({ aiInstance: mockAIInstance, filePath: mockFilePath });

    expect(mockAIInstance.reviewFile).toHaveBeenCalledWith(mockFilePath);
  });

  test('should call gitPostReplyPullReviewComment with the correct suggestions', async () => {
    mockAIInstance.reviewFile.mockResolvedValue(mockSuggestions);

    await reviewCommand({ aiInstance: mockAIInstance, filePath: mockFilePath });

    expect(gitPostReplyPullReviewComment).toHaveBeenCalledWith(
      `🎉 Here are the suggestions:\r\n\r\n${mockSuggestions}`,
    );
  });
});
