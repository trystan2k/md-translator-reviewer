import { describe, expect, jest, test, beforeEach } from '@jest/globals';

import { getCommandParams } from '@/md/commands/parse';
import { commandValidator } from '@/md/commands/validate';
import { buildContext } from '@/md/git';
import { postError } from '@/md/utils/error';

jest.mock('@/md/commands/validate');
jest.mock('@/md/git');
jest.mock('@/md/utils/error');

describe('parse', () => {
  describe('getCommandParams', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('should throw an error if comment body is not present', async () => {
      buildContext.payload = { comment: { id: 1, body: null } };

      await expect(getCommandParams()).rejects.toThrow('Error: Failed to get command correctly.');
    });

    test('should call postError if the command is invalid', async () => {
      buildContext.payload = { comment: { id: 2, body: 'invalid command' } };

      await getCommandParams().catch(() => {
        return null;
      });

      expect(postError).toHaveBeenCalledWith(expect.stringContaining('Invalid command'));
    });

    test('should call commandValidator with correct parameters', async () => {
      buildContext.payload = { comment: { id: 3, body: 'some text /mtr-translate en', path: 'some/path' } };
      const expectedParams = {
        suggestions: 'some text ',
        filePath: 'some/path',
        command: 'mtr-translate',
        targetLang: 'en',
      };

      await getCommandParams();

      expect(commandValidator).toHaveBeenCalledWith(expectedParams);
    });

    test('should handle missing optional parameters gracefully', async () => {
      buildContext.payload = { comment: { id: 4, body: '/mtr-review', path: 'some/path' } };
      const expectedParams = {
        suggestions: '',
        filePath: 'some/path',
        command: 'mtr-review',
        targetLang: undefined,
      };

      await getCommandParams();

      expect(commandValidator).toHaveBeenCalledWith(expectedParams);
    });
  });
});
