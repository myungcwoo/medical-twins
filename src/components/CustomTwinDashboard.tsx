import type { FC } from 'react';
import { useState } from 'react';
import type { AgentState } from '../simulation/Agent';
import { TimelineView } from './TimelineView';

interface Props {
  customTwins: AgentState[];
  isCustomRunning: boolean;
  isCustomEnded: boolean;
  onTogglePlay: () => void;
  onEndTrial: () => void;
  customTicks: number;
}

export const CustomTwinDashboard: FC<Props> = ({ customTwins, isCustomRunning, isCustomEnded, onTogglePlay, onEndTrial, customTicks }) => {
  const [selectedId, setSelectedId] = useState<string>(customTwins[0]?.id || '');

  // Safety trigger just in case the tab mounts early
  if (customTwins.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No Custom Trial Active. Navigate to "Add Digital Twin" to launch a trial.
      </div>
    );
  }

  const renderComparativeSummary = () => {
    if (!isCustomEnded || customTwins.length < 2) return null;
    
    const control = customTwins.find(t => t.comparativeGroup === 'Control')!;
    const test = customTwins.find(t => t.comparativeGroup === 'Intervention')!;
    
    const controlPathologies = control.history.filter((h: any) => h.type === 'Pathology Acquired');
    const testPathologies = test.history.filter((h: any) => h.type === 'Pathology Acquired');

    const healthDelta = (test.baseHealth - control.baseHealth).toFixed(1);
    const stressDelta = (test.stressLevel - control.stressLevel).toFixed(1);
    const healthNum = parseFloat(healthDelta);
    
    return (
      <div className="fade-in" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
         <h3 style={{ color: '#10b981', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🏁</span> Trial Terminated: Comparative Clinical Analytics
         </h3>
         <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            The Optimized AI pathway resulted in a <strong style={{color: healthNum >= 0 ? '#34d399' : '#ef4444'}}>{healthNum > 0 ? '+' : ''}{healthDelta} Base Health</strong> shift and a <strong style={{color: parseFloat(stressDelta) <= 0 ? '#34d399' : '#ef4444'}}>{stressDelta} Base Stress</strong> differential comparatively against standard uncontrolled progression. Identical biological starting states produced radically divergent outcome arrays.
         </p>
         
         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
           <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '4px', borderLeft: '3px solid #fca5a5' }}>
             <h4 style={{ color: '#fca5a5', margin: '0 0 0.8rem 0' }}>Control Agent Pathology Trace</h4>
             {controlPathologies.length === 0 ? <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>No severe secondary complications acquired.</span> : 
               <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.5 }}>
                 {controlPathologies.map((p: any, i: number) => <li key={i}><strong>Week {p.tick}:</strong> {p.description.split('.')[0]}.</li>)}
               </ul>
             }
             <div style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>Final Age Reached: <strong>{control.age.toFixed(1)}</strong></div>
           </div>
           
           <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '4px', borderLeft: '3px solid #60a5fa' }}>
             <h4 style={{ color: '#60a5fa', margin: '0 0 0.8rem 0' }}>Optimized Agent Pathology Trace</h4>
             {testPathologies.length === 0 ? <span style={{color: '#34d399', fontSize: '0.9rem'}}>Clean trajectory. Zero secondary complications acquired!</span> : 
               <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.5 }}>
                 {testPathologies.map((p: any, i: number) => <li key={i}><strong>Week {p.tick}:</strong> {p.description.split('.')[0]}.</li>)}
               </ul>
             }
             <div style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>Final Age Reached: <strong>{test.age.toFixed(1)}</strong></div>
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
            <h2 style={{ color: '#3b82f6', margin: 0 }}>Isolated Synthetic Trial</h2>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#e2e8f0', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              Simulation Week: {customTicks} {customTicks > 0 && `(Year ${(customTicks/52).toFixed(1)})`}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0, maxWidth: '800px' }}>
            This sub-environment explicitly houses your ingested Custom Twin. The Control and Optimized configurations are tracking entirely independently from the central 100-Agent simulation loop to preserve pure 1-vs-1 Comparative Analysis trajectories across the selected clinical permutations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
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
        <TimelineView agents={customTwins} selectedId={selectedId || customTwins[0].id} onSelectAgent={setSelectedId} />
      </div>
    </div>
  );
};
