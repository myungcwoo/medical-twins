import React from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { History } from 'lucide-react';

export const TimeScrubber: React.FC = () => {
    const { checkpoints, handleRewind, isFastForwarding, isRunning } = useSimulationStore();

    if (checkpoints.length === 0) return null;

    return (
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#facc15' }}>
                <History size={18} />
                <strong style={{ fontSize: '1.1rem' }}>Temporal Divergence (Rewind Timeline)</strong>
            </div>
            
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Select a historical snapshot branch to roll back the simulation locally. This will overwrite current network variables!
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.3rem' }}>
                {checkpoints.map(tick => (
                    <button
                        key={tick}
                        disabled={isFastForwarding || isRunning}
                        onClick={() => {
                            if(window.confirm(`Are you sure you want to time-travel back to Simulation Week ${tick}?`)) {
                                handleRewind(tick);
                            }
                        }}
                        style={{
                            background: 'transparent',
                            border: '1px solid #facc15',
                            color: '#facc15',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '20px',
                            cursor: (isFastForwarding || isRunning) ? 'not-allowed' : 'pointer',
                            fontSize: '0.85rem',
                            opacity: (isFastForwarding || isRunning) ? 0.3 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        Year {Math.floor(tick / 52)} (Wk {tick})
                    </button>
                ))}
            </div>
        </div>
    );
};
