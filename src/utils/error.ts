import { availableFileExtensions } from './const';

import { Command } from '@/md/commands/types';
import { gitPostComment, setBuildFailed } from '@/md/git';

export const COMMAND_USAGE = `usage:
\`\`\`
/${Object.values(Command).join('|')} [input file path] [output file path] [target language]
\`\`\`
`;

const availableFileExtsString = availableFileExtensions.map(ext => `\`${ext}\``).join(', ');

export const INVALID_FILE_EXTENSION = `Unsupported file extension. Please use one of the following formats: ${availableFileExtsString}.`;

export const postError = async (message: string) => {
  await gitPostComment(`❌ ${message}`);
  setBuildFailed(message);
  throw new Error(message);
};
