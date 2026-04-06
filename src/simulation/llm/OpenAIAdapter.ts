import { type BaseLLMAdapter, generateFallbackEmbedding } from './BaseAdapter';

export class OpenAIAdapter implements BaseLLMAdapter {
  async generateContent(prompt: string, apiKey: string, activeModel: string, systemInstruction: string = 'You are a medical simulation AI that returns strictly schema-validated JSON without formatting tags.'): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: activeModel || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      })
    });
    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.choices[0].message.content.trim();
  }

  async generateEmbeddings(text: string, apiKey: string): Promise<number[]> {
    try {
      const res = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({ model: 'text-embedding-3-small', input: text })
      });
      const data = await res.json();
      return data.data?.[0]?.embedding || generateFallbackEmbedding();
    } catch {
      return generateFallbackEmbedding();
    }
  }
}
