import type { FC } from 'react';

export const Explanation: FC = () => {
  return (
    <div className="explanation-container glass-panel" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out', overflowY: 'auto', maxHeight: '100%' }}>
      <h2 style={{ color: '#a78bfa', marginBottom: '1.5rem', borderBottom: '1px solid rgba(167, 139, 250, 0.3)', paddingBottom: '0.5rem' }}>Core Simulation Architecture</h2>
      <p style={{ color: '#e2e8f0', lineHeight: 1.6, fontSize: '1.05rem', marginBottom: '2rem' }}>
        As a core pillar of the Clinical AI Studio, the Digital Patient Simulation architecture represents a highly advanced <strong>Data-Driven Clinical Prediction Engine</strong>. It discards hardcoded physiological rules in favor of a genuine full-stack Machine Learning Operations (MLOps) pipeline, bridging Python Deep Learning directly into React WebAssembly. 
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ color: '#10b981', margin: '0 0 0.8rem 0' }}>1. The Multi-Agent Generative Network</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            The primary simulation houses autonomous digital patients structurally organized into a unified information network. <strong>Researchers</strong> actively ping integrated external Language Models (OpenAI, Gemini, Claude). These LLMs are heavily fenced by system prompts forcing them to generate novel clinical interventions strictly derived from reputable authorities (<strong>CDC, WHO, JAMA, Nature</strong>). The prompts explicitly force the generation of "changing literature," including inventing sudden drug retractions and adverse-event warnings that actively crash or save agent trajectories!
          </p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ color: '#f59e0b', margin: '0 0 0.8rem 0' }}>2. PyTorch Deep Learning Backend</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Under the hood, agent mortality is not driven by heuristic guesses. The platform utilizes a literal <code>torch.nn.Module</code> (Multi-Layer Perceptron) hosted via a live FastAPI service. By feeding raw agent parameters into the `/train` endpoint, the Neural Network mathematically fits tensor gradients via the Adam optimizer, calculating the exact long-term hazard bounds (Stroke, CHF, Diabetic Coma, COPD) natively leveraging the GPU/CPU.
          </p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #14b8a6' }}>
          <h3 style={{ color: '#14b8a6', margin: '0 0 0.8rem 0' }}>3. Real-Time ONNX WebAssembly (WASM) Loop</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Because running REST API calls 50 times a second for 100 clones would crash your browser, the loop is completely closed natively. When the Python PyTorch model finishes backpropagating, it calls <code>torch.onnx.export()</code> to auto-compile the AI structural weights into a binary `.onnx` graph. The React browser clones natively ingest this binary memory matrix using Microsoft’s <strong>onnxruntime-web</strong>, allowing them to explicitly run 60FPS Deep Learning inference directly on their own physiological vitals natively in your browser.
          </p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ color: '#3b82f6', margin: '0 0 0.8rem 0' }}>4. Probabilistic Multiverse Custom Trials</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            The overarching global 100-Agent simulation simply serves as a massive experimental proving ground. By navigating to the <strong>Simulate Me!</strong> ingestion tool, you can deploy a customized real-world patient narrative securely detached from the population bounds. The app dynamically splits the multiverse—spawning exactly 50 Control Clones and 50 Optimized Clones equipped with your selected protocols—constructing a fully isolated probabilistic testing dashboard visually comparing the exact Neural Trajectory deltas.
          </p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
          <h3 style={{ color: '#ef4444', margin: '0 0 0.8rem 0' }}>5. Narrative Physician EHR Subsystems</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            As agents progress, their data isn't just displayed as raw JSON. The UI actively generates deeply immersive contextual Narrative Physician Notes logging their simulated timelines—bridging the gap between raw analytical tensor telemetry and authentic human clinical storytelling. 
          </p>
        </div>

        <h2 style={{ color: '#a78bfa', marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid rgba(167, 139, 250, 0.3)', paddingBottom: '0.5rem' }}>Biological Data Matrices & Variables</h2>
        <p style={{ color: '#e2e8f0', lineHeight: 1.6, fontSize: '1.05rem', marginBottom: '1.5rem' }}>
          The Mathematical Agents calculate their survival trajectories explicitly utilizing deeply parameterized clinical schemas. Every single Twin evaluates the following complex variable architectures under the hood:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: '#60a5fa', marginTop: 0, marginBottom: '0.5rem' }}>🧬 Biometric Vitals & Labs</h4>
            <ul style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
              <li><strong>Vitals Engine:</strong> Systolic/Diastolic Blood Pressure (BP), Resting Heart Rate (HR), Body Mass Index (BMI).</li>
              <li><strong>Laboratory Metrics:</strong> Hemoglobin A1c (Endocrine), LDL Cholesterol (Lipids), eGFR (Renal capacity), Global CV Health (Cardiac array).</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: '#fca5a5', marginTop: 0, marginBottom: '0.5rem' }}>🏥 Chronic Conditions & Pathology</h4>
            <ul style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
              <li><strong>Cardiometabolic Vectors:</strong> Diabetes, Hypertension, Obesity, CAD, CHF, CKD, High Cholesterol.</li>
              <li><strong>Respiratory & Hepatic:</strong> Asthma, COPD, Hepatitis, Cirrhosis, ESLD.</li>
              <li><strong>Psychiatric & Cognitive:</strong> Schizophrenia, Bipolar, Major Depression, Anxiety, Alzheimer's/Dementia (Acting as severe multipliers destroying preventative Medical Compliance capacities).</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: '#34d399', marginTop: 0, marginBottom: '0.5rem' }}>🌍 Social Determinants of Health (SDoH)</h4>
            <ul style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
              <li><strong>Geographic/Economic:</strong> Food Desert status, Wealth Percentile mapping, Raw Access to Care scaling points.</li>
              <li><strong>Behavioral Vectors:</strong> Formal Medical Compliance gradients (High/Med/Low), Smoking status, Diet Quality arrays.</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: '#c084fc', marginTop: 0, marginBottom: '0.5rem' }}>💊 Modern Pharmacotherapy Vectors</h4>
            <ul style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
              <li><strong>Metabolic Blockade:</strong> GLP-1 Agonists (Semaglutide) stripping BMI and A1c natively; SGLT2 Inhibitors aggressively shielding eGFR.</li>
              <li><strong>Advanced Polypharmacy:</strong> Mimicking strict psychiatric tradeoffs (e.g. Lithium inducing inevitable explicit nephrotoxic decay; Olanzapine destroying metabolic profiles).</li>
            </ul>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ color: '#fcd34d', marginTop: 0, marginBottom: '0.5rem' }}>📈 Data Sources & Deep Mathematics</h4>
            <ul style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, paddingLeft: '1.2rem', lineHeight: 1.6 }}>
              <li><strong>AHA/CDC Actuarial Baselines:</strong> Exact statistical formulas mapping default literature Relative Risks for mortality events.</li>
              <li><strong>Poisson Incidence Normalization:</strong> Natively normalizes aggregated varying historical document arrays mathematically against exposure lifespans to weave definitive Medical Target weights.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
