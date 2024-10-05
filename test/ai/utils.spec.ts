import { describe, expect, test } from 'vitest';

import { estimateTokensByWords } from '@/md/ai/utils';

describe('estimateTokensByWords', () => {
  test('should return 0 for an empty array', () => {
    const result = estimateTokensByWords([]);
    expect(result).toBe(0);
  });

  test('should correctly estimate tokens for a single message', () => {
    const result = estimateTokensByWords(['This is a test message']);
    expect(result).toBe(7);
  });

  test('should correctly estimate tokens for multiple messages', () => {
    const result = estimateTokensByWords(['This is a test', 'Another message']);
    expect(result).toBe(9);
  });

  test('should handle messages with varying whitespace correctly', () => {
    const result = estimateTokensByWords(['This   is   a   test', 'Another    message']);
    expect(result).toBe(9);
  });

  test('should handle messages with no words correctly', () => {
    const result = estimateTokensByWords(['', '   ']);
    expect(result).toBe(0);
  });
});
