import { exec } from '@actions/exec';
import { describe, expect, vi, test, beforeEach, Mock } from 'vitest';
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

vi.mock('@actions/exec');
vi.mock('@actions/github');
vi.mock('@actions/core');

describe('Git Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getGitInstance', () => {
    test('should return an Octokit instance when GITHUB_TOKEN is provided', () => {
      vi.mocked(getInput).mockReturnValue('fake-token');
      vi.mocked(getOctokit as Mock).mockReturnValue({});
      const octokit = getGitInstance();
      expect(getInput).toHaveBeenCalledWith('token');
      expect(getOctokit).toHaveBeenCalledWith('fake-token');
      expect(octokit).toBeDefined();
    });

    test('should call setFailed when GITHUB_TOKEN is not provided', () => {
      vi.mocked(getInput).mockReturnValue('');
      getGitInstance();
      expect(setFailed).toHaveBeenCalledWith('Error: GITHUB_TOKEN is a required input.');
    });
  });

  describe('gitAddCommentReaction', () => {
    let mockReactions: { createForPullRequestReviewComment: Mock };
    beforeEach(() => {
      Object.defineProperty(context, 'repo', {
        value: vi.fn(),
        configurable: true,
        writable: true,
      });

      Object.defineProperty(context, 'issue', {
        value: vi.fn(),
        configurable: true,
        writable: true,
      });

      mockReactions = { createForPullRequestReviewComment: vi.fn() };
      vi.mocked(getOctokit as Mock).mockReturnValue({ rest: { reactions: mockReactions } });
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
      const mockIssues = { createComment: vi.fn() };
      vi.mocked(getOctokit as Mock).mockReturnValue({ rest: { issues: mockIssues } });
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
      const mockPulls = { createReplyForReviewComment: vi.fn() };
      vi.mocked(getOctokit as Mock).mockReturnValue({ rest: { pulls: mockPulls } });
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
        get: vi.fn<() => { data: { head: { ref: string } } }>(() => ({ data: { head: { ref: 'feature-branch' } } })),
      };
      vi.mocked(getOctokit as Mock).mockReturnValue({ rest: { pulls: mockPulls } });
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
        getCollaboratorPermissionLevel: vi.fn<() => { data: { permission: string } }>(() => ({
          data: { permission: 'admin' },
        })),
      };
      vi.mocked(getOctokit as Mock).mockReturnValue({ rest: { repos: mockRepos } });
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
        getCollaboratorPermissionLevel: vi.fn<() => { data: { permission: string } }>(() => ({
          data: { permission: 'read' },
        })),
      };
      vi.mocked(getOctokit as Mock).mockReturnValue({ rest: { repos: mockRepos } });
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
      vi.mocked(getInput).mockReturnValue('Test commit message');
      const commitMessage = getCommitMessage('commit-message');
      expect(getInput).toHaveBeenCalledWith('commit-message');
      expect(commitMessage).toBe('Test commit message');
    });
  });
});
