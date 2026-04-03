import { useState } from 'react';
import type { FC } from 'react';
import type { AgentState } from '../simulation/Agent';
import { KnowledgeBase } from '../simulation/KnowledgeNetwork';

interface Props {
  onStartCustomTrial: (agent: Omit<AgentState, 'history' | 'isDead' | 'biometricHistory'>, protocols: any[]) => void;
}

const COMMON_CONDITIONS = [
  'Diabetes', 'Hypertension', 'Hyperlipidemia', 'COPD', 'Asthma', 
  'CHF', 'CKD', 'Depression', 'Anxiety', 'Atrial Fibrillation'
];

export const ConsumerWizard: FC<Props> = ({ onStartCustomTrial }) => {
  const [step, setStep] = useState<1 | 2>(1);
  
  // Demographics / Lifestyle
  const [name, setName] = useState('My Digital Clone');
  const [age, setAge] = useState<number>(35);
  const [sex, setSex] = useState<'Male' | 'Female'>('Female');
  const [stressLevel, setStressLevel] = useState<number>(30);
  const [dietQuality, setDietQuality] = useState<number>(60);
  const [exerciseRoutine, setExerciseRoutine] = useState<'None' | 'Moderate' | 'High'>('Moderate');
  const [smoker, setSmoker] = useState(false);
  
  // SDOH
  const [wealth, setWealth] = useState<number>(65);
  const [foodDesert, setFoodDesert] = useState<boolean>(false);
  const [medicalCompliance, setMedicalCompliance] = useState<'Low' | 'Moderate' | 'High'>('High');
  
  // Basic Medicals
  const [bpSystolic, setBpSystolic] = useState<number>(120);
  const [bpDiastolic, setBpDiastolic] = useState<number>(80);
  const [bmi, setBmi] = useState<number>(24.0);
  
  // Advanced Imaging
  const [cacScore, setCacScore] = useState<number>(0);
  const [lvef, setLvef] = useState<number>(60);
  
  const [selectedConditions, setSelectedConditions] = useState<Set<string>>(new Set());

  // Intervention Setup
  const [availableProtocols, setAvailableProtocols] = useState<any[]>([]);
  const [selectedProtocols, setSelectedProtocols] = useState<Set<string>>(new Set());

  const toggleCondition = (cond: string) => {
    const newSet = new Set(selectedConditions);
    if (newSet.has(cond)) newSet.delete(cond);
    else newSet.add(cond);
    setSelectedConditions(newSet);
  };

  const handleNextStep = () => {
      // Pull wide array to filter aggressively
      const topFound = KnowledgeBase.getTopValidatedProtocols(30);
      
      const tailoredProtocols = topFound.filter(protocol => {
         // Pass Lifestyle natively
         if (protocol.type === 'Lifestyle') return true;
         // If clinical target exists, verify patient has at least one of the chronicity signatures
         if (protocol.targetConditions && protocol.targetConditions.length > 0) {
             const hasRelevantCondition = protocol.targetConditions.some(cond => selectedConditions.has(cond));
             return hasRelevantCondition;
         }
         return true; // Un-restricted clinicals
      });

      // Enforce lifestyle backups if patient is 100% healthy
      if (tailoredProtocols.length < 3) {
          KnowledgeBase.LIFESTYLE_IDEAS.forEach(life => {
              if (!tailoredProtocols.find(f => f.id === life.id)) tailoredProtocols.push(life);
          });
      }

      setAvailableProtocols(tailoredProtocols.slice(0, 10));
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleProtocol = (id: string) => {
    const newSet = new Set(selectedProtocols);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedProtocols(newSet);
  };

  const handleLaunch = () => {
      // Dynamically calculate some fun starting biological metrics dependent on lifestyle
      const baseHlth = Math.min(100, Math.max(10, 85 - (age * 0.1) - (stressLevel * 0.15) + (dietQuality * 0.2) - (smoker ? 15 : 0)));
      
      const parsedAgent: Omit<AgentState, 'history' | 'isDead' | 'biometricHistory'> = {
          id: `clone_${Math.floor(Math.random() * 100000)}`,
          name: name,
          age: age,
          sex: sex,
          role: 'Patient',
          baseHealth: baseHlth,
          stressLevel: stressLevel,
          dietQuality: dietQuality,
          wealth: wealth,
          accessToCare: wealth > 50 ? 80 : 30, // Correlate access with wealth natively here
          foodDesert: foodDesert,
          smoker: smoker,
          chronicConditions: Array.from(selectedConditions),
          familyHistory: [],
          surgicalHistory: [],
          medications: [],
          exerciseRoutine: exerciseRoutine,
          medicalCompliance: medicalCompliance,
          vitals: {
            bpSystolic: bpSystolic,
            bpDiastolic: bpDiastolic,
            heartRate: 70 + (stressLevel > 60 ? 15 : 0),
            bmi: bmi
          },
          labs: {
            // Generating plausible proxy labs so the consumer doesn't need a medical degree to input data
            a1c: bmi > 30 ? 6.8 : (dietQuality < 30 ? 6.2 : 5.2),
            ldlCholesterol: dietQuality < 50 ? 140 : 100,
            egfr: 100 - (age * 0.1), 
            cvHealth: Math.max(10, 100 - (age * 0.3) - (smoker ? 20 : 0) - (bpSystolic > 140 ? 15 : 0)),
            ntProBNP: lvef < 50 ? 800 : 40,
            hsCRP: smoker ? 4.5 : 1.2,
            uacr: 15
          },
          imaging: {
            lvef: lvef,
            cacScore: cacScore
          },
          memory: []
      };

      const chosen = availableProtocols.filter(p => selectedProtocols.has(p.id));
      onStartCustomTrial(parsedAgent, chosen);
  };

  if (step === 2) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
        <h2 style={{ color: '#f472b6', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ fontSize: '2rem' }}>🧪</span> Step 2: Pick Your Interventions!
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Your digital clone is almost ready. Currently, our AI Agents are actively running through millions of simulations trying to find optimal health protocols. 
          Pick the ones you're curious about! We'll run a completely isolated simulation: one version of you living out life identically, and another equipped with these new regimens. Let's see who wins.
        </p>

        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {availableProtocols.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', background: 'rgba(236, 72, 153, 0.1)', color: '#f9a8d4', border: '1px dashed rgba(236, 72, 153, 0.3)', borderRadius: '12px' }}>
               Hold up! The global simulation hasn't actually found any statically successful protocols yet. Flip back to the Dashboard and let the population run for a few more simulated years so the agents can publish some papers!
            </div>
          ) : (
            availableProtocols.map((protocol, i) => (
              <div 
                key={protocol.id + i} 
                onClick={() => toggleProtocol(protocol.id)}
                style={{
                  padding: '1.2rem',
                  borderRadius: '12px',
                  background: selectedProtocols.has(protocol.id) ? 'rgba(236, 72, 153, 0.15)' : 'rgba(0,0,0,0.3)',
                  border: selectedProtocols.has(protocol.id) ? '2px solid #ec4899' : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', gap: '1.2rem', alignItems: 'center'
                }}
              >
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid #ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedProtocols.has(protocol.id) ? '#ec4899' : 'transparent', transition: 'all 0.2s' }}>
                  {selectedProtocols.has(protocol.id) && <span style={{ color: 'white', fontWeight: 'bold' }}>✓</span>}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: '#f8fafc', margin: '0 0 0.3rem 0', fontSize: '1.1rem' }}>{protocol.title}</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                    <strong style={{ color: '#f472b6' }}>Impact:</strong> +{protocol.impact.healthDelta.toFixed(1)} Health | 
                    &nbsp;<strong style={{ color: '#a78bfa' }}>Adoption:</strong> {protocol.adoptions > 0 ? ((protocol.successCount / protocol.adoptions) * 100).toFixed(0) : '0'}%
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => setStep(1)} style={{ padding: '1rem', background: 'transparent', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
            ← Back
          </button>
          <button 
            disabled={availableProtocols.length === 0}
            onClick={handleLaunch}
            style={{
              flex: 1, padding: '1.2rem', background: availableProtocols.length === 0 ? '#374151' : 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              color: availableProtocols.length === 0 ? '#9ca3af' : 'white', fontWeight: 'bold', fontSize: '1.2rem', border: 'none', borderRadius: '8px', 
              cursor: availableProtocols.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: availableProtocols.length > 0 ? '0 4px 15px rgba(236, 72, 153, 0.4)' : 'none',
              transition: 'transform 0.1s'
            }}
            onMouseDown={e => availableProtocols.length > 0 && (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            🔮 Look Into My Future
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '1.5rem 1rem', maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ color: '#f472b6', margin: '0 0 0.5rem 0', fontSize: '2.4rem', fontFamily: 'system-ui, sans-serif' }}>
          🔮 Simulate Me!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>
          Create your personalized digital clone. We'll run life forward inside our mathematical engine to see how your health trajectory shifts over decades!
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        
        {/* LIFESTYLE BLOCK */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: '#f8fafc', margin: '0 0 1.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Basic Info</h3>
            
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Name your Clone:</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Age: <strong>{age}</strong></label>
                    <input type="range" min="18" max="90" value={age} onChange={e => setAge(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#f472b6' }} />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Sex:</label>
                    <select value={sex} onChange={e => setSex(e.target.value as any)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Daily Stress Level: <strong>{stressLevel}/100</strong></label>
                <input type="range" min="0" max="100" value={stressLevel} onChange={e => setStressLevel(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#f472b6' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Diet Quality (100 = Perfect!): <strong>{dietQuality}</strong></label>
                <input type="range" min="0" max="100" value={dietQuality} onChange={e => setDietQuality(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#10b981' }} />
            </div>
            
            <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Exercise Routine:</label>
                <select value={exerciseRoutine} onChange={e => setExerciseRoutine(e.target.value as any)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                    <option value="None">None (Couch Potato)</option>
                    <option value="Moderate">Moderate (Active few times a week)</option>
                    <option value="High">High (Serious Athlete)</option>
                </select>
            </div>
        </div>

        {/* SOCIOECONOMIC BLOCK (SDOH) */}
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
             <h3 style={{ color: '#3b82f6', margin: '0 0 1.2rem 0', borderBottom: '1px solid rgba(59, 130, 246, 0.2)', paddingBottom: '0.5rem' }}>Real-World Determinants (SDOH)</h3>
             <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.4 }}>
                 Interventions are only as effective as your ability to adopt them. Lack of wealth destroys adherence due to high copays, and "food deserts" prevent nutritional protocol success.
             </p>

             <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Wealth & Access: <strong>{wealth}/100</strong></label>
                <input type="range" min="0" max="100" value={wealth} onChange={e => setWealth(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#3b82f6' }} />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>Values &lt; 40 incur a devastating 50% non-adherence decay mathematically.</div>
             </div>

             <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Personal Medical Compliance:</label>
                <select value={medicalCompliance} onChange={e => setMedicalCompliance(e.target.value as any)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)', background: 'rgba(0,0,0,0.5)', color: 'white' }}>
                    <option value="High">High (Follows Doctors Orders Strictly)</option>
                    <option value="Moderate">Moderate (Sometimes forgets pills)</option>
                    <option value="Low">Low (Refuses protocols / Deep skepticism)</option>
                </select>
             </div>

             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0, 0, 0, 0.3)', padding: '1rem', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <input type="checkbox" checked={foodDesert} onChange={e => setFoodDesert(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }} />
                <span style={{ color: '#cbd5e1', fontWeight: 'bold' }}>I live in a Food Desert (No fresh grocery)</span>
             </label>
        </div>

        {/* ADVANCED DIAGNOSTICS & IMAGING BLOCK */}
        <div style={{ background: 'rgba(236, 72, 153, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(236, 72, 153, 0.2)' }}>
             <h3 style={{ color: '#ec4899', margin: '0 0 1.2rem 0', borderBottom: '1px solid rgba(236, 72, 153, 0.2)', paddingBottom: '0.5rem' }}>Advanced Diagnostic Imaging Panels</h3>
             <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.4 }}>
                 Specify structural organ data if known. These are authoritative PyTorch modifiers that rapidly accelerate risk factors.
             </p>

             <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    <span>Ejection Fraction (LVEF): <strong>{lvef}%</strong></span>
                    <span style={{ fontSize: '0.75rem', color: lvef < 40 ? '#ef4444' : lvef < 50 ? '#f59e0b' : '#10b981' }}>
                        {lvef < 40 ? 'HFrEF Failure' : lvef < 50 ? 'Borderline' : 'Normal'}
                    </span>
                </label>
                <input type="range" min="15" max="75" value={lvef} onChange={e => setLvef(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#ec4899' }} />
             </div>

             <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    <span>Coronary Artery Calcium (CAC): <strong>{cacScore}</strong></span>
                    <span style={{ fontSize: '0.75rem', color: cacScore === 0 ? '#10b981' : cacScore > 400 ? '#ef4444' : cacScore > 100 ? '#f59e0b' : '#94a3b8' }}>
                        {cacScore === 0 ? 'Zero Plaque' : cacScore > 400 ? 'Severe ASCVD' : 'Mild/Moderate'}
                    </span>
                </label>
                <input type="range" step="25" min="0" max="1000" value={cacScore} onChange={e => setCacScore(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#a855f7' }} />
             </div>
        </div>

        {/* VITALS BLOCK */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <h3 style={{ color: '#f8fafc', margin: '0 0 1.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Vitals & Health Snapshot</h3>
             <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.4 }}>
                 Don't worry if you don't know your exact numbers. Guess roughly! We extrapolate the complex lab work (A1C, eGFR) mathematically under the hood based on your inputs.
             </p>

             <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Systolic BP (Top): <strong>{bpSystolic}</strong></label>
                    <input type="range" min="90" max="200" value={bpSystolic} onChange={e => setBpSystolic(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#3b82f6' }} />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Diastolic (Bottom): <strong>{bpDiastolic}</strong></label>
                    <input type="range" min="50" max="130" value={bpDiastolic} onChange={e => setBpDiastolic(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#3b82f6' }} />
                </div>
             </div>

             <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Body Mass Index (BMI): <strong>{bmi.toFixed(1)}</strong></label>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginBottom: '0.2rem' }}>
                    <span>Underweight (18)</span>
                    <span>Average (24)</span>
                    <span>Obese (30+)</span>
                </div>
                <input type="range" min="15" max="45" step="0.5" value={bmi} onChange={e => setBmi(parseFloat(e.target.value))} style={{ width: '100%', accentColor: '#a78bfa' }} />
             </div>

             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <input type="checkbox" checked={smoker} onChange={e => setSmoker(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: '#ef4444' }} />
                <span style={{ color: '#fca5a5', fontWeight: 'bold' }}>I actively smoke or vape</span>
             </label>

        </div>
        
        {/* CONDITIONS BLOCK */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', gridColumn: '1 / -1' }}>
             <h3 style={{ color: '#f8fafc', margin: '0 0 1.2rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Existing Chronic Conditions</h3>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.8rem' }}>
                {COMMON_CONDITIONS.map(cond => (
                    <label key={cond} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#cbd5e1', fontSize: '0.95rem', cursor: 'pointer', background: selectedConditions.has(cond) ? 'rgba(244, 114, 182, 0.1)' : 'transparent', padding: '0.5rem', borderRadius: '6px', border: selectedConditions.has(cond) ? '1px solid rgba(244, 114, 182, 0.3)' : '1px solid transparent', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = selectedConditions.has(cond) ? 'rgba(244, 114, 182, 0.1)' : 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = selectedConditions.has(cond) ? 'rgba(244, 114, 182, 0.1)' : 'transparent'}>
                        <input type="checkbox" checked={selectedConditions.has(cond)} onChange={() => toggleCondition(cond)} style={{ width: '18px', height: '18px', accentColor: '#f472b6', cursor: 'pointer' }} />
                        {cond}
                    </label>
                ))}
             </div>
        </div>

      </div>

      <button 
        onClick={handleNextStep}
        style={{
          width: '100%',
          padding: '1.2rem',
          background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)',
          transition: 'transform 0.1s'
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        Clone Me & Continue ➔
      </button>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
        <strong>Disclaimer:</strong> Absolutely none of this info leaves your browser. It purely sets initial variables for the theoretical simulation engine. It's safe to be honest!
      </div>
    </div>
  );
};
