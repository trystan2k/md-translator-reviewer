import { commandValidator } from './validate';
import { Command } from './types';

import { buildContext } from '@/md/git';
import { COMMAND_USAGE, postError } from '@/md/utils/error';

export const getCommandParams = async () => {
  const comment = buildContext.payload.comment?.body;
  if (!comment) throw new Error('Error: Failed to get command correctly.');

  const filePath: string = buildContext.payload.comment?.path;

  const availableCommands = Object.values(Command).join('|');
  const regex = new RegExp(`([\\s\\S]*)\\/(${availableCommands})\\s*(\\S*)?`);
  const match = regex.exec(comment);

  if (!match || match.length < 1) {
    await postError(`Invalid command: \`${comment}\`\n${COMMAND_USAGE}`);
  }

  const [, suggestions, command, targetLang] = match!;

  return commandValidator({ suggestions, filePath, command, targetLang });
};
