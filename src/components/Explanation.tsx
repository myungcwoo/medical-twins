import type { FC } from 'react';

export const Explanation: FC = () => {
  return (
    <div className="explanation-container glass-panel" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out', overflowY: 'auto', maxHeight: '100%' }}>
      <h2 style={{ color: '#a78bfa', marginBottom: '1.5rem', borderBottom: '1px solid rgba(167, 139, 250, 0.3)', paddingBottom: '0.5rem' }}>Core Simulation Architecture</h2>
      <p style={{ color: '#e2e8f0', lineHeight: 1.6, fontSize: '1.05rem', marginBottom: '2rem' }}>
        As a core pillar of the Clinical AI Studio, the Digital Patient Simulation architecture represents a highly advanced <strong>Generative Agent-Based Model (ABM)</strong> completely driven by real-time Large Language Models (LLMs) and rigorous CDC/AHA empirical hazard algorithms. 
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
          <h3 style={{ color: '#10b981', margin: '0 0 0.8rem 0' }}>1. The Multi-Agent Generative Network</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            The primary simulation houses autonomous digital patients structurally organized into a unified information network. <strong>Researchers</strong> actively ping integrated external Language Models (OpenAI, Gemini, Claude). However, these LLMs are completely fenced by highly-restrictive system prompts forcing them to generate novel clinical interventions strictly derived from reputable authorities (<strong>CDC, WHO, JAMA, NEJM, Nature, AHA, NKF, ADA</strong>). The prompts explicitly force the generation of "changing literature," including inventing sudden drug retractions and adverse-event warnings that actively crash physical agent trajectories over time.
          </p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
          <h3 style={{ color: '#f59e0b', margin: '0 0 0.8rem 0' }}>2. Actuarial Epidemiological Pathology Engine</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Agent mortality is tightly constrained. Exactly every 52 weeks (1 Simulation Year), the underlying <code>PathologyEngine</code> runs an exhaustive baseline statistical roll on every single living Agent heavily mapped against their biometric arrays. Referencing strictly mapped CDC/AHA incidence rates, agents structurally acquire highly lethal secondary complications. Rapid Obesity forces <strong>Hypertension</strong>; sustained Hypertension guarantees inevitable <strong>Congestive Heart Failure</strong>; and uncontrolled Diabetic progression permanently drags the agent into <strong>Chronic Renal Failure</strong>. 
          </p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #14b8a6' }}>
          <h3 style={{ color: '#14b8a6', margin: '0 0 0.8rem 0' }}>3. Autonomous Physician CDSS</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Agents do not blindly follow static primary guidelines. They are rigidly governed by an advanced <strong>Clinical Decision Support System (CDSS)</strong> that recursively cross-references real-world comorbidities mimicking experienced clinician logic. For instance, uncomplicated Hypertension receives standard Amlodipine; but if an Agent suffers from Diabetes, the CDSS exclusively executes renoprotective ACE-Inhibitors (Lisinopril). 
          </p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
          <h3 style={{ color: '#3b82f6', margin: '0 0 0.8rem 0' }}>4. Isolated Synthetic Custom Trials</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            The overarching global 100-Agent simulation simply serves as a massive experimental proving ground. By navigating to the <strong>Add Digital Twin</strong> ingestion tool, you can deploy a customized real-world patient narrative securely detached from the population bounds. The app explicitly filters the absolute highest-yielding protocols analytically discovered by the main network, allowing you to explicitly construct a fully isolated 1-vs-1 (Control Vs Optimized) proxy testing dashboard visually comparing exact trajectory deltas strictly based on your selected LLM interventions.
          </p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
          <h3 style={{ color: '#ef4444', margin: '0 0 0.8rem 0' }}>5. Post-Mortem Data Subsystems</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            When navigating through the headers you retain complete control over both the global scale clock and the independent localized Custom Sandbox clock independently. Terminating the global clock drops the entire UI explicitly into the <strong>Post-Mortem Analytics Report</strong> evaluating exactly what dynamic LLM pipelines toxified populations versus which paradigms empirically accelerated survival. 
          </p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #8b5cf6' }}>
          <h3 style={{ color: '#8b5cf6', margin: '0 0 0.8rem 0' }}>6. Client-Side RWD ETL & Empirical Logic</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Beyond rigid CDC/AHA literature, you can actively drag pure unstructured <strong>Medical Claims</strong> and <strong>Laboratory Datasets</strong> directly into the <strong>RWD Training</strong> interface. The Training Engine acts as a massive native ETL pipeline—weaving scattered records by Patient ID, isolating strict ICD-10 chronologies, enforcing "Active Management" confirmation protocols across discrete dates, and dynamically generating Annualized Incidence Rates (AIR). These exact empirical weights permanently overwrite the simulation's baseline physics models!
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
