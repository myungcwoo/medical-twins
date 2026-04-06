import { KnowledgeBase, type IdeaTemplate, type IdeaSource } from './KnowledgeNetwork';
import type { Agent } from './Agent';
import toast from 'react-hot-toast';
import { OpenAIAdapter } from './llm/OpenAIAdapter';
import { GeminiAdapter } from './llm/GeminiAdapter';
import { ClaudeAdapter } from './llm/ClaudeAdapter';
import type { BaseLLMAdapter } from './llm/BaseAdapter';

export type Provider = 'OpenAI' | 'Claude' | 'Gemini';

export interface AnalyticsConfig {
  chartType: 'Scatter' | 'Bar' | 'Line' | 'Pie';
  xAxisMetric: 'age' | 'baseHealth' | 'stressLevel' | 'bpSystolic' | 'a1c' | 'egfr';
  yAxisMetric: 'age' | 'baseHealth' | 'stressLevel' | 'bpSystolic' | 'a1c' | 'egfr';
  filterSubject: string; // Condition mapped to chronicConditions or meds. Or "ALL".
  narrative: string; // 2-sentence conversational output
}

export class LLMEngine {
  public static provider: Provider = (typeof localStorage !== 'undefined' ? localStorage.getItem('llm_provider') as Provider : null) || 'OpenAI';
  public static apiKey: string | null = typeof localStorage !== 'undefined' ? localStorage.getItem('llm_key') : null;
  public static activeModel: string = (typeof localStorage !== 'undefined' ? localStorage.getItem('llm_model') : null) || 'gemini-2.5-flash';
  public static isEnabled: boolean = (typeof localStorage !== 'undefined' ? localStorage.getItem('llm_enabled') : null) !== 'false';
  public static isGenerating = false;
  public static lastGenerationTick = 0;

  public static setEnabled(state: boolean) {
      this.isEnabled = state;
      if (typeof localStorage !== 'undefined') localStorage.setItem('llm_enabled', state.toString());
  }

  public static getAdapter(): BaseLLMAdapter {
      if (this.provider === 'Gemini') return new GeminiAdapter();
      if (this.provider === 'Claude') return new ClaudeAdapter();
      return new OpenAIAdapter();
  }

  public static setCredentials(provider: Provider, key: string, modelStr?: string) {
    this.provider = provider;
    this.apiKey = key;
    if (typeof localStorage !== 'undefined') {
        if (modelStr) {
            this.activeModel = modelStr;
            localStorage.setItem('llm_model', modelStr);
        }
        localStorage.setItem('llm_provider', provider);
        localStorage.setItem('llm_key', key);
    } else {
        if (modelStr) this.activeModel = modelStr;
    }
  }

