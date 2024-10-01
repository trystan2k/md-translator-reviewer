import path from 'path';

import { Command } from './types';

import { availableFileExtensions } from '@/md/utils/const';
import { INVALID_FILE_EXTENSION, postError } from '@/md/utils/error';

type CommandParamsOutput = {
  command: Command;
  targetLang: string | undefined;
  suggestions: string | undefined;
};

type CommandParamsInput = {
  suggestions: string | undefined;
  filePath: string;
  command: string;
  targetLang: string | undefined;
};

const isValidFileExt = (filename: string): boolean => {
  const availabilities = new Set([...availableFileExtensions]);
  const fileExt = path.extname(filename);
  return availabilities.has(fileExt);
};

export const commandValidator = async ({
  suggestions,
  filePath,
  command,
  targetLang,
}: CommandParamsInput): Promise<CommandParamsOutput> => {
  if (!isValidFileExt(filePath)) {
    await postError(INVALID_FILE_EXTENSION);
  }

  if (command === Command.MtrTranslate && !targetLang) {
    await postError('Error: Please specify the target language.');
  }

  let parsedSuggestions: string | undefined;
  if (command === Command.MtrApplyReview) {
    if (!suggestions || suggestions.trim().length === 0) {
      await postError('Error: Please specify the suggestions.');
    } else {
      parsedSuggestions = suggestions
        .split(/\r\n/)
        .filter((v: string) => v.startsWith('>'))
        .map((v: string) => v.replace('>', ''))
        .join('\r\n');
    }
  }

  return {
    command: command as Command,
    targetLang,
    suggestions: parsedSuggestions,
  };
};
