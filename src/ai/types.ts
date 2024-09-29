export type CountTokensResponse = {
  totalTokens: number;
};

export type ContentResponse = { text: string; responseTokens?: number };

export interface AIModel {
  countTokens: (prompt: string, systemPrompt?: string) => Promise<CountTokensResponse>;
  generateContent: (prompt: string, systemPrompt?: string) => Promise<ContentResponse>;
}

export type Config = {
  temperature: number;
  topP: number;
  topK: number;
};

export type AIProviderInitializer = (model: string, apiKey: string, config: Config) => AIModel;
