import { useState, useEffect } from 'react';
import type { AgentState } from '../simulation/Agent';
import { PredictiveEngine } from '../simulation/PredictiveEngine';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { FC } from 'react';

interface Props {
  agents: AgentState[];
  selectedId: string;
  onSelectAgent: (id: string) => void;
}

export const TimelineView: FC<Props> = ({ agents, selectedId, onSelectAgent }) => {
  const selected = agents.find(a => a.id === selectedId) || agents[0];
  const pair = selected?.pairedTwinId ? agents.find(a => a.id === selected.pairedTwinId) : null;

  const [forecasts, setForecasts] = useState<any[] | null>(null);

  useEffect(() => {
    if (!selected || selected.isDead) return;
    
    // Live PyTorch ML Inference Fetch
    fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selected)
    })
    .then(res => res.json())
    .then(data => {
        if (data && data.status === 'success') {
            const f = data.forecast;
            setForecasts([
                { disease: 'ASCVD (Stroke / Heart Attack)', riskPercentage: f.stroke_risk, riskLevel: PredictiveEngine.getRiskLevel(f.stroke_risk), mitigations: ['Authentic ML Neural Tensor Prediction'] },
                { disease: 'Heart Failure (CHF)', riskPercentage: f.chf_risk, riskLevel: PredictiveEngine.getRiskLevel(f.chf_risk), mitigations: ['Authentic ML Neural Tensor Prediction'] },
                { disease: 'Type 2 Diabetes', riskPercentage: f.diabetes_risk, riskLevel: PredictiveEngine.getRiskLevel(f.diabetes_risk), mitigations: ['Authentic ML Neural Tensor Prediction'] },
                { disease: 'COPD', riskPercentage: f.copd_risk, riskLevel: PredictiveEngine.getRiskLevel(f.copd_risk), mitigations: ['Authentic ML Neural Tensor Prediction'] }
            ]);
        }
    })
    .catch(err => {
        console.warn("PyTorch Engine Offline. Falling back to TS Predictive Physics.");
        setForecasts(PredictiveEngine.getForecast(selected));
    });
  }, [selected?.id, selected?.age, selected?.vitals?.bpSystolic, selected?.isDead]);

  let chartData: any[] = [];
  if (selected && selected.biometricHistory) {
    if (pair && pair.biometricHistory) {
      const isControl = selected.comparativeGroup === 'Control';
      const controlTwin = isControl ? selected : pair;
      const optTwin = isControl ? pair : selected;

      const ticksSet = new Set([...controlTwin.biometricHistory.map(b=>b.tick), ...optTwin.biometricHistory.map(b=>b.tick)]);
      const sortedTicks = Array.from(ticksSet).sort((a,b)=>a-b);
      
      chartData = sortedTicks.map(tick => {
          const cSnap = controlTwin.biometricHistory.find(b=>b.tick===tick);
          const oSnap = optTwin.biometricHistory.find(b=>b.tick===tick);
          return {
              tick, 
              year: Math.floor(tick/52),
              age: cSnap ? cSnap.age : (oSnap ? oSnap.age : 0),
              controlHealth: cSnap ? Math.round(cSnap.health) : null,
              optHealth: oSnap ? Math.round(oSnap.health) : null,
          };
      });
    } else {
      chartData = selected.biometricHistory.map(snap => ({
          tick: snap.tick,
          year: Math.floor(snap.tick/52),
          age: snap.age,
          health: Math.round(snap.health),
          bp: Math.round(snap.bpSystolic)
      }));
    }
  }

  return (
    <div className="timeline-container">

      
      <div className="timeline-content glass-panel" style={selected?.isDead ? { border: '1px solid rgba(239, 68, 68, 0.4)' } : {}}>
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

              <div className="timeline-stats">
                <span>Age: {Math.floor(selected.age)}</span>
                <span>Sex: {selected.sex}</span>
                <span className="stat-health" style={{color: selected.isDead ? '#ef4444' : 'var(--health-good)'}}>Health: {Math.round(selected.baseHealth)}%</span>
                <span className="stat-stress">Stress: {Math.round(selected.stressLevel)}%</span>
              </div>

              <div className="timeline-stats" style={{marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--text-muted)'}}>
                <span><strong>Family Hx:</strong> {selected.familyHistory.length > 0 ? selected.familyHistory.join(', ') : 'None'}</span>
                <span><strong>Surgeries:</strong> {selected.surgicalHistory.length > 0 ? selected.surgicalHistory.join(', ') : 'None'}</span>
                <span><strong>Meds:</strong> {selected.medications.length > 0 ? selected.medications.join(', ') : 'None'}</span>
                <span><strong>Smoker:</strong> {selected.smoker ? 'Yes' : 'No'}</span>
                <span style={{color: selected.medicalCompliance === 'High' ? 'var(--health-good)' : selected.medicalCompliance === 'Low' ? 'var(--health-crit)' : '#fcd34d'}}><strong>Compliance:</strong> {selected.medicalCompliance}</span>
                <span style={{color: selected.exerciseRoutine === 'High' ? 'var(--health-good)' : selected.exerciseRoutine === 'None' ? 'var(--health-crit)' : '#fcd34d'}}><strong>Exercise:</strong> {selected.exerciseRoutine}</span>
              </div>

              {/* Comparative Trajectory Chart */}
              {chartData.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem', marginTop: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#e2e8f0', fontSize: '1.1rem' }}>Overall Biological Output Trajectory</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="age" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} type="number" domain={['dataMin', 'dataMax']} tickFormatter={val => Math.floor(val).toString()} />
                        <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                        <Tooltip 
                            contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                            labelFormatter={(label) => `Age: ${Math.floor(Number(label))}`}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        {pair ? (
                          <>
                            <Line type="monotone" dataKey="controlHealth" name="Control Health %" stroke="#f59e0b" strokeWidth={3} dot={false} isAnimationActive={false} />
                            <Line type="monotone" dataKey="optHealth" name="Optimized Health %" stroke="#10b981" strokeWidth={3} dot={false} isAnimationActive={false} />
                          </>
                        ) : (
                          <Line type="monotone" dataKey="health" name="Base Health %" stroke="#3b82f6" strokeWidth={3} dot={false} isAnimationActive={false} />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

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
                            {forecast.mitigations.map((mg, idx) => (
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
           <p>Select an agent to view their clinical history.</p>
        )}
      </div>
    </div>
  );
};
