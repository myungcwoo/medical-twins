import React from 'react';

export const AlgorithmExplanationView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-slate-300">
      <div className="mb-12">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 mb-4">
          Algorithmic Architecture
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed font-light">
          An in-depth breakdown of the deterministic math engines, pharmacological bounds, and predictive algorithms driving the multidimensional simulations within the Clinical AI Studio.
        </p>
      </div>

      {/* 1. Orchestration & Concurrency */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-white mb-6 border-b border-white/10 pb-2">1. Deterministic Concurrency (Web Workers)</h2>
        <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5 shadow-inner mb-6">
          <p className="mb-4">
            Biological progression requires massive isolated mathematical loops ticking recursively. To prevent UI-thread lockups, the core simulation offloads all <code className="text-blue-300 bg-blue-900/30 px-1.5 py-0.5 rounded text-sm">SimulationEngine</code> logic into isolated Web Workers.
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-400">
            <li><strong>Tick Cycle:</strong> Runs at a normalized 60 FPS deterministic lock. Every "Tick" advances exactly 1 biological week across thousands of `Agent` classes.</li>
            <li><strong>Hydration/Persistence:</strong> Driven asynchronously by `IndexedDB`, snapshotting entire 100-Agent multidimensional arrays locally, permitting massive state recovery instantaneously.</li>
          </ul>
        </div>
      </section>

      {/* 2. Pharmacokinetics & Synergy Matrices */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-white mb-6 border-b border-white/10 pb-2">2. Systems Pharmacology & Mathematical Bounds</h2>
        <p className="mb-4">
          A fundamental flaw in naive medical AI is <em>linear compounding</em>—assuming 10 interventions yield 10x the physiological benefit. We utilize <code className="text-indigo-300">Pharmacokinetics.ts</code> to securely map tolerance and overlapping drug toxicity.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900/70 rounded-xl p-6 border border-slate-700 hover:border-slate-500 transition-colors">
            <h3 className="text-lg font-medium text-pink-400 mb-3">Bliss Independence Model</h3>
            <p className="text-sm text-slate-400 mb-4 min-h-[60px]">
              Solves the overlap of parallel independent therapeutic pathways by treating biological impact as a probabilistic union.
            </p>
            <div className="group bg-black/60 rounded-lg p-4 font-mono text-sm shadow-xl">
              <div className="text-slate-500 mb-2">// P(A ∪ B) = P(A) + P(B) - P(A)P(B)</div>
              <div className="text-green-400">let bliss = fractions[0];</div>
              <div className="text-blue-300">for(let i=1; i&lt;N; i++) &#123;</div>
              <div className="text-white pl-4">bliss = bliss + f[i] - (bliss * f[i])</div>
              <div className="text-blue-300">&#125;</div>
            </div>
          </div>

          <div className="bg-slate-900/70 rounded-xl p-6 border border-slate-700 hover:border-slate-500 transition-colors">
            <h3 className="text-lg font-medium text-teal-400 mb-3">Asymptotic Receptor Decays</h3>
            <p className="text-sm text-slate-400 mb-4 min-h-[60px]">
              An implementation of Michaelis-Menten derivations. Models extreme receptor saturation (e.g. mega-dosing yields 0% marginal benefit).
            </p>
            <div className="group bg-black/60 rounded-lg p-4 font-mono text-sm shadow-xl">
              <div className="text-slate-500 mb-2">// E = E_max * (1 - e^(-k * dose))</div>
              <div className="text-green-400">const eMax = 20.0;</div>
              <div className="text-green-400">const k = 0.08;</div>
              <div className="text-white mt-1">
                curve = eMax * <br/>
                <span className="pl-4">(1 - Math.exp(-k * rawSum));</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ETL Data Pipelines for Training */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-white mb-6 border-b border-white/10 pb-2">3. Epidemiological Training Pipeline (ETL)</h2>
        <div className="bg-slate-900/50 rounded-xl p-6 border border-white/5 shadow-inner text-slate-300">
          <p className="mb-4">
            The <code className="text-amber-300">TrainingEngine</code> ingests raw JSON hospital claims and translates them into a deterministic mathematical model (a <strong className="text-white">Poisson Incidence Array</strong>).
          </p>
          <div className="space-y-4">
            <div className="flex border-l-2 border-indigo-500 pl-4">
              <div>
                <span className="block text-indigo-400 font-bold mb-1">Baseline Masking (180 Days)</span>
                <span className="text-sm">If a chronological patient timeline presents an ICD-10 hit in the first 180 days, it is flagged as pre-existing (<strong>not At-Risk</strong>).</span>
              </div>
            </div>
            <div className="flex border-l-2 border-green-500 pl-4">
              <div>
                <span className="block text-green-400 font-bold mb-1">Acquired Conversions</span>
                <span className="text-sm">If the specific ICD-10 block hits multiple times <em>after</em> the 180-day mask, the timeline is flagged as a mathematical <strong>Conversion</strong>.</span>
              </div>
            </div>
            <div className="flex border-l-2 border-pink-500 pl-4">
              <div>
                <span className="block text-pink-400 font-bold mb-1">Hazard Differentials</span>
                <span className="text-sm">The array computes `(Conversions / Total Exposure Years)`. This generates an Annualized Probability, which is then dynamically divided against the expected CDC baseline to derive raw Neural Weights.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Predictive Machine Learning Forecasts */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-white mb-6 border-b border-white/10 pb-2">4. AHA PREVENT Risk Forecasting</h2>
        <p className="mb-4">
          Inside <code className="text-purple-300">PredictiveEngine.ts</code>, live biometrics are constantly scanned by hard-coded clinical parameters derived from universally recognized guidelines.
        </p>
        <div className="bg-black/40 rounded-xl p-8 border border-white/10">
          <h3 className="text-xl font-medium text-white mb-4">Atherosclerotic CVD (ASCVD)</h3>
          <p className="text-sm text-slate-400 mb-6">
            The logic traces the 2023 AHA PREVENT equations explicitly, augmenting them with high-fidelity biomarker loops including hs-CRP inflammation and Coronary Calcium (CAC) Scoring.
          </p>
          <div className="grid md:grid-cols-2 gap-8 text-sm">
            <div>
              <h4 className="text-indigo-300 font-bold mb-2 pb-1 border-b border-indigo-500/30">Apex Multiplier: "Power of Zero"</h4>
              <p className="text-slate-400">If CAC = 0, the engine applies a <code className="text-white">x0.3</code> protective scalar that effectively zeroes out ASCVD mortality risk despite base cholesterol statics.</p>
            </div>
            <div>
              <h4 className="text-rose-400 font-bold mb-2 pb-1 border-b border-rose-500/30">HFrEF vs HFpEF Detection</h4>
              <p className="text-slate-400">LVEF sub-40 directly spawns a HFrEF timeline. However, normal EF + NT-proBNP &gt; 400pg/mL branches logic strictly to Diastolic HFpEF tracks.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* 5. Generator Prompts */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold text-white mb-6 border-b border-white/10 pb-2">5. Generative RAG Control Instructions</h2>
        <p className="mb-4 text-slate-300">
          The <code className="text-emerald-300">LLMEngine</code> acts as the active network feed inside the Sandbox. To prevent model hallucination, every call strictly embeds Vector Injection prompts:
        </p>
        <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
          <div className="bg-slate-800 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-700">RAG Context Prompt Block</div>
          <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
            <code className="block text-emerald-400/90">[SYSTEM_RAG_VECTOR_INJECTION - STRICT ADHERENCE REQUIRED]:</code>
            <code className="block">- AHA Guideline 2024: Target BP &lt;120/80 mmHg. ACE inhibitors are first-line for CKD.</code>
            <code className="block">- CDC Note: Smoking cessation instantly halts COPD acceleration.</code>
            <code className="block">- NEJM Trial: GLP-1 agonists (Semaglutide) show heavy cardio buffering.</code>
            <code className="block mt-4 text-orange-300">CRITICAL INSTRUCTION: Interventions change over time. You must occasionally generate protocols that are being WITHDRAWN due to originally causing severe adverse reactions...</code>
          </pre>
        </div>
      </section>

    </div>
  );
};
