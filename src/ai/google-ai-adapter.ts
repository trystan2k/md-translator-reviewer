import { GenerativeModel, GoogleGenerativeAI, Content } from '@google/generative-ai';

import type { AIModel, Config, ContentResponse } from './types';

class GoogleAiProvider implements AIModel {
  private provider: GenerativeModel;

  constructor(model: string, apiKey: string, config?: Config) {
    this.provider = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model, generationConfig: config });
  }

  async countTokens(prompt: string, systemPrompt?: string) {
    const messages: Content[] = [{ role: 'user', parts: [{ text: prompt }] }];
    if (systemPrompt) {
      messages.push({ role: 'system', parts: [{ text: systemPrompt }] });
    }

    return await this.provider.countTokens({ contents: messages });
  }

  async generateContent(prompt: string, systemPrompt?: string) {
    const messages: Content[] = [{ role: 'user', parts: [{ text: prompt }] }];

    const result = await this.provider.generateContent({ contents: messages, systemInstruction: systemPrompt });

    return {
      text: result.response.text(),
      responseTokens: result.response.usageMetadata?.candidatesTokenCount,
    } as ContentResponse;
  }
}

export const createGoogleGenerativeAI = (model: string, apiKey: string, config: Config) => {
  return new GoogleAiProvider(model, apiKey, config);
};
