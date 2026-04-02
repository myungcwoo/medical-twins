import type { FC } from 'react';
import { useState } from 'react';
import type { AgentState } from '../simulation/Agent';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
  customTwins: AgentState[];
  isCustomRunning: boolean;
  isCustomEnded: boolean;
  onTogglePlay: () => void;
  onEndTrial: () => void;
  customTicks: number;
  isCustomFastForwarding: boolean;
  onFastForward: (years: number) => void;
}

export const CustomTwinDashboard: FC<Props> = ({ customTwins, isCustomRunning, isCustomEnded, onTogglePlay, onEndTrial, customTicks, isCustomFastForwarding, onFastForward }) => {
  const [ffYears, setFfYears] = useState<number>(5);
  const [chartMode, setChartMode] = useState<'Health' | 'BP' | 'A1c' | 'Stress'>('Health');

  // Safety trigger just in case the tab mounts early
  if (customTwins.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No Custom Trial Active. Navigate to "Add Digital Twin" to launch a trial.
      </div>
    );
  }

  const getCohortData = () => {
    const dataMap = new Map<number, any>();
    
    customTwins.forEach(agent => {
       const isControl = agent.comparativeGroup === 'Control';
       agent.biometricHistory.forEach(snap => {
           if (!dataMap.has(snap.tick)) {
               dataMap.set(snap.tick, { 
                   tick: snap.tick, age: snap.age, 
                   cH: [], oH: [], 
                   cBP: [], oBP: [], 
                   cA1c: [], oA1c: [], 
                   cS: [], oS: [] 
               });
           }
           const entry = dataMap.get(snap.tick);
           if (isControl) {
               entry.cH.push(snap.health);
               entry.cBP.push(snap.bpSystolic);
               entry.cA1c.push(snap.a1c);
               entry.cS.push(snap.stress);
           } else {
               entry.oH.push(snap.health);
               entry.oBP.push(snap.bpSystolic);
               entry.oA1c.push(snap.a1c);
               entry.oS.push(snap.stress);
           }
       });
    });

    return Array.from(dataMap.values()).sort((a: any,b: any)=>a.tick - b.tick).map(entry => {
        const getStats = (arr: number[]) => {
            const len = arr.length;
            if (len === 0) return { mean: null, range: null };
            const mean = arr.reduce((acc, val) => acc + val, 0) / len;
            const min = Math.min(...arr);
            const max = Math.max(...arr);
            return { mean, range: [min, max] };
        };

        const cH = getStats(entry.cH);
        const oH = getStats(entry.oH);
        const cBP = getStats(entry.cBP);
        const oBP = getStats(entry.oBP);
        const cA1c = getStats(entry.cA1c);
        const oA1c = getStats(entry.oA1c);
        const cS = getStats(entry.cS);
        const oS = getStats(entry.oS);

        return {
            age: entry.age,
            tick: entry.tick,
            cH_mean: cH.mean ? Math.round(cH.mean) : null,
            cH_range: cH.range ? [Math.round(cH.range[0]), Math.round(cH.range[1])] : null,
            oH_mean: oH.mean ? Math.round(oH.mean) : null,
            oH_range: oH.range ? [Math.round(oH.range[0]), Math.round(oH.range[1])] : null,
            
            cBP_mean: cBP.mean ? Math.round(cBP.mean) : null,
            cBP_range: cBP.range ? [Math.round(cBP.range[0]), Math.round(cBP.range[1])] : null,
            oBP_mean: oBP.mean ? Math.round(oBP.mean) : null,
            oBP_range: oBP.range ? [Math.round(oBP.range[0]), Math.round(oBP.range[1])] : null,

            cA1c_mean: cA1c.mean ? Number(cA1c.mean.toFixed(1)) : null,
            cA1c_range: cA1c.range ? [Number(cA1c.range[0].toFixed(1)), Number(cA1c.range[1].toFixed(1))] : null,
            oA1c_mean: oA1c.mean ? Number(oA1c.mean.toFixed(1)) : null,
            oA1c_range: oA1c.range ? [Number(oA1c.range[0].toFixed(1)), Number(oA1c.range[1].toFixed(1))] : null,

            cS_mean: cS.mean ? Math.round(cS.mean) : null,
            cS_range: cS.range ? [Math.round(cS.range[0]), Math.round(cS.range[1])] : null,
            oS_mean: oS.mean ? Math.round(oS.mean) : null,
            oS_range: oS.range ? [Math.round(oS.range[0]), Math.round(oS.range[1])] : null,
        };
    });
  };

  const renderComparativeSummary = () => {
    if (!isCustomEnded || customTwins.length < 2) return null;
    
    const controls = customTwins.filter(t => t.comparativeGroup === 'Control');
    const tests = customTwins.filter(t => t.comparativeGroup === 'Intervention');
    if (controls.length === 0 || tests.length === 0) return null;
    
    const avgControlHealth = controls.reduce((acc, c) => acc + c.baseHealth, 0) / controls.length;
    const avgTestHealth = tests.reduce((acc, c) => acc + c.baseHealth, 0) / tests.length;
    const healthDelta = (avgTestHealth - avgControlHealth).toFixed(1);
    
    const avgControlStress = controls.reduce((acc, c) => acc + c.stressLevel, 0) / controls.length;
    const avgTestStress = tests.reduce((acc, c) => acc + c.stressLevel, 0) / tests.length;
    const stressDelta = (avgTestStress - avgControlStress).toFixed(1);
    const healthNum = parseFloat(healthDelta);

    const controlAges = controls.map(c => c.age);
    const testAges = tests.map(t => t.age);

    const avgControlAge = controlAges.reduce((acc, age) => acc + age, 0) / controls.length;
    const avgTestAge = testAges.reduce((acc, age) => acc + age, 0) / tests.length;
    
    const maxControlAge = Math.max(...controlAges);
    const maxTestAge = Math.max(...testAges);

    const minControlAge = Math.min(...controlAges);
    const minTestAge = Math.min(...testAges);

    // Identify top catastrophic mortality cause if applicable
    const getTopCause = (cohort: any[]) => {
      const causes: string[] = cohort.flatMap(c => c.history.filter((h: any) => h.type === 'Catastrophic Mortality').map((h: any) => h.description.split('.')[0]));
      if (causes.length === 0) return "Natural Age Decay (Gompertz-Makeham)";
      const counts: any = {};
      causes.forEach(cause => counts[cause] = (counts[cause] || 0) + 1);
      const top = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
      return `${top} (${counts[top]}/${cohort.length} Cases)`;
    };

    return (
      <div className="fade-in" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
         <h3 style={{ color: '#10b981', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🏁</span> Trial Terminated: PyTorch Multiverse Cohort Analytics
         </h3>
         <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            The Optimized AI pathway resulted in a <strong style={{color: healthNum >= 0 ? '#34d399' : '#ef4444'}}>{healthNum > 0 ? '+' : ''}{healthDelta} Mean Base Health</strong> shift and a <strong style={{color: parseFloat(stressDelta) <= 0 ? '#34d399' : '#ef4444'}}>{stressDelta} Mean Base Stress</strong> differential across {tests.length} identical starting clones compared to the {controls.length} unoptimized clones. Deep Learning inference calculated every individual tick boundary.
         </p>
         
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
           <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '4px', borderLeft: '3px solid #fca5a5' }}>
             <h4 style={{ color: '#fca5a5', margin: '0 0 1rem 0' }}>Control Cohort Probability</h4>
             <div style={{ color: '#e2e8f0', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div>Avg Life Expectancy: <strong style={{color: '#94a3b8'}}>{avgControlAge.toFixed(1)} Years</strong></div>
                <div>Absolute Max Age (Outlier): <strong>{maxControlAge.toFixed(1)} Years</strong></div>
                <div>Absolute Min Age (Casualty): <strong>{minControlAge.toFixed(1)} Years</strong></div>
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                   Primary Factor of Death: <span style={{ color: '#f87171' }}>{getTopCause(controls)}</span>
                </div>
             </div>
           </div>
           
           <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '4px', borderLeft: '3px solid #60a5fa' }}>
             <h4 style={{ color: '#60a5fa', margin: '0 0 1rem 0' }}>Optimized Cohort Probability</h4>
             <div style={{ color: '#e2e8f0', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div>Avg Life Expectancy: <strong style={{color: '#34d399'}}>{avgTestAge.toFixed(1)} Years</strong></div>
                <div>Absolute Max Age (Outlier): <strong>{maxTestAge.toFixed(1)} Years</strong></div>
                <div>Absolute Min Age (Casualty): <strong>{minTestAge.toFixed(1)} Years</strong></div>
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                   Primary Factor of Death: <span style={{ color: '#34d399' }}>{getTopCause(tests)}</span>
                </div>
             </div>
           </div>
         </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '1rem', animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{ 
        background: 'rgba(59, 130, 246, 0.1)', 
        border: '1px solid rgba(59, 130, 246, 0.4)', 
        padding: '1.5rem', 
        borderRadius: '8px',
        marginBottom: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h2 style={{ color: '#3b82f6', margin: 0 }}>Isolated Synthetic Deep Learning Trial</h2>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#e2e8f0', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              Simulation Week: {customTicks} {customTicks > 0 && `(Year ${(customTicks/52).toFixed(1)})`}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0, maxWidth: '800px' }}>
            This sub-environment explicitly houses your ingested Custom Cohort. To establish rigorous Multiverse Statistical Probability (removing single-agent luck), the sandbox automatically spun up {customTwins.length / 2} Control clones and {customTwins.length / 2} Optimized clones running identical chronological simulations. 
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          {!isCustomEnded && (
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <select value={ffYears} onChange={e => setFfYears(Number(e.target.value))} style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none', cursor: 'pointer', marginRight: '0.5rem', fontWeight: 'bold' }}>
                      <option value={1} style={{background:'#1e293b'}}>1 Year</option>
                      <option value={5} style={{background:'#1e293b'}}>5 Years</option>
                      <option value={10} style={{background:'#1e293b'}}>10 Years</option>
                  </select>
                  <button 
                      onClick={() => onFastForward(ffYears)}
                      disabled={isCustomFastForwarding}
                      style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold', cursor: isCustomFastForwarding ? 'not-allowed' : 'pointer', animation: isCustomFastForwarding ? 'pulseGlow 1s infinite' : 'none' }}
                  >
                      {isCustomFastForwarding ? 'Wait...' : '⏩ Skip'}
                  </button>
              </div>
          )}
          {!isCustomEnded && (
              <button 
                onClick={onTogglePlay}
                style={{
                  background: isCustomRunning ? '#4f46e5' : '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '0.8rem 1.7rem',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  transition: 'background 0.2s',
                  minWidth: '220px'
                }}
              >
                {isCustomRunning ? '⏸ Pause Custom Trial' : '▶ Start Custom Trial'}
              </button>
          )}
          {!isCustomEnded && (
              <button 
                onClick={onEndTrial}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '0.8rem 1.7rem',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                  transition: 'background 0.2s',
                }}
              >
                ⏹ End Trial
              </button>
          )}
          {isCustomEnded && (
            <div style={{ padding: '0.6rem 1.2rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontWeight: 'bold', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              Trial Concluded & Analyzed
            </div>
          )}
        </div>
      </div>
      
      {renderComparativeSummary()}

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
         <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
               <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#e2e8f0', fontSize: '1.2rem' }}>Multiverse Cohort Biometric Degradation ({customTwins.length} Simulated Trajectories)</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Plotting identical baseline patients diverging through standard progression against the AI-generated preventative protocol stack.</p>
               </div>
               <div style={{ display: 'flex', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem', borderRadius: '6px' }}>
                  {['Health', 'BP', 'A1c', 'Stress'].map(mode => (
                     <button
                        key={mode}
                        onClick={() => setChartMode(mode as any)}
                        style={{
                           background: chartMode === mode ? '#3b82f6' : 'transparent',
                           color: chartMode === mode ? 'white' : 'var(--text-muted)',
                           border: 'none',
                           padding: '0.4rem 0.8rem',
                           borderRadius: '4px',
                           cursor: 'pointer',
                           fontWeight: chartMode === mode ? 'bold' : 'normal'
                        }}
                     >
                        {mode === 'BP' ? 'Blood Pressure' : mode}
                     </button>
                  ))}
               </div>
            </div>
            
            <div style={{ width: '100%', height: 450 }}>
               {(() => {
                   let ylabel = "Base Health (%)";
                   let dMeanC = "cH_mean", dRangeC = "cH_range";
                   let dMeanO = "oH_mean", dRangeO = "oH_range";
                   let domain = [0, 100];
                   
                   if (chartMode === 'BP') {
                       ylabel = "Systolic Blood Pressure (mmHg)";
                       dMeanC = "cBP_mean"; dRangeC = "cBP_range";
                       dMeanO = "oBP_mean"; dRangeO = "oBP_range";
                       domain = [90, 220];
                   } else if (chartMode === 'A1c') {
                       ylabel = "A1c Level (%)";
                       dMeanC = "cA1c_mean"; dRangeC = "cA1c_range";
                       dMeanO = "oA1c_mean"; dRangeO = "oA1c_range";
                       domain = [4, 15];
                   } else if (chartMode === 'Stress') {
                       ylabel = "Daily Stress Threshold";
                       dMeanC = "cS_mean"; dRangeC = "cS_range";
                       dMeanO = "oS_mean"; dRangeO = "oS_range";
                       domain = [0, 100];
                   }

                   return (
                      <ResponsiveContainer>
                        <ComposedChart data={getCohortData()} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="age" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} type="number" domain={['dataMin', 'dataMax']} tickFormatter={val => Math.floor(val).toString()} />
                          <YAxis domain={domain} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} label={{ value: ylabel, angle: -90, position: 'insideLeft', fill: '#94a3b8', style: { textAnchor: 'middle' } }} />
                          <Tooltip 
                              contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} 
                              labelFormatter={(label) => `Patient Age: ${Math.floor(Number(label))}`}
                          />
                          <Legend wrapperStyle={{ paddingTop: '20px' }} />
                          
                          <Area type="monotone" dataKey={dRangeC} name={`Control ${ylabel} Bound`} fill="#f59e0b" stroke="none" fillOpacity={0.15} isAnimationActive={false} />
                          <Line type="monotone" dataKey={dMeanC} name={`Control Mean ${ylabel}`} stroke="#f59e0b" strokeWidth={3} dot={false} isAnimationActive={false} />
                          
                          <Area type="monotone" dataKey={dRangeO} name={`Optimized ${ylabel} Bound`} fill="#10b981" stroke="none" fillOpacity={0.2} isAnimationActive={false} />
                          <Line type="monotone" dataKey={dMeanO} name={`Optimized Mean ${ylabel}`} stroke="#10b981" strokeWidth={3} dot={false} isAnimationActive={false} />
                        </ComposedChart>
                      </ResponsiveContainer>
                   );
               })()}
            </div>
         </div>
      </div>

      {/* Feature 1: Median Split-Screen Divergence Log */}
      {(() => {
          if (!isCustomEnded || customTwins.length < 2) return null;

          const getMedianTwin = (cohort: AgentState[]) => {
              const sorted = [...cohort].sort((a,b) => {
                  const aLife = a.history[a.history.length-1]?.tick || 0;
                  const bLife = b.history[b.history.length-1]?.tick || 0;
                  return aLife - bLife;
              });
              return sorted[Math.floor(sorted.length / 2)];
          };

          const medianControl = getMedianTwin(customTwins.filter(c => c.comparativeGroup === 'Control'));
          const medianOpt = getMedianTwin(customTwins.filter(c => c.comparativeGroup === 'Intervention'));

          if (!medianControl || !medianOpt) return null;

          const baseAge = Math.floor(medianControl.age - (customTicks/52));
          const safeAge = (tick: number) => Math.floor(baseAge + (tick/52));

          const renderLog = (agent: AgentState, highlightColor: string) => (
              <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', borderTop: `4px solid ${highlightColor}` }}>
                  <h4 style={{ color: highlightColor, margin: '0 0 1rem 0', fontSize: '1.1rem' }}>{agent.name} <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>(Median Lifespan: {safeAge(agent.history[agent.history.length-1]?.tick || 0)} Yrs)</span></h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', overflowY: 'auto', maxHeight: '500px', paddingRight: '0.5rem' }}>
                      {agent.history.map((event, idx) => {
                          const isBad = event.type.includes('Mortality') || event.type.includes('Hazard');
                          const isGood = event.type.includes('Medical Protocol') || event.impactHealth > 0;
                          return (
                              <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '6px', borderLeft: `3px solid ${isBad ? '#ef4444' : isGood ? '#10b981' : '#3b82f6'}` }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                      <strong style={{ color: '#e2e8f0' }}>Age {safeAge(event.tick)}</strong>
                                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Week {event.tick}</span>
                                  </div>
                                  <div style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                      <strong style={{color: '#fff'}}>[{event.type}]</strong> {event.description}
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          );

          return (
              <div className="fade-in" style={{ marginTop: '2rem', background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', color: '#e2e8f0', fontSize: '1.2rem' }}>Longitudinal Clone Divergence Log</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Extracting the exact chronological medical history of the median Control clone vs the median Optimized AI clone for tick-by-tick comparison.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      {renderLog(medianControl, '#f59e0b')}
                      {renderLog(medianOpt, '#10b981')}
                  </div>
              </div>
          );
      })()}
    </div>
  );
};
