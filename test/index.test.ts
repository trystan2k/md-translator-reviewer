import { describe, expect, jest, test, beforeEach } from '@jest/globals';

import main from '@/md/index';
import { getCommandParams } from '@/md/commands/parse';
import { translateCommand } from '@/md/commands/translate';
import { authorizeUser, buildContext, gitAddCommentReaction, Reaction, setBuildFailed } from '@/md/git';
import { Command } from '@/md/commands/types';
import { reviewCommand } from '@/md/commands/review';
import { applyReviewCommand } from '@/md/commands/apply-review';
import { postError } from '@/md/utils/error';

jest.mock('@/md/commands/parse');
jest.mock('@/md/commands/translate');
jest.mock('@/md/git');
jest.mock('@/md/commands/types');
jest.mock('@/md/commands/review');
jest.mock('@/md/commands/apply-review');
jest.mock('@/md/utils/error');

describe('main function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should throw an error if event is not pull_request_review_comment', async () => {
    (buildContext.eventName as string) = 'push';
    await expect(main()).rejects.toThrow('Event push is not supported');
  });

  test('should post an error if user is not authorized', async () => {
    (buildContext.eventName as string) = 'pull_request_review_comment';
    buildContext.payload = {
      comment: {
        id: 1,
        body: '/mtr-translate en',
      },
    };

    (authorizeUser as jest.Mock<typeof authorizeUser>).mockResolvedValue(false);
    await main().catch(e => {
      setBuildFailed(e);
    });
    expect(postError).toHaveBeenCalledWith('You have no permission in this repository to use this action.');
  });

  test('should execute translate command', async () => {
    (buildContext.eventName as string) = 'pull_request_review_comment';
    (authorizeUser as jest.Mock<typeof authorizeUser>).mockResolvedValue(true);
    (getCommandParams as jest.Mock<typeof getCommandParams>).mockResolvedValue({
      filePath: 'path/to/file',
      command: Command.MtrTranslate,
      targetLang: 'es',
      suggestions: undefined,
    });

    await main();
    expect(translateCommand).toHaveBeenCalledWith({ filePath: 'path/to/file', targetLang: 'es' });
    expect(gitAddCommentReaction).toHaveBeenCalledWith(Reaction.EYES);
    expect(gitAddCommentReaction).toHaveBeenCalledWith(Reaction.PLUS_ONE);
  });

  test('should execute review command', async () => {
    (buildContext.eventName as string) = 'pull_request_review_comment';
    (authorizeUser as jest.Mock<typeof authorizeUser>).mockResolvedValue(true);
    (getCommandParams as jest.Mock<typeof getCommandParams>).mockResolvedValue({
      filePath: 'path/to/file',
      command: Command.MtrReview,
      targetLang: 'es',
      suggestions: undefined,
    });

    await main();
    expect(reviewCommand).toHaveBeenCalledWith({ filePath: 'path/to/file' });
    expect(gitAddCommentReaction).toHaveBeenCalledWith(Reaction.EYES);
    expect(gitAddCommentReaction).toHaveBeenCalledWith(Reaction.PLUS_ONE);
  });

  test('should execute apply review command', async () => {
    (buildContext.eventName as string) = 'pull_request_review_comment';
    (authorizeUser as jest.Mock<typeof authorizeUser>).mockResolvedValue(true);
    (getCommandParams as jest.Mock<typeof getCommandParams>).mockResolvedValue({
      filePath: 'path/to/file',
      command: Command.MtrApplyReview,
      targetLang: 'es',
      suggestions: 'suggestion1\r\nsuggestion2',
    });

    await main();
    expect(applyReviewCommand).toHaveBeenCalledWith({
      filePath: 'path/to/file',
      suggestions: `suggestion1\r\nsuggestion2`,
    });
    expect(gitAddCommentReaction).toHaveBeenCalledWith(Reaction.EYES);
    expect(gitAddCommentReaction).toHaveBeenCalledWith(Reaction.PLUS_ONE);
  });

  test('should handle error', async () => {
    (buildContext.eventName as string) = 'pull_request_review_comment';
    (authorizeUser as jest.Mock<typeof authorizeUser>).mockRejectedValue(new Error('Authorization failed'));

    await main().catch(e => {
      setBuildFailed(e);
    });
    expect(setBuildFailed).toHaveBeenCalledWith(new Error('Authorization failed'));
  });
});
