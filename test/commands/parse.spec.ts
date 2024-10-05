import { describe, expect, vi, test, beforeEach } from 'vitest';

import { getCommandParams } from '@/md/commands/parse';
import { commandValidator } from '@/md/commands/validate';
import { buildContext } from '@/md/git';
import { postError } from '@/md/utils/error';

vi.mock('@/md/commands/validate');
vi.mock('@/md/git');
vi.mock('@/md/utils/error');

describe('parse', () => {
  describe('getCommandParams', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('should throw an error if comment body is not present', async () => {
      await expect(getCommandParams(null, 'filePath')).rejects.toThrow('Error: Failed to get command correctly.');
    });

    test('should call postError if the command is invalid', async () => {
      buildContext.payload = { comment: { id: 2, body: 'invalid command' } };

      await getCommandParams('invalid command', 'filePath').catch(() => {
        return null;
      });

      expect(postError).toHaveBeenCalledWith(expect.stringContaining('Invalid command'));
    });

    test('should call commandValidator with correct parameters', async () => {
      const expectedParams = {
        suggestions: 'some text ',
        filePath: 'some/path',
        command: 'mtr-translate',
        targetLang: 'en',
      };

      await getCommandParams('some text /mtr-translate en', 'some/path');

      expect(commandValidator).toHaveBeenCalledWith(expectedParams);
    });

    test('should handle missing optional parameters gracefully', async () => {
      const expectedParams = {
        suggestions: '',
        filePath: 'some/path',
        command: 'mtr-review',
        targetLang: undefined,
      };

      await getCommandParams('/mtr-review', 'some/path');

      expect(commandValidator).toHaveBeenCalledWith(expectedParams);
    });
  });
});
