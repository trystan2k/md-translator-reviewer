import { describe, expect, test } from 'vitest';

import { availableFileExtensions } from '@/md/utils/const';

describe('availableFileExtensions', () => {
  test('should contain .md extension', () => {
    expect(availableFileExtensions).toContain('.md');
  });

  test('should contain .mdx extension', () => {
    expect(availableFileExtensions).toContain('.mdx');
  });

  test('should have a length of 2', () => {
    expect(availableFileExtensions).toHaveLength(2);
  });
});
