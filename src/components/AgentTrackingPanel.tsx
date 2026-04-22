import { useState, useEffect, type FC } from 'react';
import { AgentApi, type AgentRunState } from '../services/AgentApi';
import toast from 'react-hot-toast';
import { KnowledgeBase } from '../simulation/KnowledgeNetwork';

export const AgentTrackingPanel: FC = () => {
    const [query, setQuery] = useState('');
    const [isPolling, setIsPolling] = useState(false);
    const [currentRun, setCurrentRun] = useState<AgentRunState | null>(null);
    const [parsedReport, setParsedReport] = useState<{ markdown_summary: string, math_engine_deltas: any } | null>(null);

    const [agents, setAgents] = useState<any[]>([]);
    const [skills, setSkills] = useState<any[]>([]);
    const [selectedInfo, setSelectedInfo] = useState<{name: string, description: string} | null>(null);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/agents')
            .then(res => res.json())
            .then(data => setAgents(data))
            .catch(e => console.error(e));
            
        fetch('http://127.0.0.1:8000/api/skills')
            .then(res => res.json())
            .then(data => setSkills(data))
            .catch(e => console.error(e));
    }, []);

    const handleRunAgent = async () => {
        if (!query.trim()) return;
        setIsPolling(true);
        setParsedReport(null);
        setCurrentRun(null);
        toast.loading("Deploying Agent to Clinical Hub...", { id: 'agent-run' });

        try {
            const initialRunStatus = await AgentApi.startRun(query);
            setCurrentRun(initialRunStatus);
            
            // Begin Long-Polling
            toast.loading("GraphRAG Node Traversal Active...", { id: 'agent-run' });
            const finalRun = await AgentApi.pollUntilComplete(initialRunStatus.id, (status) => {
                if (status === 'running') {
                    // Update toast if we had real-time node streaming, here we just show 'running'
                }
            });

            setCurrentRun(finalRun);

            if (finalRun.status === 'failed') {
                toast.error("Agent Pipeline Failed.", { id: 'agent-run' });
            } else if (finalRun.result_synthesis) {
                toast.success("Agent Orchestration Complete!", { id: 'agent-run' });
                
                try {
                    const parsed = JSON.parse(finalRun.result_synthesis);
                    setParsedReport(parsed);
                } catch (pe) {
                    console.error("Agent returned unparseable JSON", finalRun.result_synthesis);
                    toast.error("Failed to parse Agent output schema.");
                }
            }

        } catch (e) {
            console.error(e);
            toast.error("Could not communicate with Clinical Agents Hub.");
        } finally {
            setIsPolling(false);
        }
    };
    
    // Auto-inject JSON math deltas to the network when successful
    const injectToNetwork = () => {
        if (!parsedReport?.math_engine_deltas) return;
        
        try {
            const dt = parsedReport.math_engine_deltas;
            const template = {
                id: `agent_${Date.now()}`,
                source: dt.source || 'PubMed Agent Hub',
                type: 'Clinical' as const,
                title: dt.title || 'Agent Synthesis',
                impact: {
                    healthDelta: dt.impact?.healthDelta || 0,
                    stressDelta: dt.impact?.stressDelta || 0,
                    bpDelta: dt.impact?.bpDelta || 0,
                    a1cDelta: dt.impact?.a1cDelta || 0,
                    cvDelta: dt.impact?.cvDelta || 0,
                    egfrDelta: dt.impact?.egfrDelta || 0,
                    newMeds: [],
                    description: dt.findings || 'Extracted automatically by centralized Agent Hub.'
                }
            };
            
            // Mock an author
            const systemAuthor = { id: 'system_agent', state: { role: 'Researcher' } } as any;
            KnowledgeBase.broadcast(systemAuthor, template, Date.now());
            toast.success("Extracted math injected to Medical Twins simulation natively!");
        } catch(e) {
            toast.error("Failed injecting to Twin Network.");
        }
    };

    return (
        <div style={{ padding: '2rem', animation: 'fadeIn 0.5s ease-out', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ color: '#c084fc', margin: '0 0 0.5rem 0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span>🧠</span> GraphRAG Analytical Engine
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>
                    A direct pipeline to our Fast-API Microservice. Dispatch agents to visually cross-reference the Deep Knowledge Ontology and synthesize complex mathematical hazard mappings autonomously into the localized biological simulation engine.
                </p>
            </div>

            {selectedInfo && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setSelectedInfo(null)}>
                    <div className="glass-panel" style={{ padding: '2rem', maxWidth: '500px', width: '90%', borderTop: '4px solid #c084fc', animation: 'fadeIn 0.2s ease-out' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ color: '#f8fafc', marginBottom: '1rem', fontSize: '1.4rem' }}>{selectedInfo.name}</h3>
                        <p style={{ color: '#e2e8f0', lineHeight: 1.6, marginBottom: '1.5rem' }}>{selectedInfo.description}</p>
                        <button onClick={() => setSelectedInfo(null)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Close</button>
                    </div>
                </div>
            )}

            {(agents.length > 0 || skills.length > 0) && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid #c084fc' }}>
                        <h3 style={{ color: '#e2e8f0', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🤖 Enrolled Agents</h3>
                        {agents.map((a: any) => (
                            <div key={a.id} style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <strong style={{ color: '#e2e8f0', fontSize: '1.1rem' }}>{a.name}</strong>
                                    <span style={{ fontSize: '0.75rem', background: a.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)', color: a.status === 'Active' ? '#10b981' : '#fbbf24', padding: '2px 8px', borderRadius: '12px' }}>{a.status}</span>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0', lineHeight: 1.5 }}>{a.description}</p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {a.skills?.map((s: any) => (
                                        <span key={s.id} onClick={() => setSelectedInfo({ name: s.name, description: s.description })} style={{ fontSize: '0.7rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}>{s.name}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', borderTop: '4px solid #3b82f6' }}>
                        <h3 style={{ color: '#e2e8f0', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🛠️ Global Skills Archive</h3>
                        {skills.map((s: any) => (
                            <div key={s.id} style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong style={{ color: '#60a5fa' }}>{s.name}</strong>
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>v{s.version}</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0', lineHeight: 1.4 }}>{s.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <input 
                    type="text" 
                    placeholder="Enter sophisticated inquiry (e.g. Compare CAR-T off-label uses to GLP-1 cardiovascular outcomes)..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '6px', width: '100%', fontSize: '1.1rem' }}
                    disabled={isPolling}
                />
                <button 
                    onClick={handleRunAgent}
                    disabled={isPolling || !query.trim()}
                    style={{ 
                        background: isPolling ? 'rgba(0,0,0,0.5)' : 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)', 
                        color: 'white', 
                        border: 'none', 
                        padding: '1rem 1.5rem', 
                        borderRadius: '6px', 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        cursor: isPolling || !query.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {isPolling ? <span style={{ animation: 'spin 1s linear infinite' }}>⚙️</span> : <span>🚀</span>}
                    {isPolling ? 'Synthesizing Traversed Knowledge Ontology...' : 'Dispatch GraphRAG Synthesis Agent'}
                </button>
            </div>

            {/* Pipeline State Display */}
            {currentRun && (
                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', borderLeft: '4px solid #a855f7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Job ID: {currentRun.id}</div>
                            <div style={{ color: '#e2e8f0', fontWeight: 'bold' }}>Pipeline Status</div>
                        </div>
                        <div style={{
                            padding: '0.4rem 1rem',
                            borderRadius: '20px',
                            fontWeight: 'bold',
                            backgroundColor: currentRun.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 
                                           currentRun.status === 'failed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(192, 132, 252, 0.15)',
                            color: currentRun.status === 'completed' ? '#10b981' : 
                                   currentRun.status === 'failed' ? '#ef4444' : '#c084fc'
                        }}>
                            {currentRun.status.toUpperCase()}
                        </div>
                    </div>
                </div>
            )}

            {/* Markdown Summary from Agent */}
            {parsedReport && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'slideIn 0.4s ease-out' }}>
                    
                    <div className="glass-panel" style={{ padding: '2rem', borderTop: '4px solid #3b82f6' }}>
                        <h3 style={{ margin: '0 0 1rem 0', color: '#60a5fa' }}>Human-Readable Narrative</h3>
                        <div style={{ color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {parsedReport.markdown_summary}
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem', borderTop: '4px solid #10b981' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: '#34d399' }}>Deterministic Math Extraction</h3>
                            <button 
                                onClick={injectToNetwork}
                                style={{ background: '#059669', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Inject to Network
                            </button>
                        </div>
                        <pre style={{ 
                            background: 'rgba(0,0,0,0.4)', 
                            padding: '1rem', 
                            borderRadius: '8px', 
                            color: '#a7f3d0',
                            overflowX: 'auto',
                            fontSize: '0.9rem'
                        }}>
                            {JSON.stringify(parsedReport.math_engine_deltas, null, 2)}
                        </pre>
                    </div>

                </div>
            )}
        </div>
    );
};
