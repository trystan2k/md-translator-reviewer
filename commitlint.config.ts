import fs from 'fs';
import path from 'path';

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': async () => {
      const srcDir = path.resolve(new URL('.', import.meta.url).pathname, 'src');
      const files = fs.readdirSync(srcDir, { withFileTypes: true });
      const subdirs = files.filter(file => file.isDirectory()).map(dir => dir.name);
      return [2, 'always', [...subdirs, 'dist', 'config', 'deps', 'deps-dev', '*']];
    },
    'header-max-length': [2, 'always', 100],
  },
};
