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
               dataMap.set(snap.tick, { tick: snap.tick, age: snap.age, controlValues: [], optValues: [] });
           }
           const entry = dataMap.get(snap.tick);
           if (isControl) entry.controlValues.push(snap.health);
           else entry.optValues.push(snap.health);
       });
    });

    return Array.from(dataMap.values()).sort((a: any,b: any)=>a.tick - b.tick).map(entry => {
        const cLen = entry.controlValues.length;
        const oLen = entry.optValues.length;
        
        const cMean = cLen > 0 ? entry.controlValues.reduce((acc: number, val: number) => acc + val, 0) / cLen : null;
        const cMin = cLen > 0 ? Math.min(...entry.controlValues) : null;
        const cMax = cLen > 0 ? Math.max(...entry.controlValues) : null;

        const oMean = oLen > 0 ? entry.optValues.reduce((acc: number, val: number) => acc + val, 0) / oLen : null;
        const oMin = oLen > 0 ? Math.min(...entry.optValues) : null;
        const oMax = oLen > 0 ? Math.max(...entry.optValues) : null;

        return {
            age: entry.age,
            tick: entry.tick,
            cMean: cMean ? Math.round(cMean) : null,
            cRange: cMin !== null && cMax !== null ? [Math.round(cMin), Math.round(cMax)] : null,
            oMean: oMean ? Math.round(oMean) : null,
            oRange: oMin !== null && oMax !== null ? [Math.round(oMin), Math.round(oMax)] : null,
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
            <h3 style={{ margin: '0 0 1rem 0', color: '#e2e8f0', fontSize: '1.2rem' }}>Multiverse Cohort Survival Statistics ({customTwins.length} Simulated Trajectories)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Plotting identical baseline patients diverging through standard progression (Control bounds in Orange) against the AI-generated preventative protocol stack (Optimized bounds in Green).</p>
            <div style={{ width: '100%', height: 450 }}>
              <ResponsiveContainer>
                <ComposedChart data={getCohortData()} margin={{ top: 20, right: 30, bottom: 20, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="age" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} type="number" domain={['dataMin', 'dataMax']} tickFormatter={val => Math.floor(val).toString()} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <Tooltip 
                      contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} 
                      labelFormatter={(label) => `Patient Age: ${Math.floor(Number(label))}`}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  
                  {/* Control Bounds */}
                  <Area type="monotone" dataKey="cRange" name="Control Confidence Bound (Min-Max)" fill="#f59e0b" stroke="none" fillOpacity={0.15} isAnimationActive={false} />
                  <Line type="monotone" dataKey="cMean" name="Control Mean Health Trajectory" stroke="#f59e0b" strokeWidth={3} dot={false} isAnimationActive={false} />
                  
                  {/* Optimized Bounds */}
                  <Area type="monotone" dataKey="oRange" name="Optimized Confidence Bound (Min-Max)" fill="#10b981" stroke="none" fillOpacity={0.2} isAnimationActive={false} />
                  <Line type="monotone" dataKey="oMean" name="Optimized Mean Health Trajectory" stroke="#10b981" strokeWidth={3} dot={false} isAnimationActive={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};
