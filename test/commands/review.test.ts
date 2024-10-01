import { describe, expect, jest, test, beforeEach } from '@jest/globals';

import { reviewCommand } from '@/md/commands/review';
import { AI, createAIInstance } from '@/md/ai/ai';
import { gitPostReplyPullReviewComment } from '@/md/git';

jest.mock('@/md/ai/ai');
jest.mock('@/md/git');

describe('reviewCommand', () => {
  const mockFilePath = 'path/to/file';
  const mockSuggestions = 'Mocked suggestions';
  const mockAIInstance = {
    reviewFile: jest.fn<typeof AI.prototype.reviewFile>(),
  } as unknown as jest.Mocked<AI>;

  beforeEach(() => {
    (createAIInstance as jest.Mock).mockReturnValue(mockAIInstance);
    jest.clearAllMocks();
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
