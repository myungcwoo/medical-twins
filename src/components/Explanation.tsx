import type { FC } from 'react';

export const Explanation: FC = () => {
  return (
    <div className="explanation-container glass-panel" style={{ padding: '2rem', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', color: '#60a5fa' }}>
        How The ABM Simulation Works
      </h2>
      <p style={{ fontSize: '1.1rem', color: '#e2e8f0', marginBottom: '2rem' }}>
        This Medical Digital Twin simulation is an advanced <strong>Agent-Based Model (ABM)</strong> that replaces generic probability with continuous mathematical physics rooted directly in verified epidemiological guidelines (AHA, ADA, CDC, JAMA).
      </p>

      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ color: '#fcd34d' }}>1. Deep Clinical Trajectories & Hazard Ratios</h3>
        <p>Every digital patient harbors a massive interlocking matrix of clinical state data (Family History, Smoker Status, Surgical History) mapping directly to continuous <strong>Vitals (BP, HR, BMI)</strong> and <strong>Labs (A1C, LDL, eGFR, CV Health)</strong>.</p>
        <p>When a patient experiences an environmental or clinical stressor, the hit isn't arbitrary. The simulation actively multipliers baseline illness using rigorous mathematically-applied <strong>Hazard Ratios (HR)</strong> (e.g., JAMA studies mapping a strict 2.57x HR penalty to Food Desert mortality risks).</p>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ color: '#ef4444' }}>2. The "Vicious Cycle" of End-Organ Damage</h3>
        <p>Human biology is not isolated. The engine meticulously tracks the devastating real-world bidirectional interplay between metabolic loads and kidney failure based on American Diabetes Association guidelines:</p>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}><strong>Metabolic Nephropathy:</strong> Uncontrolled glucose (A1C &gt; 7.0) actively deteriorates nephrons every tick, crashing the patient's Estimated Glomerular Filtration Rate (eGFR).</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Hypertensive Reflex:</strong> When a kidney begins failing (eGFR &lt; 60), the body retains fluid. This mechanism mechanically forces Systolic Blood Pressure rapidly higher, destroying Cardiovascular Health and further punishing the eGFR in an endless recursive loop.</li>
          <li><strong>Preventative Reversibility:</strong> Governed by the AASK Trials, if a patient adopts exercise or extreme medical compliance to drive SBP &lt; 130 and A1C &lt; 7.0, the engine physically begins regenerating eGFR and triggering LVH (cardiovascular) regression.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ color: '#10b981' }}>3. Probabilistic Triage & Medical Evidence Engine</h3>
        <p>Instead of hardcoding unrealistic absolute triggers (e.g., `If BP &gt; 180, Patient Dies`), the simulation abstracts all clinical boundaries to a custom Probabilistic Evidence Engine.</p>
        <p><strong>Example: Hypertensive Emergency Triage</strong></p>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>When a patient hits 180 SBP, they enter Emergency Dept triage. The engine mathematically scans for End Organ active damage (crashing eGFR/CV Health).</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Urgency:</strong> If organs are stable, the patient is classified as an Urgency, stabilized cleanly with oral medication, and discharged with low penalty.</li>
          <li><strong>Emergency & Off-Label Salvage:</strong> If organs are actively failing, it is an Emergency (historically 100% ICU admit). However, the Evidence Engine respects clinical leeway: it rolls a 30% probabilistic chance that physicians use intensive <strong>FDA Off-Label polypharmacy</strong> to violently safely avert the ICU—or suffer extremely adverse drug reactions trying.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ color: '#a78bfa' }}>4. 10-Year Clinical Predictive Forecasts</h3>
        <p>The system actively peers into the future! We have incorporated world-class prognostic equations to evaluate the likelihood of massive catastrophic events occurring to each agent over the next 10 years:</p>
        <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}><strong>ASCVD (Stroke/MI):</strong> Utilizing the official <strong>AHA PREVENT Equations (2023)</strong> accounting for Age, SBP, eGFR, HDL, Smoking Status, and Diabetes.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Heart Failure (CHF):</strong> Utilizing the <strong>PCP-HF Tool</strong> parsing BMI, glycemic load, SBP strain, and CV Health.</li>
          <li><strong>Real-time Reversals:</strong> Not only does the dashboard output the exact % danger, it dynamically writes textual suggestions mapping exactly what immediate actions (like smoking cessation or intense bp lowering) will mathematically reverse the equations.</li>
        </ul>
      </section>
      
      <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
        <strong style={{ color: '#93c5fd' }}>Visualizing the Math:</strong><br/>
        In the "Detailed Timelines" tab, keep an eye on the <strong>Citation Badges</strong> on each event card (e.g., "[📖 Evidence Basis: JAMA]"). These badges explicitly state the Hazard Ratios or medical literature the underlying algorithm utilized to generate the failure or recovery. 
      </div>
    </div>
  );
};
