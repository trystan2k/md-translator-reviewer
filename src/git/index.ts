import { setFailed, getInput, info } from '@actions/core';
import { exec } from '@actions/exec';
import { context, getOctokit } from '@actions/github';

export enum Reaction {
  PLUS_ONE = '+1',
  MINUS_ONE = '-1',
  LAUGH = 'laugh',
  CONFUSED = 'confused',
  HEART = 'heart',
  HOORAY = 'hooray',
  ROCKET = 'rocket',
  EYES = 'eyes',
}

export const getGitInstance = () => {
  const GITHUB_TOKEN = getInput('token');
  if (!GITHUB_TOKEN) {
    setFailed('Error: GITHUB_TOKEN is a required input.');
  }

  return getOctokit(GITHUB_TOKEN);
};

export const setBuildFailed = setFailed;

export const getBuildInput = getInput;

export const buildContext = context;

export const logBuildInfo = info;

export const gitAddCommentReaction = async (reaction: Reaction) => {
  const {
    rest: { reactions },
  } = getGitInstance();

  const commentId = context.payload.comment?.id;
  if (!commentId) {
    throw new Error('Comment ID is not found.');
  }

  await reactions.createForPullRequestReviewComment({
    ...context.repo,
    comment_id: commentId,
    content: reaction,
  });
};

export const gitPostComment = async (message: string) => {
  const {
    rest: { issues },
  } = getGitInstance();

  await issues.createComment({
    ...context.repo,
    issue_number: context.issue.number,
    body: message,
  });
};

export const gitPostReplyPullReviewComment = async (message: string) => {
  const {
    rest: { pulls },
  } = getGitInstance();

  await pulls.createReplyForReviewComment({
    ...context.repo,
    pull_number: context.issue.number,
    comment_id: context.payload.comment!.id,
    body: message,
  });
};

export const gitSetConfig = async () => {
  logBuildInfo('Setting git config...');

  const user = {
    name: 'github-actions[bot]',
    email: '41898282+github-actions[bot]@users.noreply.github.com',
  };

  await exec('git', ['config', 'user.name', user.name]);
  await exec('git', ['config', 'user.email', user.email]);
};

type GitCommitPush = {
  branch: string;
  filePath: string;
  message: string;
};

export const gitCommitPush = async ({ branch, filePath, message }: GitCommitPush) => {
  logBuildInfo('Committing and pushing...');

  await exec('git', ['add', filePath]);

  await exec('git', ['commit', '-m', message]);
  await exec('git', ['push', 'origin', branch]);
};

export const gitCheckout = async () => {
  logBuildInfo('Checking out...');

  const {
    rest: { pulls },
  } = getGitInstance();

  const {
    data: {
      head: { ref: branch },
    },
  } = await pulls.get({
    ...context.repo,
    pull_number: context.issue.number,
  });

  await exec('git', ['fetch', 'origin', branch]);
  await exec('git', ['checkout', branch]);

  return branch;
};

export const authorizeUser = async () => {
  const {
    rest: { repos },
  } = getGitInstance();

  const { data: user } = await repos.getCollaboratorPermissionLevel({
    ...context.repo,
    username: context.actor,
  });

  logBuildInfo(`User permission: ${user.permission}`);

  return user.permission === 'admin' || user.permission === 'write';
};
