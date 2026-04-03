import { useState } from 'react';
import type { FC } from 'react';
import type { AgentState } from '../simulation/Agent';
import { KnowledgeBase } from '../simulation/KnowledgeNetwork';

interface Props {
  onStartCustomTrial: (agent: Omit<AgentState, 'history' | 'isDead' | 'biometricHistory'>, protocols: any[]) => void;
}

const TEMPLATE_HEALTHY = JSON.stringify({
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

const TEMPLATE_FHIR_EPIC = JSON.stringify({
  "resourceType": "Bundle",
  "type": "searchset",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "name": [{ "given": ["Jane", "FHIR"], "family": "Doe" }],
        "gender": "female",
        "birthDate": "1975-06-12"
      }
    },
    {
      "resource": {
        "resourceType": "Observation",
        "status": "final",
        "code": { "coding": [{ "system": "http://loinc.org", "code": "4548-4", "display": "Hemoglobin A1c" }] },
        "valueQuantity": { "value": 7.2, "unit": "%" }
      }
    },
    {
      "resource": {
        "resourceType": "Observation",
        "status": "final",
        "code": { "coding": [{ "system": "http://loinc.org", "code": "8480-6", "display": "Systolic blood pressure" }] },
        "valueQuantity": { "value": 150, "unit": "mmHg" }
      }
    },
    {
      "resource": {
        "resourceType": "Observation",
        "code": { "coding": [{ "system": "http://loinc.org", "code": "75862-3", "display": "NT-proBNP" }] },
        "valueQuantity": { "value": 450, "unit": "pg/mL" }
      }
    },
    {
      "resource": {
        "resourceType": "Observation",
        "code": { "coding": [{ "system": "http://loinc.org", "code": "39156-5", "display": "BMI" }] },
        "valueQuantity": { "value": 31.5, "unit": "kg/m2" }
      }
    }
  ]
}, null, 2);

