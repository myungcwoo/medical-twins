import { KnowledgeBase, type IdeaTemplate, type IdeaSource } from './KnowledgeNetwork';
import type { Agent } from './Agent';

export type Provider = 'OpenAI' | 'Claude' | 'Gemini';

export class LLMEngine {
  public static provider: Provider = (localStorage.getItem('llm_provider') as Provider) || 'OpenAI';
  public static apiKey: string | null = localStorage.getItem('llm_key');
  public static isGenerating = false;
  public static lastGenerationTick = 0;

  public static setCredentials(provider: Provider, key: string) {
    this.provider = provider;
    this.apiKey = key;
    localStorage.setItem('llm_provider', provider);
    localStorage.setItem('llm_key', key);
  }

  public static async generateProtocolAsync(author: Agent, currentTick: number) {
    if (!this.apiKey || this.isGenerating) return;

    this.isGenerating = true;
    this.lastGenerationTick = currentTick;

    const isClinical = author.state.role === 'Researcher';
    const sourceOptions: IdeaSource[] = isClinical ? ['JAMA', 'NEJM', 'Nature', 'CDC', 'WHO', 'AHA', 'NKF', 'ADA'] : ['WebMD', 'Reddit', 'Personal'];
    const chosenSource = sourceOptions[Math.floor(Math.random() * sourceOptions.length)];

    const prompt = `
      You are generating a medically-plausible ${isClinical ? 'clinical' : 'lifestyle'} protocol for a simulated Digital Twin ABM.
      The author of this discovery belongs to a ${author.state.role} network, referencing guidelines explicitly from: ${chosenSource}.
      
      Generate a highly realistic protocol that could affect biological factors (Health, Stress, BP, A1C, CV Health, eGFR).
      CRITICAL INSTRUCTION: Interventions change over time. You must occasionally generate protocols that are being WITHDRAWN or REDUCED because they originally caused severe adverse reactions (e.g. "Previous protocol X actually causes kidney decay, halting immediately" yielding negative effects if continued, or positive health deltas upon removal).
      
      Return strictly and ONLY a JSON object matching this TypeScript interface exactly:
      {
        "title": string, // Short title (e.g., "AHA Updated Hypertension Guidelines", or "FDA Retracts Drug X due to Nephrotoxicity")
        "healthDelta": number, // Impact on Base Health (usually -10 to 10)
        "stressDelta": number, // Impact on Stress (usually -15 to 15)
        "bpDelta": number,     // Impact on Systolic BP (usually -10 to 10)
        "a1cDelta": number,    // Impact on A1C (usually -0.5 to 0.5)
        "cvDelta": number,     // Impact on Cardiovascular (usually -10 to 10)
        "egfrDelta": number,   // Impact on Kidney Filtration (usually -5 to 5)
        "newMeds": string[],   // Drug classes added or removed
        "description": string  // A 1-sentence narrative describing the medical literature rationale, or the withdrawal due to adverse trade-offs.
      }
      
      Do not include markdown tags (\`\`\`json). Just the raw JSON object. Ensure the math is realistic.
    `;

    try {
      let rawPayload = '';

      if (this.provider === 'OpenAI') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a medical simulation AI that returns strictly schema-validated JSON without formatting tags.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.8
          })
        });
        if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
        const data = await res.json();
        rawPayload = data.choices[0].message.content.trim();
      
      } else if (this.provider === 'Gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `You are a strict JSON medical AI simulator. Ensure no markdown formatting or text besides raw JSON: ${prompt}` }] }],
            generationConfig: { temperature: 0.8 }
          })
        });
        if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
        const data = await res.json();
        rawPayload = data.candidates[0].content.parts[0].text.trim();

      } else if (this.provider === 'Claude') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerously-allow-browser': 'true'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 500,
            system: "You are a medical simulation AI that returns strictly schema-validated JSON without formatting tags.",
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8
          })
        });
        if (!res.ok) throw new Error(`Claude HTTP ${res.status}`);
        const data = await res.json();
        rawPayload = data.content[0].text.trim();
      }
      
      let parsed;
      try {
        parsed = JSON.parse(rawPayload);
      } catch (e) {
        // Strip out any accidental markdown blocks the LLM might append
        const filtered = rawPayload.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(filtered);
      }

      const template: IdeaTemplate = {
        id: `ai_${Math.random().toString(36).substr(2, 9)}`,
        source: chosenSource,
        type: isClinical ? 'Clinical' : 'Lifestyle',
        title: parsed.title || 'Novel Generated Protocol',
        impact: {
          healthDelta: parsed.healthDelta || 0,
          stressDelta: parsed.stressDelta || 0,
          bpDelta: parsed.bpDelta || 0,
          a1cDelta: parsed.a1cDelta || 0,
          cvDelta: parsed.cvDelta || 0,
          egfrDelta: parsed.egfrDelta || 0,
          newMeds: parsed.newMeds || [],
          description: parsed.description || 'Executed successfully via network adoption.'
        }
      };

      // Push into the actual Twin simulation architecture
      KnowledgeBase.broadcast(author, template, currentTick);

    } catch (error) {
      console.warn("LLM Generation Failed (Token limit elapsed or Invalid JSON):", error);
    } finally {
      this.isGenerating = false;
    }
  }
}
