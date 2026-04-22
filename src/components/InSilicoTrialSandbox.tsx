import { useState, type FC } from 'react';
import { generateAgent } from '../simulation/InitialData';
import { SimulationEngine } from '../simulation/Engine';
import type { IdeaTemplate } from '../simulation/KnowledgeNetwork';
import { SurvivalComposedChart } from './charts/SurvivalComposedChart';
import type { AgentState } from '../types/Simulation.types';

interface InSilicoTrialSandboxProps {
    pendingProtocol: any; 
    onValidate: (validatedTemplate: IdeaTemplate) => void;
    onCancel: () => void;
}

export const InSilicoTrialSandbox: FC<InSilicoTrialSandboxProps> = ({ pendingProtocol, onValidate, onCancel }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<{
        controlAvgAge: number; optAvgAge: number;
        controlSurv: number; optSurv: number;
        dataMap: any[];
    } | null>(null);

    const [cohortSize] = useState(200);
    const [simYears] = useState(10);

    const runTrial = () => {
        setIsRunning(true);
        setTimeout(() => {
            try {
                // 1. Generate cohorts
                const controlRaw = Array.from({ length: cohortSize / 2 }, (_, i) => generateAgent(i));
                const optRaw = Array.from({ length: cohortSize / 2 }, (_, i) => generateAgent(i + 1000));
                
                // Clone state completely
                const controlAgents = JSON.parse(JSON.stringify(controlRaw)) as any[];
                controlAgents.forEach(a => a.comparativeGroup = 'Control');
                
                const optAgents = JSON.parse(JSON.stringify(optRaw)) as any[];
                optAgents.forEach(a => {
                    a.comparativeGroup = 'Intervention';
                    // Inject the pending protocol directly 
                    if (pendingProtocol.impact?.newMeds) {
                        pendingProtocol.impact.newMeds.forEach((m: string) => {
                            if (!a.medications.includes(m)) a.medications.push(m);
                        });
                    }
                    if (pendingProtocol.id) {
                        if (!a.memory.includes(pendingProtocol.id)) a.memory.push(pendingProtocol.id);
                    }
                });

                const allAgents = [...controlAgents, ...optAgents];
                const trialEngine = new SimulationEngine(allAgents);

                // Run fast forwarding
                const totalTicks = simYears * 52;
                for (let i = 0; i < totalTicks; i++) {
                    trialEngine.tick();
                }

                // Gather stats
                const states = trialEngine.getAgents();
                const outControls = states.filter(s => s.comparativeGroup === 'Control');
                const outOpts = states.filter(s => s.comparativeGroup === 'Intervention');

                const cAge = outControls.reduce((sum, a) => sum + Math.max(a.age, a.history[a.history.length-1]?.tick/52 || 0), 0) / outControls.length;
                const oAge = outOpts.reduce((sum, a) => sum + Math.max(a.age, a.history[a.history.length-1]?.tick/52 || 0), 0) / outOpts.length;
                
                const cSurv = outControls.filter(c => !c.isDead).length / outControls.length;
                const oSurv = outOpts.filter(c => !c.isDead).length / outOpts.length;

                // Build chart data
                const compileData = (agents: AgentState[]) => {
                    type DataMapEntry = { tick: number; age: number; cH: number[]; oH: number[]; cS: number[]; oS: number[]; cBP: number[]; oBP: number[]; cA1c: number[]; oA1c: number[] };
                    const dataMap = new Map<number, DataMapEntry>();
                    
                    agents.forEach(agent => {
                       const isControl = agent.comparativeGroup === 'Control';
                       agent.biometricHistory.forEach(snap => {
                           if (!dataMap.has(snap.tick)) {
                               dataMap.set(snap.tick, { tick: snap.tick, age: snap.age, cH: [], oH: [], cS: [], oS: [], cBP: [], oBP: [], cA1c: [], oA1c: [] });
                           }
                           const entry = dataMap.get(snap.tick)!;
                           if (isControl) {
                               entry.cH.push(snap.health);
                               entry.cS.push(snap.stress);
                               entry.cBP.push(snap.bpSystolic);
                               entry.cA1c.push(snap.a1c);
                           } else {
                               entry.oH.push(snap.health);
                               entry.oS.push(snap.stress);
                               entry.oBP.push(snap.bpSystolic);
                               entry.oA1c.push(snap.a1c);
                           }
                       });
                    });

                    return Array.from(dataMap.values()).sort((a,b) => a.tick - b.tick).map(entry => {
                        const getStats = (arr: number[]) => {
                            if (arr.length === 0) return { mean: null, range: null };
                            const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
                            return { mean, range: [Math.min(...arr), Math.max(...arr)] };
                        };
                        const cH = getStats(entry.cH); const oH = getStats(entry.oH);
                        return {
                            age: entry.age, tick: entry.tick,
                            cSurv: Number(((entry.cH.length / (cohortSize/2)) * 100).toFixed(1)),
                            oSurv: Number(((entry.oH.length / (cohortSize/2)) * 100).toFixed(1)),
                            cH_mean: cH.mean ? Math.round(cH.mean) : null,
                            oH_mean: oH.mean ? Math.round(oH.mean) : null,
                        };
                    });
                };

                setResults({
                    controlAvgAge: cAge, optAvgAge: oAge,
                    controlSurv: cSurv, optSurv: oSurv,
                    dataMap: compileData(states)
                });
            } catch (e) {
                console.error("Trial failure", e);
            } finally {
                setIsRunning(false);
            }
        }, 100);
    };

    const handlePublish = () => {
        const template: IdeaTemplate = {
            id: pendingProtocol.id || `C-TRIAL-${Date.now()}`,
            source: pendingProtocol.source || 'Clinical Simulation',
            type: pendingProtocol.type || 'Clinical',
            title: pendingProtocol.title || pendingProtocol.intervention,
            impact: pendingProtocol.impact || { healthDelta: 0, stressDelta: 0, bpDelta: 0, a1cDelta: 0, cvDelta: 0, egfrDelta: 0 },
            targetConditions: pendingProtocol.targetConditions || []
        };
        onValidate(template);
    };

    return (
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '2rem', borderRadius: '12px', border: '1px solid #3b82f6', marginTop: '2rem' }}>
            <h3 style={{ color: '#60a5fa', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span>🧪</span> In-Silico Trial Sandbox
            </h3>
            
            <p style={{ color: '#e2e8f0', fontSize: '1.1rem' }}>
                <strong>Pending Protocol:</strong> {pendingProtocol.title || pendingProtocol.intervention}
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Before promoting this extracted literature finding to the Global Protocol Matrix, you must validate its efficacy. 
                We will now run a rigorous A/B Test against {cohortSize} digital twins over {simYears} years.
            </p>

            {!results ? (
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={runTrial}
                        disabled={isRunning}
                        style={{ background: isRunning ? '#64748b' : '#3b82f6', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: isRunning ? 'wait' : 'pointer' }}
                    >
                        {isRunning ? 'Processing Multiverse Simulations...' : 'Launch A/B Trial Analysis'}
                    </button>
                    <button 
                        onClick={onCancel}
                        disabled={isRunning}
                        style={{ background: 'transparent', color: '#f87171', border: '1px solid #f87171', padding: '0.8rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: isRunning ? 'wait' : 'pointer' }}
                    >
                        Discard Theory
                    </button>
                </div>
            ) : (
                <div className="fade-in">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                            <h4 style={{ color: '#fca5a5', margin: '0 0 0.5rem 0' }}>Control Cohort</h4>
                            <div style={{ fontSize: '1.2rem', color: 'white' }}>Survival Rate: <strong>{(results.controlSurv*100).toFixed(1)}%</strong></div>
                            <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Est. Lifespan: {results.controlAvgAge.toFixed(1)} Yrs</div>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                            <h4 style={{ color: '#34d399', margin: '0 0 0.5rem 0' }}>Intervention Cohort</h4>
                            <div style={{ fontSize: '1.2rem', color: 'white' }}>Survival Rate: <strong>{(results.optSurv*100).toFixed(1)}%</strong></div>
                            <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Est. Lifespan: {results.optAvgAge.toFixed(1)} Yrs</div>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: 400, background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
                        <SurvivalComposedChart chartMode="Survival" data={results.dataMap} />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            onClick={handlePublish}
                            style={{ background: '#10b981', color: 'white', padding: '1rem 2rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
                        >
                            Publish to Global Knowledge Network
                        </button>
                        <button 
                            onClick={onCancel}
                            style={{ background: 'transparent', color: '#94a3b8', border: '1px solid #64748b', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Discard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
