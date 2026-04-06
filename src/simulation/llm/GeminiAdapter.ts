import { type BaseLLMAdapter, generateFallbackEmbedding } from './BaseAdapter';

export class GeminiAdapter implements BaseLLMAdapter {
  async generateContent(prompt: string, apiKey: string, activeModel: string, systemInstruction?: string): Promise<string> {
    const sysPrompt = systemInstruction || 'You are a strict JSON medical AI simulator. Ensure no markdown formatting or text besides raw JSON.';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${sysPrompt}\n\n${prompt}` }] }],
        generationConfig: { temperature: 0.2 },
        safetySettings: [
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" }
        ]
      })
    });
    
    if (!res.ok) {
        let errText = await res.text();
        if (res.status === 404) {
            try {
                const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
                const listData = await listRes.json();
                if (listData.models) {
                    const modelsArray = listData.models.map((m: { name: string }) => m.name.replace('models/', '')).filter((n: string) => n.includes('gemini'));
                    errText = `404 Not Found. Your specific API Key has access to: ${modelsArray.join(', ')}`;
                }
            } catch {}
        }
        throw new Error(`Gemini HTTP ${res.status}: ${errText}`);
    }
    const data = await res.json();
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
        throw new Error(`Gemini Safety Block or Empty Response: ${JSON.stringify(data)}`);
    }
    return data.candidates[0].content.parts[0].text.trim();
  }

  async generateEmbeddings(text: string, apiKey: string): Promise<number[]> {
    try {
        const embRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "models/text-embedding-004",
                content: { parts: [{ text }] }
            })
        });
        const rawEmb = await embRes.json();
        return rawEmb.embedding?.values || generateFallbackEmbedding();
    } catch {
        return generateFallbackEmbedding();
    }
  }
}
