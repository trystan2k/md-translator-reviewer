import fs from 'fs/promises';

import { describe, expect, vi, test, beforeEach, afterEach, Mock } from 'vitest';

import { createGoogleGenerativeAI } from '@/md/ai/google-ai-adapter';
import { logBuildInfo } from '@/md/git';
import { AI, createAIInstance } from '@/md/ai/ai';
import { createVercelAI } from '@/md/ai/vercel-ai-adapter';

vi.mock('fs/promises');
vi.mock('@/md/git');
vi.mock('@/md/ai/google-ai-adapter');
vi.mock('@/md/ai/vercel-ai-adapter');

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
      vi.mocked(fs.readFile).mockResolvedValue('mock response');
      vi.mocked(mockFn as Mock).mockImplementation(() => ({
        countTokens: vi.fn().mockReturnValue({ totalTokens: 100 }),
        generateContent: vi.fn().mockResolvedValue({ text: 'mock response', responseTokens: 50 }),
      }));
      ai = createAIInstance(providerName, mockModel, mockApiKey, mockConfig);
    });

    afterEach(() => {
      vi.clearAllMocks();
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
