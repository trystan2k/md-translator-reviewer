import fs from 'fs/promises';

import { describe, expect, jest, test, beforeEach, afterEach } from '@jest/globals';

import { createGoogleGenerativeAI } from '@/md/ai/google-ai-adapter';
import { logBuildInfo } from '@/md/git';
import { AI, createAIInstance } from '@/md/ai/ai';
import { CountTokensResponse } from '@/md/ai/types';
import { createVercelAI } from '@/md/ai/vercel-ai-adapter';

jest.mock('@/md/git');

jest.mock('fs/promises', () => ({
  ...jest.requireActual<Record<string, unknown>>('fs/promises'),
  readFile: jest.fn().mockReturnValue('mock file content'),
}));

jest.mock('@/md/ai/google-ai-adapter');
jest.mock('@/md/ai/vercel-ai-adapter');

describe('AI', () => {
  describe.each([
    ['google', null, createGoogleGenerativeAI],
    ['vercel-ai-google', 'google', createVercelAI],
    ['vercel-ai-openai', 'openai', createVercelAI],
  ])('%s AI provider', (providerName, subProviderName, mockFn) => {
    const mockApiKey = 'mockApiKey';
    const mockModel = 'mockModel';
    const mockConfig = { temperature: 0.1, topP: 0.8, topK: 30 };

    const mockFilePath = 'mockFilePath';
    const mockPrompt = 'mock prompt';
    const mockSystemPrompt = 'mock system prompt';
    const mockSuggestions = 'mock suggestions';

    let ai: AI;

    beforeEach(() => {
      (mockFn as jest.Mock).mockReturnValue({
        countTokens: jest.fn<() => CountTokensResponse>().mockImplementation(() => ({ totalTokens: 100 })),
        generateContent: jest
          .fn<() => { text: string; responseTokens: number }>()
          .mockImplementation(() => ({ text: 'mock response', responseTokens: 50 })),
      });

      ai = createAIInstance(providerName, mockModel, mockApiKey, mockConfig);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('should create an AI instance with the correct provider', () => {
      if (!subProviderName) {
        expect(mockFn).toHaveBeenCalledWith(mockModel, mockApiKey, mockConfig);
      } else {
        expect(mockFn).toHaveBeenCalledWith(subProviderName, mockModel, mockApiKey, mockConfig);
      }

      expect(ai).toBeInstanceOf(AI);
    });

    test('should throw an error if the provider is not supported', () => {
      expect(() => new AI('unsupportedProvider', mockModel, mockApiKey, mockConfig)).toThrow(
        'Provider unsupportedProvider is not supported.',
      );
    });

    test('should send a request and return the response text', async () => {
      const response = await ai['sendRequest'](mockPrompt, mockFilePath, mockSystemPrompt);
      expect(response).toBe('mock response');
      expect(fs.readFile).toHaveBeenCalledWith(mockFilePath);
      expect(logBuildInfo).toHaveBeenCalledWith('Request tokens: 100');
      expect(logBuildInfo).toHaveBeenCalledWith('Response tokens: 50');
    });

    test('should review a file and return the response text', async () => {
      const response = await ai.reviewFile(mockFilePath);
      expect(response).toBe('mock response');
    });

    test('should translate a file and return the response text', async () => {
      const response = await ai.translateFile(mockFilePath, 'es');
      expect(response).toBe('mock response');
    });

    test('should apply review suggestions to a file and return the response text', async () => {
      const response = await ai.applyReview(mockFilePath, mockSuggestions);
      expect(response).toBe('mock response');
    });
  });
});
