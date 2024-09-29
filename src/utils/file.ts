import fs from 'fs/promises';
import path from 'path';

type GenerateOutputFilePathOptions = {
  filePath: string;
  targetLang: string;
};

export const generateOutputFilePath = ({ filePath, targetLang }: GenerateOutputFilePathOptions) => {
  const [filename, fileExt] = filePath.split('.');
  const outputFilename = `${filename}-${targetLang}.${fileExt}`;

  return outputFilename;
};

export const createFile = async (data: string, filePath: string): Promise<void> => {
  try {
    await fs.writeFile(filePath, data);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await createFile(data, filePath);
    } else {
      throw err;
    }
  }
};

export const modifyFile = async (filePath: string, data: string): Promise<void> => {
  await fs.writeFile(filePath, data);
};
