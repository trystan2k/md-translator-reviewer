import fs from 'fs/promises';
import path from 'path';

import { describe, expect, jest, test } from '@jest/globals';

import { createFile, generateOutputFilePath, modifyFile } from '@/md/utils/file';

jest.mock('fs/promises');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('generateOutputFilePath', () => {
  test('should generate the correct output file path', () => {
    const options = { filePath: 'example.txt', targetLang: 'es' };
    const result = generateOutputFilePath(options);
    expect(result).toBe('example-es.txt');
  });
});

describe('createFile', () => {
  test('should create a file with the given data', async () => {
    const data = 'Hello, world!';
    const filePath = 'path/to/file.txt';

    mockedFs.writeFile.mockResolvedValueOnce(undefined);

    await createFile(data, filePath);

    expect(mockedFs.writeFile).toHaveBeenCalledWith(filePath, data);
  });

  test('should create directories if they do not exist', async () => {
    const data = 'Hello, world!';
    const filePath = 'path/to/file.txt';

    mockedFs.writeFile.mockRejectedValueOnce({ code: 'ENOENT' });
    mockedFs.mkdir.mockResolvedValueOnce(undefined);
    mockedFs.writeFile.mockResolvedValueOnce(undefined);

    await createFile(data, filePath);

    expect(mockedFs.mkdir).toHaveBeenCalledWith(path.dirname(filePath), { recursive: true });
    expect(mockedFs.writeFile).toHaveBeenCalledWith(filePath, data);
  });

  test('should throw an error if writing fails for reasons other than ENOENT', async () => {
    const data = 'Hello, world!';
    const filePath = 'path/to/file.txt';

    const error = new Error('Some error');
    mockedFs.writeFile.mockRejectedValueOnce(error);

    await expect(createFile(data, filePath)).rejects.toThrow(error);
  });
});

describe('modifyFile', () => {
  test('should modify a file with the given data', async () => {
    const data = 'Updated content';
    const filePath = 'path/to/file.txt';

    mockedFs.writeFile.mockResolvedValueOnce(undefined);

    await modifyFile(filePath, data);

    expect(mockedFs.writeFile).toHaveBeenCalledWith(filePath, data);
  });
});
