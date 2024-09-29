import { describe, expect, jest, test, beforeEach } from '@jest/globals';

import { commandValidator } from '@/md/commands/validate';
import { Command } from '@/md/commands/types';
import { INVALID_FILE_EXTENSION, postError } from '@/md/utils/error';

jest.mock('@/md/utils/error', () => ({
  ...jest.requireActual<Record<string, unknown>>('@/md/utils/error'),
  postError: jest.fn(),
}));

describe('validate', () => {
  describe('commandValidator', () => {
    const availableFileExtensions = ['.md', '.txt'];

    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should return valid output when all inputs are correct', async () => {
      const input = {
        suggestions: '> Suggestion 1\r\n> Suggestion 2',
        filePath: 'test.md',
        command: Command.MtrApplyReview,
        targetLang: 'en',
      };

      const output = await commandValidator(input);

      expect(output).toEqual({
        filePath: 'test.md',
        command: Command.MtrApplyReview,
        targetLang: 'en',
        suggestions: ' Suggestion 1\r\n Suggestion 2',
      });
    });

    test('should call postError with INVALID_FILE_EXTENSION when file extension is invalid', async () => {
      const input = {
        suggestions: '> Suggestion 1\r\n> Suggestion 2',
        filePath: 'test.invalid',
        command: Command.MtrApplyReview,
        targetLang: 'en',
      };

      await commandValidator(input);

      expect(postError).toHaveBeenCalledWith(INVALID_FILE_EXTENSION);
    });

    test('should call postError when targetLang is not specified for PtTranslate command', async () => {
      const input = {
        suggestions: '> Suggestion 1\r\n> Suggestion 2',
        filePath: 'test.md',
        command: Command.MtrTranslate,
        targetLang: undefined,
      };

      await commandValidator(input);

      expect(postError).toHaveBeenCalledWith('Error: Please specify the target language.');
    });

    test('should call postError when suggestions are not specified for PtApplyReview command', async () => {
      const input = {
        suggestions: '',
        filePath: 'test.md',
        command: Command.MtrApplyReview,
        targetLang: 'en',
      };

      await commandValidator(input);

      expect(postError).toHaveBeenCalledWith('Error: Please specify the suggestions.');
    });

    test('should parse suggestions correctly for PtApplyReview command', async () => {
      const input = {
        suggestions: '> Suggestion 1\r\n> Suggestion 2',
        filePath: 'test.md',
        command: Command.MtrApplyReview,
        targetLang: 'en',
      };

      const output = await commandValidator(input);

      expect(output.suggestions).toBe(' Suggestion 1\r\n Suggestion 2');
    });
  });
});
