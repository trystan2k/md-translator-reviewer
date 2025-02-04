import { describe, expect, vi, test, beforeEach, afterEach, Mock } from 'vitest';
import { CoreTool, generateText, GenerateTextResult } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';

import type { AIModel, Config, ContentResponse } from '@/md/ai/types';

import * as aiUtils from '@/md/ai/utils';
import { createVercelAI } from '@/md/ai/vercel-ai-adapter';

vi.mock('ai');
vi.mock('@ai-sdk/google');
vi.mock('@ai-sdk/openai');

describe('VercelAIAdapter', () => {
  describe('invalid provider', () => {
    test('should throw an error for an invalid provider', () => {
      const config: Config = { temperature: 0.7, topP: 1, topK: 40 };
      const model = 'test-model';
      const apiKey = 'test-api-key';

      try {
        createVercelAI('invalidProvider', model, apiKey, config);
      } catch (error: unknown) {
        expect((error as Error).message).toBe('Provider invalidProvider is not supported.');
      }

      expect.assertions(1);
    });
  });

  describe.each([
    ['google', createVercelAI, createGoogleGenerativeAI],
    ['openai', createVercelAI, createOpenAI],
  ])('%s AI provider', (providerName, testFn, mockFn) => {
    let mockGenerateText: GenerateTextResult<Record<string, CoreTool>, string>;
    const config: Config = { temperature: 0.7, topP: 1, topK: 40 };
    let mockProvider: Mock;
    const model = 'test-model';
    const apiKey = 'test-api-key';
    let aiProvider: AIModel;

    beforeEach(() => {
      mockProvider = vi.fn().mockReturnValue({});

      vi.mocked(generateText).mockImplementation(() => Promise.resolve(mockGenerateText));
      vi.mocked(mockFn as Mock).mockReturnValue(mockProvider);

      aiProvider = testFn(providerName, model, apiKey, config);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    describe('countTokens', () => {
      test(`should estimate count tokens correctly for ${providerName}`, async () => {
        const prompt = 'Hello, world!';
        const systemPrompt = 'System message';
        vi.spyOn(aiUtils, 'estimateTokensByWords');

        const tokenCount = await aiProvider.countTokens(prompt, systemPrompt);

        expect(aiUtils.estimateTokensByWords).toHaveBeenCalledWith([systemPrompt, prompt]);
        expect(tokenCount).toEqual({ totalTokens: 6 });
      });
    });

    describe('generateContent', () => {
      test(`should generate content correctly for ${providerName}`, async () => {
        const prompt = 'Generate this content';
        const systemPrompt = 'System instruction';
        const generatedContent = 'Generated content';
        const responseTokens = 10;

        mockGenerateText = {
          text: generatedContent,
          usage: { completionTokens: responseTokens, promptTokens: 0, totalTokens: 0 },
          toolCalls: [],
          toolResults: [],
          finishReason: 'unknown',
          warnings: [],
          steps: [],
          logprobs: [],
          experimental_providerMetadata: undefined,
          reasoning: '',
          experimental_output: '',
          request: {},
          response: {
            id: 'test-id',
            timestamp: new Date(),
            modelId: 'test-model-id',
            messages: [],
          },
        };

        const contentResponse: ContentResponse = await aiProvider.generateContent(prompt, systemPrompt);

        expect(generateText).toHaveBeenCalledWith({
          model: mockProvider(model),
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          ...config,
        });
        expect(contentResponse.text).toBe(generatedContent);
        expect(contentResponse.responseTokens).toBe(responseTokens);
      });
    });
  });
});
