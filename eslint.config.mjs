import { fixupPluginRules } from '@eslint/compat';
import js from '@eslint/js';
import unusedImports from 'eslint-plugin-unused-imports';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import ts from 'typescript-eslint';

export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  js.configs.recommended,
  ...ts.configs.recommended,
  prettierRecommended,
  {
    plugins: {
      import: fixupPluginRules(importPlugin),
      'unused-imports': unusedImports,
    },
  },
  { ignores: ['**/dist/', '**/coverage/'] },
  {
    rules: {
      'no-console': 'error',
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          'newlines-between': 'always',
        },
      ],
    },
  },
];
