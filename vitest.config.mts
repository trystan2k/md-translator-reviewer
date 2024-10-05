import path from 'path';

import { defineConfig, configDefaults } from 'vitest/config';

import tsconfig from './tsconfig.json';

const alias = Object.fromEntries(
  // For Each Path in tsconfig.json
  Object.entries(tsconfig.compilerOptions.paths).map(([key, [value]]) => [
    // Remove the "/*" from the key and resolve the path
    key.replace('/*', ''),
    // Remove the "/*" from the value Resolve the relative path
    path.resolve(__dirname, value.replace('/*', '')),
  ]),
);

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/?(*.)+(spec).[tj]s?(x)'],
    coverage: {
      enabled: true,
      reporter: ['text', 'html'],
      exclude: [...configDefaults.coverage.exclude!, '**/{commitlint,lint-staged}.config.*'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
        perFile: true,
      },
    },
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    expect: {
      requireAssertions: true,
    },
  },
  resolve: {
    alias,
  },
});
