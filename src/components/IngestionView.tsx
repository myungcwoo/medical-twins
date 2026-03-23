import { useState } from 'react';
import type { FC } from 'react';
import type { AgentState } from '../simulation/Agent';

interface Props {
  onAddAgent: (agent: Omit<AgentState, 'history' | 'isDead'>) => void;
}

const TEMPLATE_HEALTHY = JSON.stringify({
  id: `custom_${Math.floor(Math.random() * 10000)}`,
  name: "New Healthy Patient",
  age: 35,
  sex: "Female",
  baseHealth: 95,
  stressLevel: 25,
  dietQuality: 85,
  wealth: 80,
  accessToCare: 90,
  foodDesert: false,
  smoker: false,
  chronicConditions: [],
  familyHistory: [],
  surgicalHistory: [],
  medications: [],
  exerciseRoutine: "Moderate",
  medicalCompliance: "High",
  vitals: {
    bpSystolic: 115,
    bpDiastolic: 75,
    heartRate: 65,
    bmi: 22.0
  },
  labs: {
    a1c: 5.0,
    ldlCholesterol: 90,
    egfr: 115,
    cvHealth: 95
  }
}, null, 2);

const TEMPLATE_CRITICAL = JSON.stringify({
  id: `custom_${Math.floor(Math.random() * 10000)}`,
  name: "New High-Risk Patient",
  age: 62,
  sex: "Male",
  baseHealth: 60,
  stressLevel: 85,
  dietQuality: 35,
  wealth: 30,
  accessToCare: 40,
  foodDesert: true,
  smoker: true,
  chronicConditions: ["Diabetes", "Hypertension"],
  familyHistory: ["Heart Disease"],
  surgicalHistory: ["Appendectomy"],
  medications: ["Metformin", "Amlodipine"],
  exerciseRoutine: "None",
  medicalCompliance: "Low",
  vitals: {
    bpSystolic: 165,
    bpDiastolic: 100,
    heartRate: 90,
    bmi: 34.5
  },
  labs: {
    a1c: 8.8,
    ldlCholesterol: 175,
    egfr: 52,
    cvHealth: 48
  }
}, null, 2);

export const IngestionView: FC<Props> = ({ onAddAgent }) => {
  const [jsonText, setJsonText] = useState(TEMPLATE_HEALTHY);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInject = () => {
    try {
      setErrorMsg('');
      setSuccess(false);
      const parsed = JSON.parse(jsonText);

      // Basic validation checks
      if (!parsed.name || typeof parsed.age !== 'number') throw new Error("Missing or invalid base fields (name, age).");
      if (!parsed.vitals || typeof parsed.vitals.bpSystolic !== 'number') throw new Error("Missing Vitals block (e.g. bpSystolic).");
      if (!parsed.labs || typeof parsed.labs.egfr !== 'number') throw new Error("Missing Labs block (e.g. egfr).");

      // Inject the twin
      parsed.id = `custom_${Math.floor(Math.random() * 100000)}`;
      onAddAgent(parsed);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON strictly missing required Schema keys.');
    }
  };

  return (
    <div className="ingestion-container glass-panel" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#a78bfa', marginBottom: '0.5rem' }}>Upload Digital Twin</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Inject custom patient data (JSON or FHIR-mapped objects) directly into the live ABM engine. The new Digital Twin will immediately undergo continuous predictive progression alongside the initial roster.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button className="tab-btn" onClick={() => setJsonText(TEMPLATE_HEALTHY)} style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid currentColor' }}>
          📄 Load Healthy Protocol Template
        </button>
        <button className="tab-btn" onClick={() => setJsonText(TEMPLATE_CRITICAL)} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid currentColor' }}>
          📄 Load Critical Path Template
        </button>
      </div>

      <textarea 
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        style={{
          width: '100%',
          height: '450px',
          background: 'rgba(0,0,0,0.4)',
          color: '#e2e8f0',
          fontFamily: 'monospace',
          fontSize: '0.95rem',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)',
          resize: 'vertical'
        }}
        spellCheck="false"
      />

      {errorMsg && (
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
          <strong style={{ display: 'block', marginBottom: '0.3rem' }}>JSON Parse Error:</strong>
          {errorMsg}
        </div>
      )}

      {success && (
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
          <strong>✅ Success:</strong> Digital Twin securely injected. They are now actively running inside the overarching ABM logic loop. Return to the Timelines dashboard to view their predictive progression in real-time.
        </div>
      )}

      <button 
        onClick={handleInject}
        style={{
          marginTop: '1.5rem',
          width: '100%',
          padding: '1.2rem',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
        }}
      >
        🧬 Inject Digital Twin into Simulation
      </button>
    </div>
  );
};
