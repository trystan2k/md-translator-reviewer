import fs from 'fs/promises';

import { createGoogleGenerativeAI } from './google-ai-adapter';
import { AIModel, AIProviderInitializer, Config } from './types';
import { createVercelAI } from './vercel-ai-adapter';

import { logBuildInfo } from '@/md/git';

export type CountTokensResponse = {
  totalTokens: number;
};

const providerInitializers: Record<string, AIProviderInitializer> = {
  google: createGoogleGenerativeAI,
  'vercel-ai-google': (model, apiKey, config) => createVercelAI('google', model, apiKey, config),
  'vercel-ai-openai': (model, apiKey, config) => createVercelAI('openai', model, apiKey, config),
};

export class AI {
  private provider: AIModel;

  constructor(providerName: string, modelName: string, apiKey: string, config: Config) {
    this.provider = this.createProvider(providerName, modelName, apiKey, config);
  }

  private createProvider(providerName: string, modelName: string, apiKey: string, config: Config) {
    const initializer = providerInitializers[providerName];
    if (!initializer) {
      throw new Error(`Provider ${providerName} is not supported.`);
    }

    return initializer(modelName, apiKey, config);
  }

  private async sendRequest(propmt: string, filePath: string, systemPrompt?: string): Promise<string> {
    const fileContent = await fs.readFile(filePath);

    const finalPrompt = `${propmt}\n${fileContent}`;

    const { totalTokens } = await this.provider.countTokens(finalPrompt, systemPrompt);

    logBuildInfo(`Request tokens: ${totalTokens}`);

    const result = await this.provider.generateContent(finalPrompt, systemPrompt);

    logBuildInfo(`Response tokens: ${result.responseTokens}`);

    return result.text;
  }

  async reviewFile(filePath: string): Promise<string> {
    const systemPrompt = `
    You are a review tool.
    As a review tool, you will solely return only a list of suggestions to fix any grammar error or improvements
    in reading  without losing or amending the original formatting and in the same language as the input file. 
    Your reviews are accurate, aiming not to deviate from the original structure, content, writing style and tone. 
    Your reviews must always be a bullet list with every item to have the same format: 'In the X paragraph, this "sentence" can be better written as "suggestion"'. 
    You can have multiple suggestions for the same paragraph.
    Your reviews must always inspect every paragraph and every sentence. You are a professional tool, and you are not allowed to make any mistakes.
    You should try to avoid suggestions that result in the same sentence as the original one.`;

    const prompt = 'Please review the given text';

    return this.sendRequest(prompt, filePath, systemPrompt);
  }

  async translateFile(filePath: string, targetLang: string): Promise<string> {
    const systemPrompt = `
    You are a translation tool.
    As a translation tool, you will solely return the same string in ${targetLang} without losing or amending the original 
    formatting. Your translations are accurate, aiming not to deviate from the original structure, 
    content, writing style and tone. 
    You should not translate any code snippets or any text that is not in the input language.
    You should also review the translation for any grammar errors or improvements in reading without losing or amending the original formatting.
    You are a professional tool, and you are not allowed to make any mistakes.`;

    const prompt = 'Please translate the given text';

    return this.sendRequest(prompt, filePath, systemPrompt);
  }

  async applyReview(filePath: string, suggestions: string): Promise<string> {
    const systemPrompt = `
    You are a review tool. You will receive a review suggestions list to be applied to a given text snippet from a file. 
    As a review tool, you will apply the suggestions given  without losing or amending the original formatting and in the same language as the input file. 
    You are a professional tool, and you are not allowed to make any mistakes.`;

    const prompt = `Please apply the given review suggestions: ${suggestions} to the given text`;

    return this.sendRequest(prompt, filePath, systemPrompt);
  }
}

export const createAIInstance = (aiProvider: string, aiModel: string, aiApiKey: string, aiProviderConfig: Config) => {
  return new AI(aiProvider, aiModel, aiApiKey, aiProviderConfig);
};
