import { describe, expect, jest, test, beforeEach } from '@jest/globals';

import { reviewCommand } from '@/md/commands/review';
import { createAIInstance } from '@/md/ai/ai';
import { gitPostReplyPullReviewComment } from '@/md/git';

jest.mock('@/md/ai/ai');
jest.mock('@/md/git');

describe('reviewCommand', () => {
  const mockFilePath = 'path/to/file';
  const mockSuggestions = 'Mocked suggestions';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should call createAIInstance and reviewFile with the correct filePath', async () => {
    const mockReviewFile = jest.fn<() => Promise<string>>().mockResolvedValue(mockSuggestions);
    (createAIInstance as jest.Mock).mockReturnValue({ reviewFile: mockReviewFile });

    await reviewCommand({ filePath: mockFilePath });

    expect(createAIInstance).toHaveBeenCalled();
    expect(mockReviewFile).toHaveBeenCalledWith(mockFilePath);
  });

  test('should call gitPostReplyPullReviewComment with the correct suggestions', async () => {
    const mockReviewFile = jest.fn<() => Promise<string>>().mockResolvedValue(mockSuggestions);
    (createAIInstance as jest.Mock).mockReturnValue({ reviewFile: mockReviewFile });

    await reviewCommand({ filePath: mockFilePath });

    expect(gitPostReplyPullReviewComment).toHaveBeenCalledWith(
      `🎉 Here are the suggestions:\r\n\r\n${mockSuggestions}`,
    );
  });
});
