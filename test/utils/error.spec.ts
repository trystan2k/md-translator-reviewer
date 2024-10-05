import { describe, expect, vi, test } from 'vitest';

import { COMMAND_USAGE, INVALID_FILE_EXTENSION, postError } from '@/md/utils/error';
import { gitPostComment, setBuildFailed } from '@/md/git';
import { availableFileExtensions } from '@/md/utils/const';
import { Command } from '@/md/commands/types';

vi.mock('@/md/git', () => ({
  gitPostComment: vi.fn(),
  setBuildFailed: vi.fn(),
}));

describe('error.ts', () => {
  describe('COMMAND_USAGE', () => {
    test('should have the correct command usage string', () => {
      const expectedUsage = `usage:
\`\`\`
/${Object.values(Command).join('|')} [input file path] [output file path] [target language]
\`\`\`
`;
      expect(COMMAND_USAGE).toBe(expectedUsage);
    });
  });

  describe('INVALID_FILE_EXTENSION', () => {
    test('should have the correct invalid file extension message', () => {
      const availableFileExtsString = availableFileExtensions.map(ext => `\`${ext}\``).join(', ');
      const expectedMessage = `Unsupported file extension. Please use one of the following formats: ${availableFileExtsString}.`;
      expect(INVALID_FILE_EXTENSION).toBe(expectedMessage);
    });
  });

  describe('postError', () => {
    test('should call gitPostComment, setBuildFailed, and exit the process', async () => {
      const message = 'Test error message';

      await expect(postError(message)).rejects.toThrow('Test error messag');
      expect(gitPostComment).toHaveBeenCalledWith(`❌ ${message}`);
      expect(setBuildFailed).toHaveBeenCalledWith(message);
    });
  });
});
