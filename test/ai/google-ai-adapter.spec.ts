import { describe, expect, vi, test, beforeEach, afterEach, Mocked } from 'vitest';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';

import { AIModel, Config, ContentResponse } from '@/md/ai/types';
import { createGoogleGenerativeAI } from '@/md/ai/google-ai-adapter';

vi.mock('@google/generative-ai');

describe('GoogleAiProvider', () => {
  const model = 'test-model';
  const apiKey = 'test-api-key';
  const config: Config = { temperature: 0.7, topP: 1, topK: 40 };

  let googleAiProvider: AIModel;
  let mockGenerativeModel: Mocked<GenerativeModel>;

  beforeEach(() => {
    mockGenerativeModel = {
      countTokens: vi.fn(),
      generateContent: vi.fn(),
    } as unknown as Mocked<GenerativeModel>;

    vi.mocked(GoogleGenerativeAI).mockImplementation(() => ({
      apiKey,
      getGenerativeModel: vi.fn().mockReturnValue(mockGenerativeModel),
      getGenerativeModelFromCachedContent: vi.fn(),
    }));

    googleAiProvider = createGoogleGenerativeAI(model, apiKey, config);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('countTokens', () => {
    test('should count tokens correctly', async () => {
      const prompt = 'Hello, world!';
      const systemPrompt = 'System message';
      const expectedTokenCount = 5;

      mockGenerativeModel.countTokens.mockResolvedValue({ totalTokens: expectedTokenCount });

      const tokenCount = await googleAiProvider.countTokens(prompt, systemPrompt);

      expect(mockGenerativeModel.countTokens).toHaveBeenCalledWith({
        contents: [
          { role: 'user', parts: [{ text: prompt }] },
          { role: 'system', parts: [{ text: systemPrompt }] },
        ],
      });
      expect(tokenCount).toEqual({ totalTokens: expectedTokenCount });
    });
  });

  describe('generateContent', () => {
    test('should generate content correctly', async () => {
      const prompt = 'Generate this content';
      const systemPrompt = 'System instruction';
      const generatedText = 'Generated content';
      const responseTokens = 10;

      mockGenerativeModel.generateContent.mockResolvedValue({
        response: {
          text: () => generatedText,
          usageMetadata: { candidatesTokenCount: responseTokens, promptTokenCount: 0, totalTokenCount: 0 },
          functionCalls: () => [],
          functionCall: () => undefined,
        },
      });

      const contentResponse: ContentResponse = await googleAiProvider.generateContent(prompt, systemPrompt);

      expect(mockGenerativeModel.generateContent).toHaveBeenCalledWith({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: systemPrompt,
      });
      expect(contentResponse.text).toBe(generatedText);
      expect(contentResponse.responseTokens).toBe(responseTokens);
    });
  });
});
