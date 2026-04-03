import React from 'react';

export const DevDocumentation: React.FC = () => {
    
    if (!import.meta.env.DEV) return null; // Hard failsafe: this route should never exist in production.

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out', color: '#f8fafc', padding: '1rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            
            {/* Header Block */}
            <div style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', padding: '2.5rem', borderRadius: '16px', border: '1px solid rgba(236, 72, 153, 0.3)', marginBottom: '3rem', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                <h1 style={{ color: '#ec4899', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '2.5rem' }}>
                    <span role="img" aria-label="blueprints">📐</span> Engine Architecture & Internal Schemas (DEV)
                </h1>
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#cbd5e1', lineHeight: '1.8', maxWidth: '900px' }}>
                    The Medical Twins platform is a strictly deterministic agent-based modeling (ABM) engine paired with off-browser PyTorch deep learning.
                    This document explicitly maps the physiological states, the React temporal execution loop, the mathematical predictors, and the pharmacokinetics overriding systems. 
                    Refer to this documentation strictly when augmenting <code>AgentState</code> payloads or building new Pathology pipelines.
                </p>
            </div>

            {/* 1. Temporal Constraints & Agent Loop */}
            <section style={{ marginBottom: '4rem' }}>
                <h2 style={{ color: '#3b82f6', borderBottom: '2px solid #1e3a8a', paddingBottom: '0.5rem', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span role="img" aria-label="clock">⏱️</span> 1. The Core Chronometer Loop (`Agent.ts`)
                </h2>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <p style={{ marginTop: 0, lineHeight: '1.6', fontSize: '1.05rem', color: '#e2e8f0' }}>
                        The simulation runs on a strictly quantized temporal tracker defined as <strong>1 Tick = 1 Week</strong>. 
                        No algorithms calculate on a daily scale due to severe compounding browser thread blocking. The React DOM cycle controls the <code>ticks</code> state inside <code>App.tsx</code>. 
                    </p>
                    
                    <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '8px', border: '1px solid #334155', margin: '1.5rem 0', overflowX: 'auto' }}>
                        <pre style={{ margin: 0, color: '#60a5fa', fontFamily: 'monospace', fontSize: '0.9rem' }}>
{`// Inside SimulationEngine.tick()
export class Engine {
  tick() {
    this.currentTick++;
    const isYearlyTick = this.currentTick % 52 === 0;

    for (const agent of this.agents) {
      if (agent.state.isDead) continue;
      
      // 1. Weekly decay calculations
      agent.processDiseaseProgression();
      agent.processDrugPharmacokinetics();

      // 2. Yearly heavy logic mapping
      if (isYearlyTick) {
        agent.state.age++;
        agent.assessYearlyMortality(); 
        
        // Massive memory optimization: Only snapshot history once a year!
        agent.state.biometricHistory.push({
           a1c: agent.state.labs.a1c, 
           bpSystolic: agent.state.vitals.bpSystolic,
           /* ... */
        });
      }
    }
  }
}`}
                        </pre>
                    </div>

                    <h4 style={{ color: '#93c5fd', marginTop: '2rem' }}>A Note on SDOH (Social Determinants of Health)</h4>
                    <p style={{ lineHeight: '1.6', color: '#94a3b8' }}>
                        The <code>AgentState</code> struct inherently stores <code>wealth</code> (0-100), <code>accessToCare</code>, and <code>foodDesert</code> booleans. 
                        We actively mathematically sabotage perfect clinical protocols inside the Event loop. For example, if a <code>foodDesert = true</code> agent adopts a massive organic Diet Intervention, their biological upside is instantly capped via an efficacy decay multiplier inside <code>Agent.ts</code> simulating their inability to strictly source the protocol.
                    </p>
                </div>
            </section>

            {/* 2. State Payload Schemas */}
            <section style={{ marginBottom: '4rem' }}>
                <h2 style={{ color: '#10b981', borderBottom: '2px solid #064e3b', paddingBottom: '0.5rem', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span role="img" aria-label="dna">🧬</span> 2. Biological Schema Architecture
                </h2>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <p style={{ marginTop: 0, lineHeight: '1.6', color: '#e2e8f0' }}>
                        As of Phase 7, the digital twin spans way beyond simple vitals (BMI/BP). The <code>Labs</code> and <code>Imaging</code> interfaces define the absolute hard bounds of predicting mortality arrays. 
                    </p>

                    <div style={{ background: '#064e3b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #047857', margin: '1.5rem 0', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}>
                        <pre style={{ margin: 0, color: '#a7f3d0', fontFamily: 'monospace', fontSize: '0.9rem' }}>
{`export interface AgentState {
  id: string;
  age: number;
  sex: 'Male' | 'Female';
  chronicConditions: string[];   // e.g. ["Diabetes", "CHF", "CKD"]
  
  vitals: {
    bpSystolic: number;          // 90 - 250 mmHg
    bmi: number;                 // 18.5 - 50.0
  };

  labs: {
    a1c: number;                 // Glycemic map (Normal: ~ 5.4, Severe: > 8.0)
    ntProBNP: number;            // [NEW] Tracks active volume overload in CHF
    hsCRP: number;               // [NEW] Vascular inflammation (ASCVD risk)
    uacr: number;                // [NEW] Albumin shedding mapping Renal Nephropathy
  };

  imaging: {                     
    lvef: number;                // [NEW] Left Ventricular EF (HFpEF vs HFrEF)
    cacScore: number;            // [NEW] Calcium Plaque Score (0 to > 1000)
  };
}`}
                        </pre>
                    </div>
                </div>
            </section>

            {/* 3. Predictive Modules */}
            <section style={{ marginBottom: '4rem' }}>
                <h2 style={{ color: '#8b5cf6', borderBottom: '2px solid #4c1d95', paddingBottom: '0.5rem', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span role="img" aria-label="brain">🧠</span> 3. PredictiveEngine Heuristics (AHA/JAMA)
                </h2>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                    <p style={{ marginTop: 0, lineHeight: '1.6', color: '#e2e8f0' }}>
                        Because standard ABM rule bindings decay rapidly when scaling 1,000s of agents, <code>PredictiveEngine.ts</code> maps deterministic heuristics based explicitly on published clinical guidelines. These engines dictate the exact percentage <strong>Risk Level</strong> displayed on the dashboard nodes.
                    </p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                        
                        <div style={{ background: 'rgba(236, 72, 153, 0.05)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
                            <h4 style={{ color: '#f472b6', margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Atherosclerotic ASCVD Risk</h4>
                            <p style={{ fontSize: '0.9rem', color: '#fbcfe8', lineHeight: '1.6' }}>
                                Driven strictly by the <strong>CAC Score</strong> (Coronary Artery Calcium). Algorithms check: <code>cacScore === 0</code> forces the "Power of Zero" rule explicitly crushing stroke base risk by 70%. Values <code>&gt; 100</code> multiply baseline 10Y risk by 3.5x demanding aggressive Statin utilization regardless of baseline LDL.
                            </p>
                        </div>
                        
                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <h4 style={{ color: '#34d399', margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Heart Failure (CHF) Trajectories</h4>
                            <p style={{ fontSize: '0.9rem', color: '#a7f3d0', lineHeight: '1.6' }}>
                                Explicitly evaluates <strong>LVEF</strong> (Ejection Fraction). <code>lvef &lt; 40%</code> designates severe HFrEF (inducing a massive 5x mortality modifier demanding ARNI/Entresto prescription). Furthermore, <strong>NT-proBNP</strong> levels <code>&gt; 400 pg/mL</code> trigger acute volume overload risk trapping even structurally normal LV mapping HFpEF.
                            </p>
                        </div>

                        <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                            <h4 style={{ color: '#fbbf24', margin: '0 0 1rem 0', fontSize: '1.2rem' }}>Renal Collapse (CKD Progress)</h4>
                            <p style={{ fontSize: '0.9rem', color: '#fde68a', lineHeight: '1.6' }}>
                                Glomerular filtration is heavily guarded. <strong>eGFR</strong> checks map G4/G5 stages scaling mortality logrithmically. The engine explicitly hunts for <strong>UACR</strong> (Albumin) spillage. If <code>uacr &gt; 30</code>, it recognizes physical nephropathy warning the agent to halt NSAIDs and trigger ACE blockers.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* 4. Deep Learning & Edge Processing */}
            <section style={{ marginBottom: '4rem' }}>
                <h2 style={{ color: '#f59e0b', borderBottom: '2px solid #78350f', paddingBottom: '0.5rem', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span role="img" aria-label="computer">💻</span> 4. Deep Learning Decoupling (PyTorch & ONNX)
                </h2>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <p style={{ marginTop: 0, lineHeight: '1.6', color: '#e2e8f0' }}>
                        The frontend TypeScript application serves rapidly mutating ABM state space logic. <strong>It does not natively calculate cross-dimensional deep learning heuristics locally in JS.</strong> 
                        To train models on the RWE generated by these clones, we utilize a strictly decoupled architecture.
                    </p>
                    
                    <ul style={{ lineHeight: '1.8', margin: '1.5rem 0', paddingLeft: '1.5rem', color: '#cbd5e1' }}>
                        <li><strong style={{ color: '#fbbf24' }}>Synthetic Generation Pipeline:</strong> The frontend <code>BackendTrainer.tsx</code> portal contains a <code>handleSyntheticFarming()</code> script. It automatically boots 1,000 headless agents, runs them sequentially to 50 years (cranking millions of biometric snapshots array entries), and bundles them.</li>
                        <li><strong style={{ color: '#fbbf24' }}>Local Uvicorn Server:</strong> That matrix is POSTed to the backend Python FastApi layer (<code>model_training/api.py</code>) running PyTorch Neural ODE Transformer networks.</li>
                        <li><strong style={{ color: '#fbbf24' }}>ONNX Edge Delivery:</strong> Once the Python model converges on disease prediction arrays minimizing loss, it outputs a static <code>.onnx</code> artifact. The React frontend pulls this using `onnxruntime-web` WASM to run lightning-fast inference natively on the client browser without needing constant GPU server connection.</li>
                    </ul>

                    <div style={{ background: '#3f3f46', padding: '1.5rem', borderRadius: '8px', border: '1px solid #71717a', overflowX: 'auto' }}>
                        <code style={{ color: '#fca5a5', fontFamily: 'monospace' }}>
                          // Edge WASM Execution via InferenceEngine.ts <br/>
                          const session = await ort.InferenceSession.create('/models/mt_chf_predictor.onnx');<br/>
                          const tensor = new ort.Tensor('float32', [agent.state.labs.lvef, agent.state.vitals.bpSystolic], [1, 2]);<br/>
                          const result = await session.run(`{` input: tensor `}`); <br/>
                          return result.output.data[0];
                        </code>
                    </div>
                </div>
            </section>

        </div>
    );
};
