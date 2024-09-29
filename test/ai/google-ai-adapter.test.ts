import { describe, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';

import { AIModel, Config, ContentResponse } from '@/md/ai/types';
import { createGoogleGenerativeAI } from '@/md/ai/google-ai-adapter';

jest.mock('@google/generative-ai');

describe('GoogleAiProvider', () => {
  const model = 'test-model';
  const apiKey = 'test-api-key';
  const config: Config = { temperature: 0.7, topP: 1, topK: 40 };

  let googleAiProvider: AIModel;
  let mockGenerativeModel: jest.Mocked<GenerativeModel>;

  beforeEach(() => {
    mockGenerativeModel = {
      countTokens: jest.fn(),
      generateContent: jest.fn(),
    } as unknown as jest.Mocked<GenerativeModel>;

    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue(mockGenerativeModel),
    }));

    googleAiProvider = createGoogleGenerativeAI(model, apiKey, config);
  });

  afterEach(() => {
    jest.clearAllMocks();
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
