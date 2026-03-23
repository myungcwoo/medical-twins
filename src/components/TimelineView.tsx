import { useState } from 'react';
import type { AgentState } from '../simulation/Agent';
import { PredictiveEngine } from '../simulation/PredictiveEngine';
import type { FC } from 'react';

interface Props {
  agents: AgentState[];
}

export const TimelineView: FC<Props> = ({ agents }) => {
  const [selectedId, setSelectedId] = useState<string>(agents[0]?.id || '');
  const selected = agents.find(a => a.id === selectedId);

  return (
    <div className="timeline-container">
      <div className="sidebar">
        {agents.map(a => (
          <button 
            key={a.id} 
            className={`sidebar-btn ${selectedId === a.id ? 'active' : ''} ${a.isDead ? 'dead' : ''}`}
            onClick={() => setSelectedId(a.id)}
            style={a.isDead ? { color: '#fca5a5', borderColor: 'rgba(239,68,68,0.3)', background: selectedId === a.id ? 'rgba(239,68,68,0.2)' : 'transparent' } : {}}
          >
            {a.isDead ? '✝ ' : ''}{a.name}
          </button>
        ))}
      </div>
      
      <div className="timeline-content glass-panel" style={selected?.isDead ? { border: '1px solid rgba(239, 68, 68, 0.4)' } : {}}>
        {selected ? (
          <>
            <div className="timeline-header">
              <h2 style={{color: selected.isDead ? '#fca5a5' : 'inherit'}}>
                {selected.isDead ? '✝ ' : ''}{selected.name}'s Electronic Health Record
              </h2>
              
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

              {/* AHA / PREVENT Predictive Forecast Engine */}
              {!selected.isDead && (
                <div className="forecast-panel" style={{marginTop: '2rem', padding: '1rem', background: 'rgba(30,30,40,0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)'}}>
                  <h3 style={{marginTop: 0, marginBottom: '1rem', color: '#60a5fa'}}>
                    <span role="img" aria-label="crystal-ball">🔮</span> 10-Year Clinical Forecast (AHA PREVENT Estimator)
                  </h3>
                  
                  <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                    {PredictiveEngine.getForecast(selected).map((forecast, i) => (
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
