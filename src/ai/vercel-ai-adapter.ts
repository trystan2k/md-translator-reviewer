import { CoreMessage, generateText, LanguageModelV1 } from 'ai';
import { createGoogleGenerativeAI as createGoogleGenerativeAISKD } from '@ai-sdk/google';
import { createOpenAI as createOpenAIVercelAISDK } from '@ai-sdk/openai';

import { estimateTokensByWords } from './utils';

import type { AIModel, Config, ContentResponse } from './types';

type AIProvider = (model: string) => LanguageModelV1;

const providerInitializers: Record<string, ({ apiKey }: { apiKey: string }) => AIProvider> = {
  google: createGoogleGenerativeAISKD,
  openai: createOpenAIVercelAISDK,
};

class VercelAIAdapter implements AIModel {
  private provider: AIProvider;
  private config: Config;
  private model: string;

  constructor(model: string, provider: AIProvider, config: Config) {
    this.provider = provider;
    this.config = config;
    this.model = model;
  }

  async countTokens(prompt: string, systemPrompt?: string) {
    const messages = [];
    if (systemPrompt) {
      messages.push(systemPrompt);
    }
    messages.push(prompt);

    return {
      totalTokens: estimateTokensByWords(messages),
    };
  }

  async generateContent(prompt: string, systemPrompt?: string) {
    const messages: CoreMessage[] = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const result = await generateText({
      model: this.provider(this.model),
      messages,
      ...this.config,
    });

    return {
      text: result.text,
      responseTokens: result.usage.completionTokens,
    } as ContentResponse;
  }
}

export const createVercelAI = (providerName: string, model: string, apiKey: string, config: Config) => {
  const initializer = providerInitializers[providerName];
  if (!initializer) {
    throw new Error(`Provider ${providerName} is not supported.`);
  }

  const provider = initializer({ apiKey });
  return new VercelAIAdapter(model, provider, config);
};