  public static async generateProtocolAsync(author: Agent, currentTick: number) {
    if (!this.isEnabled || !this.apiKey || this.isGenerating) return;

    this.isGenerating = true;
    this.lastGenerationTick = currentTick;

    const isClinical = author.state.role === 'Researcher';
    const sourceOptions: IdeaSource[] = isClinical ? ['JAMA', 'NEJM', 'Nature', 'CDC', 'WHO', 'AHA', 'NKF', 'ADA'] : ['WebMD', 'Reddit', 'Personal'];
    const chosenSource = sourceOptions[Math.floor(Math.random() * sourceOptions.length)];

    const RAG_CONTEXT = `
[SYSTEM_RAG_VECTOR_INJECTION - STRICT ADHERENCE REQUIRED]:
- AHA Guideline 2024: Target BP for high risk should be <120/80 mmHg. ACE inhibitors or ARBs are first-line for patients with CKD.
- CDC Note: Smoking cessation instantly halts COPD acceleration.
- NKF Note: eGFR < 60 requires immediate cessation of nephrotoxic drugs like NSAIDs.
- NEJM Trial: GLP-1 agonists (Semaglutide/Tirzepatide) show heavy cardiovascular risk buffering, reversing CHF severity.
- ACC Note: Statins (Rosuvastatin) should aggressively target LDL < 70 in CAD patients.
    `;

    const prompt = `
      You are generating a medically-plausible ${isClinical ? 'clinical' : 'lifestyle'} protocol for a simulated Digital Twin ABM.
      The author of this discovery belongs to a ${author.state.role} network, referencing guidelines explicitly from: ${chosenSource}.
      
      ${RAG_CONTEXT}
      
      Generate a highly realistic protocol that could affect biological factors (Health, Stress, BP, A1C, CV Health, eGFR) strictly grounded in the RAG Vector context above.
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
      const adapter = this.getAdapter();
      const rawPayload = await adapter.generateContent(prompt, this.apiKey, this.activeModel, 'You are a medical simulation AI that returns strictly schema-validated JSON without formatting tags.');
      
      let parsed;
      try {
        parsed = JSON.parse(rawPayload);
      } catch {
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

      // Extract Semantic Embedding for Knowledge Graph visual clustering
      template.embedding = await adapter.generateEmbeddings(`${template.title} - ${template.impact.description}`, this.apiKey);

      // Push into the actual Twin simulation architecture
      KnowledgeBase.broadcast(author, template, currentTick);
      toast.success(`New Protocol Acquired via ${this.provider}: ${template.title}`, { icon: '🧬', id: 'llm-success' });

    } catch (error) {
      console.warn("LLM Generation Failed:", error);
      KnowledgeBase.broadcast(author, {
        id: `err_${Date.now()}`,
        source: 'Personal',
        type: 'Lifestyle',
        title: `${this.provider} API Rejection`,
        impact: {
          healthDelta: 0, stressDelta: 0, bpDelta: 0, a1cDelta: 0, cvDelta: 0, egfrDelta: 0, newMeds: [],
          description: `Auth or Payload Error: ${error instanceof Error ? error.message : String(error)}`
        }
      }, currentTick);
      toast.error(`LLM Generative Matrix Failed: ${this.provider} Error`, { id: 'llm-err' });
    } finally {
      this.isGenerating = false;
    }
  }

  public static async generateTrialAsync(): Promise<any> {
    if (!this.isEnabled || !this.apiKey) throw new Error("LLM Engine is disabled or missing valid API Key.");

    const prompt = `
      You are a Clinical Guidelines AI generating a novel but highly scientifically plausible landmark medical trial.
      Return ONLY a JSON object that matches the following structure exactly (NO markdown code blocks, just raw JSON):
      {
        "id": "LIT-GEN-XYZ",
        "title": "String (e.g. ALPHA Trial: Novel intervention for advanced CAD)",
        "source": "String (e.g. NEJM, JAMA, Lancet)",
        "year": "Number (2024 or 2025)",
        "intervention": "String",
        "phenotype": "String (e.g. High Risk CAD)",
        "hazardRatio": "Number (0.4 to 0.95)",
        "findings": "String (A 1 sentence clinical finding)",
        "mathMapping": "String (Explanation of how it impacts the simulated math)",
        "adverseEffects": [
            { "risk": "Moderate", "type": "String", "probability": "String (e.g. 1.2% Annual)" }
        ],
        "impact": { "healthDelta": "Number", "stressDelta": "Number", "bpDelta": "Number", "a1cDelta": "Number", "cvDelta": "Number", "egfrDelta": "Number" },
        "targetConditions": ["String array of conditions"]
      }
    `;

    try {
      let rawPayload = '';

      if (this.provider === 'OpenAI') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'system', content: 'Return strict JSON only.' }, { role: 'user', content: prompt }],
            temperature: 0.9
          })
        });
        if (!res.ok) throw new Error(`OpenAI error: ${await res.text()}`);
        const data = await res.json();
        rawPayload = data.choices[0].message.content.trim();
      } else if (this.provider === 'Gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.activeModel}:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.9 }
          })
        });
        if (!res.ok) throw new Error(`Gemini Error: ${await res.text()}`);
        const data = await res.json();
        rawPayload = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
      } else if (this.provider === 'Claude') {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerously-allow-browser': 'true' },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 500,
            system: "Return strict JSON.",
            messages: [{ role: 'user', content: prompt }]
          })
        });
        if (!res.ok) throw new Error(`Claude Error: ${await res.text()}`);
        const data = await res.json();
        rawPayload = data.content?.[0]?.text?.trim();
      }

      const filtered = rawPayload.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(filtered);

    } catch (e) {
      console.warn("Trial Generation failed", e);
      throw e;
    }
  }

  public static async parseAnalyticsQuery(query: string): Promise<AnalyticsConfig> {
    if (!this.isEnabled || !this.apiKey) throw new Error("LLM Engine is disabled or missing valid API Key.");

    const prompt = `
      You are an embedded Data Scientist AI inside a highly advanced Medical Digital Twins simulator.
      The user is asking: "${query}"

      Parse this natural language request into a strict React chart rendering configuration.
      Return STRICTLY a raw JSON object matching this schema exactly (NO markdown code blocks, NO extra text):
      {
        "chartType": "Scatter" | "Bar" | "Line" | "Pie",
        "xAxisMetric": "age" | "baseHealth" | "stressLevel" | "bpSystolic" | "a1c" | "egfr",
        "yAxisMetric": "age" | "baseHealth" | "stressLevel" | "bpSystolic" | "a1c" | "egfr",
        "filterSubject": "string (The specific medication or condition to isolate. Use 'ALL' if no specific filter is requested.)",
        "narrative": "string (A crisp, 2-sentence conversational response acting as the Data Scientist acknowledging the request and briefly explaining what the chart visually demonstrates.)"
      }
    `;

    try {
      const adapter = this.getAdapter();
      const rawPayload = await adapter.generateContent(prompt, this.apiKey, this.activeModel, 'Return strict JSON only.');

      const filtered = rawPayload.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(filtered) as AnalyticsConfig;

    } catch (e) {
      console.warn("Analytics Parse failed", e);
      throw e;
    }
  }
}
