export interface BaseLLMAdapter {
  generateContent(prompt: string, apiKey: string, activeModel: string, systemInstruction?: string): Promise<string>;
  generateEmbeddings(text: string, apiKey: string): Promise<number[]>;
}

export const generateFallbackEmbedding = () => Array.from({length: 128}, () => (Math.random() * 2) - 1);
