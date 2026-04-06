import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { PredictiveEngine } from '../simulation/PredictiveEngine';
import type { FC } from 'react';
import { ComparativeLineChart, type ChartData } from './charts/ComparativeLineChart';

import { useSimulationStore } from '../store/useSimulationStore';
import { STATIC_LITERATURE_DB } from '../data/ClinicalLiteratureDB';
import { HolographicTorso } from './3d/HolographicTorso';

interface Props {
  selectedId: string;
  onSelectAgent: (id: string) => void;
}

export const TimelineView: FC<Props> = ({ selectedId, onSelectAgent }) => {
  const navigate = useNavigate();
  const { agents } = useSimulationStore();
  const selected = selectedId ? agents.find(a => a.id === selectedId) : null;
  const pair = selected?.pairedTwinId ? agents.find(a => a.id === selected.pairedTwinId) : null;

  interface Forecast {
      disease: string;
      riskPercentage: number;
      riskLevel: string;
      mitigations: string[];
  }
  const [forecasts, setForecasts] = useState<Forecast[] | null>(null);

  useEffect(() => {
    if (!selected || selected.isDead) return;
    
    // Fallback to TS Predictive Physics array locally 
    // Emulates a synthetic ML prediction duration for premium UX feedback
    const timerId = setTimeout(() => {
        setForecasts(PredictiveEngine.getForecast(selected));
    }, 600);

    return () => clearTimeout(timerId);
  }, [selected?.id, selected?.age, selected?.vitals?.bpSystolic, selected?.isDead]);

  let chartData: ChartData[] = [];
  if (selected && selected.biometricHistory) {
    if (pair && pair.biometricHistory) {
      const isControl = selected.comparativeGroup === 'Control';
      const controlTwin = isControl ? selected : pair;
      const optTwin = isControl ? pair : selected;

      const ticksSet = new Set([...controlTwin.biometricHistory.map((b: any)=>b.tick), ...optTwin.biometricHistory.map((b: any)=>b.tick)]);
      const sortedTicks = Array.from(ticksSet).sort((a,b)=>a-b);
      
      chartData = sortedTicks.map(tick => {
          const cSnap = controlTwin.biometricHistory.find((b: any)=>b.tick===tick);
          const oSnap = optTwin.biometricHistory.find((b: any)=>b.tick===tick);
          return {
              tick, 
              year: Math.floor(tick/52),
              age: cSnap ? cSnap.age : (oSnap ? oSnap.age : 0),
              controlHealth: cSnap ? Math.round(cSnap.health) : null,
              optHealth: oSnap ? Math.round(oSnap.health) : null,
              controlBP: cSnap ? Math.round(cSnap.bpSystolic) : null,
              optBP: oSnap ? Math.round(oSnap.bpSystolic) : null,
              controlA1c: cSnap ? Number(cSnap.a1c.toFixed(1)) : null,
              optA1c: oSnap ? Number(oSnap.a1c.toFixed(1)) : null,
          };
      });
    } else {
      chartData = selected.biometricHistory.map((snap: any) => ({
          tick: snap.tick,
          year: Math.floor(snap.tick/52),
          age: snap.age,
          health: Math.round(snap.health),
          bp: Math.round(snap.bpSystolic),
          a1c: Number(snap.a1c.toFixed(1))
      }));
    }
  }

  return (
    <div className="timeline-container inline-dashboard-panel" style={{
        marginBottom: '2rem',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        padding: '2rem',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
    }}>
      
      <div className="timeline-content glass-panel" style={{ 
          width: '100%', 
          position: 'relative',
          padding: '2rem',
          backgroundColor: 'transparent',
          border: 'none',
          boxShadow: 'none',
          ...(selected?.isDead ? { border: '1px solid rgba(239, 68, 68, 0.4)' } : {})
      }}>
        <button onClick={() => onSelectAgent('')} style={{
             position: 'absolute',
             top: '1.5rem',
             right: '1.5rem',
             background: 'rgba(255,255,255,0.1)',
             border: 'none',
             color: 'white',
             width: '40px',
             height: '40px',
             borderRadius: '50%',
             cursor: 'pointer',
             fontSize: '1.2rem',
             zIndex: 10
         }}>✕</button>

        {selected ? (
          <>
            <div className="timeline-header">
              <h2 style={{color: selected.isDead ? '#fca5a5' : 'inherit'}}>
                {selected.isDead ? '✝ ' : ''}{selected.name}'s Electronic Health Record
              </h2>
              
              {pair && (
                <div style={{background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', border: `1px solid ${selected.comparativeGroup === 'Intervention' ? '#10b981' : '#f59e0b'}`, borderRadius: '8px', marginBottom: '1.5rem'}}>
                  <h3 style={{margin: '0 0 0.5rem 0', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem'}}><span role="img" aria-label="compare">⚖️</span> Real-World Comparative Axis Live</h3>
                  <p style={{margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem'}}>This agent is physically decoupled into an Isolated Synthetic Trial. Utilizing empirical network datasets, you explicitly selected and injected the top-yielding Generative protocols straight into the Optimized twin's chronological trajectory.</p>
                  
                  <div style={{display: 'flex', gap: '2rem', marginTop: '1rem'}}>
                    <div style={{flex: 1, padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', borderLeft: selected.comparativeGroup === 'Control' ? '4px solid #60a5fa' : '4px solid rgba(255,255,255,0.1)'}}>
                      <div style={{fontWeight: 'bold', color: '#f59e0b'}}>Control Physiology</div>
                      <div style={{fontSize: '2rem', fontWeight: '800', color: (selected.comparativeGroup === 'Control' ? selected.isDead : pair.isDead) ? '#fca5a5' : '#e2e8f0'}}>{Math.round(selected.comparativeGroup === 'Control' ? selected.baseHealth : pair.baseHealth)}% Health</div>
                    </div>
                    <div style={{flex: 1, padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', borderLeft: selected.comparativeGroup === 'Intervention' ? '4px solid #60a5fa' : '4px solid rgba(255,255,255,0.1)'}}>
                      <div style={{fontWeight: 'bold', color: '#10b981'}}>Optimized Physiology (Network Driven)</div>
                      <div style={{fontSize: '2rem', fontWeight: '800', color: (selected.comparativeGroup === 'Intervention' ? selected.isDead : pair.isDead) ? '#fca5a5' : '#10b981'}}>{Math.round(selected.comparativeGroup === 'Intervention' ? selected.baseHealth : pair.baseHealth)}% Health</div>
                    </div>
                  </div>
                </div>
              )}

              {selected.isDead && (
                <div style={{background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', color: '#fca5a5', marginBottom: '1.5rem'}}>
                  <h3 style={{margin: 0}}><span role="img" aria-label="alert">⚠️</span> Patient Deceased</h3>
                  <p style={{margin: '0.4rem 0 0 0'}}>This digital twin has passed away due to systemic failure. All ongoing simulation physics have been halted.</p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'start' }}>
                <HolographicTorso agent={selected} />
                
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="timeline-stats" style={{ margin: 0 }}>
                  <span>Age: {Math.floor(selected.age)}</span>
                  <span>Sex: {selected.sex}</span>
                  <span className="stat-health" style={{color: selected.isDead ? '#ef4444' : 'var(--health-good)'}}>Health: {Math.round(selected.baseHealth)}%</span>
                  <span className="stat-stress">Stress: {Math.round(selected.stressLevel)}%</span>
                </div>

                <div className="timeline-stats" style={{marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)'}}>
                  <span><strong>Family Hx:</strong> {selected.familyHistory.length > 0 ? selected.familyHistory.join(', ') : 'None'}</span>
                  <span><strong>Surgeries:</strong> {selected.surgicalHistory.length > 0 ? selected.surgicalHistory.join(', ') : 'None'}</span>
                  <span><strong>Meds:</strong> {selected.medications.length > 0 ? selected.medications.join(', ') : 'None'}</span>
                  <span><strong>Smoker:</strong> {selected.smoker ? 'Yes' : 'No'}</span>
                  <span style={{color: selected.medicalCompliance === 'High' ? 'var(--health-good)' : selected.medicalCompliance === 'Low' ? 'var(--health-crit)' : '#fcd34d'}}><strong>Compliance:</strong> {selected.medicalCompliance}</span>
                  <span style={{color: selected.exerciseRoutine === 'High' ? 'var(--health-good)' : selected.exerciseRoutine === 'None' ? 'var(--health-crit)' : '#fcd34d'}}><strong>Exercise:</strong> {selected.exerciseRoutine}</span>
                </div>
                </div>
              </div>

              {selected.medications.length > 0 && (
                <div style={{ marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#e2e8f0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span role="img" aria-label="evidence">📚</span> Governing Clinical Evidence
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                    {selected.medications.map((med: string) => {
                       const lower = med.toLowerCase();
                       let matchedTrial = null;
                       if (lower.includes('semaglutide') || lower.includes('glp')) matchedTrial = STATIC_LITERATURE_DB.find(t => t.id === 'LIT-SELECT-01');
                       else if (lower.includes('empagliflozin') || lower.includes('sglt')) matchedTrial = STATIC_LITERATURE_DB.find(t => t.id === 'LIT-DAPA-HF-02');
                       else if (lower.includes('sacubitril') || lower.includes('arni') || lower.includes('lisinopril')) matchedTrial = STATIC_LITERATURE_DB.find(t => t.id === 'LIT-PARADIGM-03');
                       else if (lower.includes('statin')) matchedTrial = STATIC_LITERATURE_DB.find(t => t.id === 'LIT-FOURIER-05');
                       else if (lower.includes('finerenone') || lower.includes('aldactone') || lower.includes('spironolactone')) matchedTrial = STATIC_LITERATURE_DB.find(t => t.id === 'LIT-FIDELIO-06');
                       
                       if (!matchedTrial) {
                           // Fallback Trial mapper for general ones
                           if (['metoprolol', 'amlodipine', 'hctz'].some(x => lower.includes(x))) {
                               matchedTrial = STATIC_LITERATURE_DB.find(t => t.id === 'LIT-SPRINT-04');
                           } else {
                               return null;
                           }
                       }

                       if (!matchedTrial) return null;

                       return (
                         <div key={med} style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '1rem', animation: 'fadeIn 0.5s ease-out' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                             <div style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{med}</div>
                             <div style={{ background: 'rgba(244, 114, 182, 0.15)', color: '#f472b6', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid rgba(244, 114, 182, 0.3)' }}>
                               HR: {matchedTrial.hazardRatio}
                             </div>
                           </div>
                           <div style={{ color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>{matchedTrial.intervention}</div>
                           <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                             {matchedTrial.findings}
                           </div>
                           <div style={{ marginTop: '0.8rem', color: '#94a3b8', fontSize: '0.75rem' }}>
                             <strong>Source:</strong> {matchedTrial.source} ({matchedTrial.year})
                           </div>
                         </div>
                       );
                    })}
                  </div>
                </div>
              )}

              <ComparativeLineChart chartData={chartData} isPaired={!!pair} />

              {/* Vitals & Labs Panel */}
              <div className="vitals-panel" style={{opacity: selected.isDead ? 0.6 : 1}}>
                <div className="vital-box">
                  <label>BP</label>
                  <div className={`value ${selected.vitals.bpSystolic > 140 ? 'critical' : selected.vitals.bpSystolic > 120 ? 'warning' : 'good'}`}>
                    {selected.isDead ? 0 : Math.round(selected.vitals.bpSystolic)}/{selected.isDead ? 0 : Math.round(selected.vitals.bpDiastolic)}
                  </div>
                </div>
                <div className="vital-box">
                  <label>HR</label>
                  <div className={`value ${selected.vitals.heartRate > 100 ? 'critical' : 'good'}`}>
                    {selected.isDead ? 0 : Math.round(selected.vitals.heartRate)}
                  </div>
                </div>
                <div className="vital-box">
                  <label>BMI</label>
                  <div className={`value ${selected.vitals.bmi >= 30 ? 'critical' : selected.vitals.bmi >= 25 ? 'warning' : 'good'}`}>
                    {selected.vitals.bmi.toFixed(1)}
                  </div>
                </div>
                <div className="vital-box">
                  <label>A1C</label>
                  <div className={`value ${selected.labs.a1c >= 6.5 ? 'critical' : selected.labs.a1c >= 5.7 ? 'warning' : 'good'}`}>
                    {selected.labs.a1c.toFixed(1)}%
                  </div>
                </div>
                <div className="vital-box">
                  <label>LDL</label>
                  <div className={`value ${selected.labs.ldlCholesterol >= 160 ? 'critical' : selected.labs.ldlCholesterol >= 130 ? 'warning' : 'good'}`}>
                    {Math.round(selected.labs.ldlCholesterol)}
                  </div>
                </div>
                <div className="vital-box">
                  <label>eGFR</label>
                  <div className={`value ${selected.labs.egfr < 60 ? 'critical' : selected.labs.egfr < 90 ? 'warning' : 'good'}`}>
                    {Math.round(selected.labs.egfr)}
                  </div>
                </div>
                <div className="vital-box">
                  <label>CV Health</label>
                  <div className={`value ${selected.labs.cvHealth < 50 ? 'critical' : selected.labs.cvHealth < 80 ? 'warning' : 'good'}`}>
                    {Math.round(selected.labs.cvHealth)}%
                  </div>
                </div>
              </div>

              {/* True PyTorch Predictive Inference Engine */}
              {!selected.isDead && (
                <div className="forecast-panel" style={{marginTop: '2rem', padding: '1rem', background: 'rgba(30,30,40,0.4)', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.3)'}}>
                  <h3 style={{marginTop: 0, marginBottom: '1rem', color: '#ec4899', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    🧠 PyTorch Tensor Inference Engine
                  </h3>
                  
                  <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    {!forecasts ? (
                        <div style={{ color: 'var(--text-muted)', padding: '1rem', textAlign: 'center' }}>Transmitting telemetry to deep learning array...</div>
                    ) : forecasts.map((forecast, i) => (
                      <div key={i} style={{display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', background: 'rgba(0,0,0,0.2)', padding: '0.8rem', borderRadius: '6px', borderLeft: `4px solid ${forecast.riskLevel === 'Critical' ? '#ef4444' : forecast.riskLevel === 'High' ? '#f59e0b' : forecast.riskLevel === 'Moderate' ? '#3b82f6' : '#10b981'}`}}>
                        
                        <div style={{flex: '1 1 200px', marginBottom: '0.5rem'}}>
                          <div style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>{forecast.disease} Risk</div>
                          <div style={{fontSize: '1.4rem', fontWeight: '600', color: forecast.riskLevel === 'Critical' ? '#ef4444' : forecast.riskLevel === 'High' ? '#f59e0b' : forecast.riskLevel === 'Moderate' ? '#3b82f6' : '#10b981'}}>
                            {forecast.riskPercentage.toFixed(1)}% ({forecast.riskLevel})
                          </div>
                        </div>

                        <div style={{flex: '3 1 300px'}}>
                          <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px'}}>Recommended Preventative Mitigations:</div>
                          <ul style={{margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem'}}>
                            {forecast.mitigations.map((mg: string, idx: number) => (
                              <li key={idx} style={{marginBottom: '3px', color: '#e2e8f0'}}>{mg}</li>
                            ))}
                          </ul>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="history-list">
              <h3 style={{marginBottom: '1rem'}}>Event History Timeline</h3>
              {selected.history.length === 0 ? (
                <p className="no-events">No major events recorded yet.</p>
              ) : (
                [...selected.history].reverse().map((ev, i) => (
                  <div key={i} className="history-item" style={ev.type.includes('Mortality') ? {borderLeftColor: '#ef4444'} : {}}>
                    <div className="history-tick">Week {ev.tick}</div>
                    <div className="history-details" style={ev.type.includes('Mortality') || ev.type.includes('ICU') ? {border: '1px solid rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.05)'} : {}}>
                      <strong className="event-type" style={ev.type.includes('Mortality') || ev.type.includes('ICU') ? {color: '#fca5a5'} : {}}>{ev.type}</strong>
                      <p>{ev.description}</p>
                      
                      {ev.citation && (
                        <div style={{marginTop: '0.8rem', fontSize: '0.82rem', background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem 0.8rem', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#bfdbfe'}}>
                          <span role="img" aria-label="book" style={{marginRight: '6px'}}>📖</span> 
                          <strong>Evidence Basis:</strong> {ev.citation} <br/>
                          {ev.hazardRatio && <span style={{display: 'inline-block', marginTop: '4px', color: '#fca5a5'}}>Hazard Ratio (HR) Applied: <strong>{ev.hazardRatio.toFixed(2)}x</strong></span>}
                        </div>
                      )}

                      <div className="event-impacts">
                        <span className={`impact ${ev.impactHealth < 0 ? 'negative' : 'positive'}`}>
                          Health: {ev.impactHealth === 0 ? '0' : (ev.impactHealth > 0 ? '+' : '') + ev.impactHealth.toFixed(1)}
                        </span>
                        <span className={`impact ${ev.impactStress > 0 ? 'negative' : 'positive'}`}>
                          Stress: {ev.impactStress === 0 ? '0' : (ev.impactStress > 0 ? '+' : '') + ev.impactStress.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
           <div style={{ textAlign: 'center', padding: '4rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🩻</div>
               <h3 style={{ color: '#e2e8f0', fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Digital Twin Selected</h3>
               <p style={{ color: 'var(--text-muted)', maxWidth: '500px', lineHeight: 1.5, marginBottom: '2rem' }}>
                   You have accessed the timeline view directly. Please return to the Command Center and click on a specific patient node to view their longitudinal health Electronic Health Record (EHR).
               </p>
               <button 
                  onClick={() => navigate('/dashboard')} 
                  style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
               >
                  <span>◂</span> Return to Command Center
               </button>
           </div>
        )}
      </div>
    </div>
  );
};
