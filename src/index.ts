import { getCommandParams } from '@/md/commands/parse';
import { translateCommand, TranslateCommandOptions } from '@/md/commands/translate';
import {
  authorizeUser,
  buildContext,
  gitAddCommentReaction,
  gitPostReplyPullReviewComment,
  Reaction,
  setBuildFailed,
} from '@/md/git';
import { Command } from '@/md/commands/types';
import { reviewCommand, ReviewCommandOptions } from '@/md/commands/review';
import { applyReviewCommand, ApplyReviewCommandOptions } from '@/md/commands/apply-review';
import { postError } from '@/md/utils/error';

const commands = {
  [Command.MtrTranslate]: async ({ filePath, targetLang }: TranslateCommandOptions) => {
    await translateCommand({ filePath, targetLang });
  },
  [Command.MtrReview]: async ({ filePath }: ReviewCommandOptions) => {
    await reviewCommand({ filePath });
  },
  [Command.MtrApplyReview]: async ({ filePath, suggestions }: ApplyReviewCommandOptions) => {
    await applyReviewCommand({ filePath, suggestions });
  },
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

  const { filePath, command, targetLang, suggestions } = await getCommandParams();

  // getCommandParams() will throw an error if the command is invalid or if any required parameters are missing,
  // so we can safely assume that the command is valid and all required parameters are present
  await commands[command]({ filePath, targetLang: targetLang!, suggestions: suggestions! });

  await gitAddCommentReaction(Reaction.PLUS_ONE);
}

main().catch(e => {
  gitAddCommentReaction(Reaction.MINUS_ONE);
  gitPostReplyPullReviewComment(`❌ Something went wrong: "${e.message}"`);
  setBuildFailed(e);
});

export default main;
