import { commandValidator } from './validate';
import { Command } from './types';

import { COMMAND_USAGE, postError } from '@/md/utils/error';

export const getCommandParams = async (comment: string | null | undefined, filePath: string) => {
  if (!comment) throw new Error('Error: Failed to get command correctly.');

  const availableCommands = Object.values(Command).join('|');
  const regex = new RegExp(`([\\s\\S]*)\\/(${availableCommands})\\s*(\\S*)?`);
  const match = regex.exec(comment);

  if (!match || match.length < 1) {
    await postError(`Invalid command: \`${comment}\`\n${COMMAND_USAGE}`);
  }

  const [, suggestions, command, targetLang] = match!;

  return commandValidator({ suggestions, command, filePath, targetLang });
};
