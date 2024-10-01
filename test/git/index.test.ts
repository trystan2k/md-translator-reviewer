import { exec } from '@actions/exec';
import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import { getInput, setFailed } from '@actions/core';
import { context, getOctokit } from '@actions/github';

import {
  authorizeUser,
  getCommitMessage,
  getGitInstance,
  gitAddCommentReaction,
  gitCheckout,
  gitCommitPush,
  gitPostComment,
  gitPostReplyPullReviewComment,
  gitSetConfig,
  Reaction,
} from '@/md/git';

jest.mock('@actions/exec');
jest.mock('@actions/github');
jest.mock('@actions/core');

describe('Git Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGitInstance', () => {
    test('should return an Octokit instance when GITHUB_TOKEN is provided', () => {
      (getInput as jest.Mock).mockReturnValue('fake-token');
      (getOctokit as jest.Mock).mockReturnValue({});
      const octokit = getGitInstance();
      expect(getInput).toHaveBeenCalledWith('token');
      expect(getOctokit).toHaveBeenCalledWith('fake-token');
      expect(octokit).toBeDefined();
    });

    test('should call setFailed when GITHUB_TOKEN is not provided', () => {
      (getInput as jest.Mock).mockReturnValue('');
      getGitInstance();
      expect(setFailed).toHaveBeenCalledWith('Error: GITHUB_TOKEN is a required input.');
    });
  });

  describe('gitAddCommentReaction', () => {
    let mockReactions: { createForPullRequestReviewComment: jest.Mock };
    beforeEach(() => {
      mockReactions = { createForPullRequestReviewComment: jest.fn() };
      (getOctokit as jest.Mock).mockReturnValue({ rest: { reactions: mockReactions } });
    });

    test('should add a reaction to a comment', async () => {
      context.payload = { comment: { id: 1 } };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      context.repo = { owner: 'owner', repo: 'repo' };

      await gitAddCommentReaction(Reaction.PLUS_ONE);
      expect(mockReactions.createForPullRequestReviewComment).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        comment_id: 1,
        content: Reaction.PLUS_ONE,
      });
    });

    test('should throw an error if comment ID is not found', async () => {
      context.payload = {};
      await expect(gitAddCommentReaction(Reaction.PLUS_ONE)).rejects.toThrow('Comment ID is not found.');
    });
  });

  describe('gitPostComment', () => {
    test('should post a comment to an issue', async () => {
      const mockIssues = { createComment: jest.fn() };
      (getOctokit as jest.Mock).mockReturnValue({ rest: { issues: mockIssues } });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      context.repo = { owner: 'owner', repo: 'repo' };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      context.issue = { number: 1 };

      await gitPostComment('Test comment');
      expect(mockIssues.createComment).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        issue_number: 1,
        body: 'Test comment',
      });
    });
  });

  describe('gitPostReplyPullReviewComment', () => {
    test('should post a reply to a pull request review comment', async () => {
      const mockPulls = { createReplyForReviewComment: jest.fn() };
      (getOctokit as jest.Mock).mockReturnValue({ rest: { pulls: mockPulls } });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      context.repo = { owner: 'owner', repo: 'repo' };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      context.issue = { number: 1 };
      context.payload = { comment: { id: 1 } };

      await gitPostReplyPullReviewComment('Test reply');
      expect(mockPulls.createReplyForReviewComment).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        pull_number: 1,
        comment_id: 1,
        body: 'Test reply',
      });
    });
  });

  describe('gitSetConfig', () => {
    test('should set git config for user', async () => {
      await gitSetConfig();
      expect(exec).toHaveBeenCalledWith('git', ['config', 'user.name', 'github-actions[bot]']);
      expect(exec).toHaveBeenCalledWith('git', [
        'config',
        'user.email',
        '41898282+github-actions[bot]@users.noreply.github.com',
      ]);
    });
  });

  describe('gitCommitPush', () => {
    test('should commit and push changes', async () => {
      await gitCommitPush({ branch: 'main', filePath: 'path/to/file', message: 'Test commit' });
      expect(exec).toHaveBeenCalledWith('git', ['add', 'path/to/file']);
      expect(exec).toHaveBeenCalledWith('git', ['commit', '-m', 'Test commit']);
      expect(exec).toHaveBeenCalledWith('git', ['push', 'origin', 'main']);
    });
  });

  describe('gitCheckout', () => {
    test('should checkout a branch', async () => {
      const mockPulls = {
        get: jest.fn<() => { data: { head: { ref: string } } }>(() => ({ data: { head: { ref: 'feature-branch' } } })),
      };
      (getOctokit as jest.Mock).mockReturnValue({ rest: { pulls: mockPulls } });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      context.repo = { owner: 'owner', repo: 'repo' };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      context.issue = { number: 1 };

      const branch = await gitCheckout();
      expect(exec).toHaveBeenCalledWith('git', ['fetch', 'origin', 'feature-branch']);
      expect(exec).toHaveBeenCalledWith('git', ['checkout', 'feature-branch']);
      expect(branch).toBe('feature-branch');
    });
  });

  describe('authorizeUser', () => {
    test('should authorize user with admin or write permission', async () => {
      const mockRepos = {
        getCollaboratorPermissionLevel: jest.fn<() => { data: { permission: string } }>(() => ({
          data: { permission: 'admin' },
        })),
      };
      (getOctokit as jest.Mock).mockReturnValue({ rest: { repos: mockRepos } });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      context.repo = { owner: 'owner', repo: 'repo' };
      context.actor = 'user';

      const isAuthorized = await authorizeUser();
      expect(mockRepos.getCollaboratorPermissionLevel).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        username: 'user',
      });
      expect(isAuthorized).toBe(true);
    });

    test('should not authorize user without admin or write permission', async () => {
      const mockRepos = {
        getCollaboratorPermissionLevel: jest.fn<() => { data: { permission: string } }>(() => ({
          data: { permission: 'read' },
        })),
      };
      (getOctokit as jest.Mock).mockReturnValue({ rest: { repos: mockRepos } });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      context.repo = { owner: 'owner', repo: 'repo' };
      context.actor = 'user';

      const isAuthorized = await authorizeUser();
      expect(mockRepos.getCollaboratorPermissionLevel).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        username: 'user',
      });
      expect(isAuthorized).toBe(false);
    });
  });

  describe('getCommitMessage', () => {
    test('should return a commit message template', () => {
      (getInput as jest.Mock).mockReturnValue('Test commit message');
      const commitMessage = getCommitMessage('commit-message');
      expect(getInput).toHaveBeenCalledWith('commit-message');
      expect(commitMessage).toBe('Test commit message');
    });
  });
});
