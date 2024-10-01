import { Config } from './ai/types';
import { createAIInstance } from './ai/ai';
import { ACTION_INPUT_KEY_AI_API_KEY, ACTION_INPUT_KEY_AI_MODEL, ACTION_INPUT_KEY_AI_PROVIDER } from './utils/const';
import { getCommandParams } from './commands/parse';
import { translateCommand, TranslateCommandOptions } from './commands/translate';
import {
  authorizeUser,
  buildContext,
  getBuildInput,
  gitAddCommentReaction,
  gitPostReplyPullReviewComment,
  Reaction,
  setBuildFailed,
} from './git';
import { Command } from './commands/types';
import { reviewCommand, ReviewCommandOptions } from './commands/review';
import { applyReviewCommand, ApplyReviewCommandOptions } from './commands/apply-review';
import { postError } from './utils/error';

const commands = {
  [Command.MtrTranslate]: async ({ aiInstance, filePath, targetLang }: TranslateCommandOptions) => {
    await translateCommand({ aiInstance, filePath, targetLang });
  },
  [Command.MtrReview]: async ({ aiInstance, filePath }: ReviewCommandOptions) => {
    await reviewCommand({ aiInstance, filePath });
  },
  [Command.MtrApplyReview]: async ({ aiInstance, filePath, suggestions }: ApplyReviewCommandOptions) => {
    await applyReviewCommand({ aiInstance, filePath, suggestions });
  },
};

const getAIInstance = () => {
  const aiProvider = getBuildInput(ACTION_INPUT_KEY_AI_PROVIDER, { required: true });
  const aiModel = getBuildInput(ACTION_INPUT_KEY_AI_MODEL, { required: true });
  const aiApiKey = getBuildInput(ACTION_INPUT_KEY_AI_API_KEY, { required: true });
  const aiProviderConfig: Config = { temperature: 0.1, topP: 0.8, topK: 30 };

  return createAIInstance(aiProvider, aiModel, aiApiKey, aiProviderConfig);
};

async function main() {
  const eventName = buildContext.eventName;
  if (eventName !== 'pull_request_review_comment') {
    throw new Error(`Event ${eventName} is not supported`);
  }

  const isAuthorized = await authorizeUser();
  if (!isAuthorized) {
    await postError('You have no permission in this repository to use this action.');
  }

  await gitAddCommentReaction(Reaction.EYES);

  const comment = buildContext.payload.comment?.body;
  const filePath: string = buildContext.payload.comment?.path;
  const { command, targetLang, suggestions } = await getCommandParams(comment, filePath);

  // getCommandParams() will throw an error if the command is invalid or if any required parameters are missing,
  // so we can safely assume that the command is valid and all required parameters are present
  await commands[command]({
    aiInstance: getAIInstance(),
    filePath,
    targetLang: targetLang!,
    suggestions: suggestions!,
  });

  await gitAddCommentReaction(Reaction.PLUS_ONE);
}

main().catch(e => {
  gitAddCommentReaction(Reaction.MINUS_ONE);
  gitPostReplyPullReviewComment(`❌ Something went wrong: "${e.message}"`);
  setBuildFailed(e);
});

export default main;
