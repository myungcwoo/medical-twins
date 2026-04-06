import { type BaseLLMAdapter, generateFallbackEmbedding } from './BaseAdapter';

export class ClaudeAdapter implements BaseLLMAdapter {
  async generateContent(prompt: string, apiKey: string, _activeModel: string, systemInstruction: string = "You are a medical simulation AI that returns strictly schema-validated JSON without formatting tags."): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerously-allow-browser': 'true'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: systemInstruction,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
      })
    });
    if (!res.ok) throw new Error(`Claude HTTP ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.content[0].text.trim();
  }

  async generateEmbeddings(): Promise<number[]> {
    // Claude does not currently provide a unified public embeddings API easily accessible here via Haiku
    return generateFallbackEmbedding();
  }
}