export const IngestionView: FC<Props> = ({ onStartCustomTrial }) => {
  const [jsonText, setJsonText] = useState(TEMPLATE_HEALTHY);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [step, setStep] = useState<1 | 2>(1);
  const [parsedAgent, setParsedAgent] = useState<any>(null);
  const [availableProtocols, setAvailableProtocols] = useState<any[]>([]);
  const [selectedProtocols, setSelectedProtocols] = useState<Set<string>>(new Set());

  const handleProcessJSON = () => {
    try {
      setErrorMsg('');
      const parsed = JSON.parse(jsonText);
      let simulatedAgent: any = parsed;

      // Detect FHIR R4 Bundle
      if (parsed.resourceType === "Bundle" && parsed.entry) {
         console.log("FHIR Interoperability: Parsing incoming EHR Bundle.");
         const patientRes = parsed.entry.find((e: any) => e.resource.resourceType === "Patient")?.resource;
         if (!patientRes) throw new Error("FHIR Bundle missing Core Patient Resource.");
         
         const age = patientRes.birthDate ? (new Date().getFullYear() - parseInt(patientRes.birthDate.substring(0,4))) : 50;
         const sex = patientRes.gender === "female" ? "Female" : "Male";
         
         let a1c = 5.5, sysBp = 120, bmi = 24.0, ntProBNP = 50;
         
         parsed.entry.forEach((e: any) => {
            const res = e.resource;
            if (res.resourceType === "Observation" && res.code?.coding) {
               const loinc = res.code.coding[0].code;
               if (loinc === "4548-4") a1c = res.valueQuantity?.value;
               if (loinc === "8480-6") sysBp = res.valueQuantity?.value;
               if (loinc === "39156-5") bmi = res.valueQuantity?.value;
               if (loinc === "75862-3") ntProBNP = res.valueQuantity?.value;
            }
         });

         simulatedAgent = {
            name: patientRes.name?.[0]?.given?.[0] + " " + patientRes.name?.[0]?.family,
            age, sex,
            baseHealth: 70, stressLevel: 50, dietQuality: 50, wealth: 50, accessToCare: 50,
            foodDesert: false, smoker: false, chronicConditions: [], familyHistory: [], surgicalHistory: [], medications: [],
            exerciseRoutine: "None", medicalCompliance: "Moderate",
            vitals: { bpSystolic: sysBp, bpDiastolic: sysBp * 0.6, heartRate: 75, bmi },
            labs: { a1c, ldlCholesterol: 100, egfr: 90, cvHealth: 80, ntProBNP, hsCRP: 1.0, uacr: 15 },
            imaging: { lvef: 60, cacScore: 0 }
         };
      } else {
          // Standard custom template checks
          if (!parsed.name || typeof parsed.age !== 'number') throw new Error("Missing or invalid base fields (name, age).");
          if (!parsed.vitals || typeof parsed.vitals.bpSystolic !== 'number') throw new Error("Missing Vitals block (e.g. bpSystolic).");
          if (!parsed.labs || typeof parsed.labs.egfr !== 'number') throw new Error("Missing Labs block (e.g. egfr).");
      }

      simulatedAgent.id = `custom_${Math.floor(Math.random() * 100000)}`;
      setParsedAgent(simulatedAgent);
      
      // Fetch top network protocols out of the main sandbox
      const topFound = KnowledgeBase.getTopValidatedProtocols(10);
      setAvailableProtocols(topFound);
      setStep(2);
      
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid JSON strictly missing required Schema keys.');
    }
  };

  const toggleProtocol = (id: string) => {
    const newSet = new Set(selectedProtocols);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedProtocols(newSet);
  };

  const handleLaunch = () => {
    if (parsedAgent) {
      const chosen = availableProtocols.filter(p => selectedProtocols.has(p.id));
      onStartCustomTrial(parsedAgent, chosen);
    }
  };

  if (step === 2) {
    return (
      <div className="ingestion-container glass-panel" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ color: '#a78bfa', marginBottom: '0.5rem' }}>Step 2: Curate AI Interventions</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          The active global simulation has empirically discovered the following highly effective medical interventions organically. 
          Select exactly which clinical protocols you wish to formally apply to your Custom Twin's Optimized clone. 
          The Control clone will remain fundamentally untreated.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {availableProtocols.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px dashed rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}>
              No statically successful protocols discovered by the main simulation yet. Return to the dashboard and let the ABM run longer to generate empirical findings.
            </div>
          ) : (
            availableProtocols.map((protocol, i) => (
              <div 
                key={protocol.id + i} 
                onClick={() => toggleProtocol(protocol.id)}
                style={{
                  padding: '1.2rem',
                  borderRadius: '8px',
                  background: selectedProtocols.has(protocol.id) ? 'rgba(139, 92, 246, 0.15)' : 'rgba(0,0,0,0.3)',
                  border: selectedProtocols.has(protocol.id) ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', gap: '1rem', alignItems: 'center'
                }}
              >
                <div style={{ width: '24px', height: '24px', borderRadius: '4px', border: '2px solid #8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedProtocols.has(protocol.id) ? '#8b5cf6' : 'transparent' }}>
                  {selectedProtocols.has(protocol.id) && <span style={{ color: 'white', fontWeight: 'bold' }}>✓</span>}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: '#e2e8f0', margin: '0 0 0.4rem 0' }}>{protocol.title} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>via {protocol.source}</span></h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    <strong style={{ color: '#10b981' }}>Yield:</strong> +{protocol.impact.healthDelta.toFixed(1)} Health | 
                    &nbsp;<strong style={{ color: '#3b82f6' }}>Adoption Success:</strong> {((protocol.successCount / protocol.adoptions) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setStep(1)} className="tab-btn" style={{ flex: 1, padding: '1rem' }}>Back to Parser</button>
          <button 
            disabled={availableProtocols.length === 0}
            onClick={handleLaunch}
            style={{
              flex: 2, padding: '1.2rem', background: availableProtocols.length === 0 ? '#374151' : 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)',
              color: availableProtocols.length === 0 ? '#9ca3af' : 'white', fontWeight: 'bold', fontSize: '1.1rem', border: 'none', borderRadius: '8px', 
              cursor: availableProtocols.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            🚀 Launch Isolated A/B Trial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ingestion-container glass-panel" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ color: '#a78bfa', marginBottom: '0.5rem' }}>Step 1: Upload Digital Twin</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Inject custom patient data (JSON or FHIR-mapped objects) to begin the generation of a specialized Synthetic A/B Trial sequence tightly decoupled from the main population.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button className="tab-btn" onClick={() => setJsonText(TEMPLATE_HEALTHY)} style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid currentColor', fontSize: '0.9rem' }}>
          📄 Load Healthy Protocol Template
        </button>
        <button className="tab-btn" onClick={() => setJsonText(TEMPLATE_CRITICAL)} style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid currentColor', fontSize: '0.9rem' }}>
          📄 Load Critical Path Template
        </button>
        <button className="tab-btn" onClick={() => setJsonText(TEMPLATE_FHIR_EPIC)} style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid currentColor', fontSize: '0.9rem' }}>
          🏥 Load Demo FHIR R4 Bundle (EHR)
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

      <button 
        onClick={handleProcessJSON}
        style={{
          marginTop: '1.5rem',
          width: '100%',
          padding: '1.2rem',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
        }}
      >
        Verify Patient & Proceed to Interventions ➔
      </button>
    </div>
  );
};
