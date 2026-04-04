import { useState, type FC } from 'react';
import { KnowledgeBase, type IdeaTemplate } from '../simulation/KnowledgeNetwork';

import { STATIC_LITERATURE_DB } from '../data/ClinicalLiteratureDB';

export const LiteratureBoard: FC = () => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString());
    const [literatureDB, setLiteratureDB] = useState<any[]>(STATIC_LITERATURE_DB);
    const [errorMsg, setErrorMsg] = useState('');

    const handleRefresh = async () => {
        setIsRefreshing(true);
        setErrorMsg('');
        
        try {
            const response = await fetch('http://127.0.0.1:8000/harvest_literature');
            const newTrial = await response.json();
            
            if (newTrial.id) {
                // Dynamically prepend the new live literature object to the render stack
                setLiteratureDB(prev => [newTrial, ...prev]);
                setLastSync(new Date().toLocaleTimeString());
                
                // INJECT INTO BIOLOGICAL SIMULATOR
                const parsedProtocol: IdeaTemplate = {
                    id: newTrial.id,
                    source: 'PubMed',
                    type: 'Clinical',
                    title: newTrial.intervention,
                    impact: newTrial.impact,
                    targetConditions: newTrial.targetConditions
                };
                KnowledgeBase.CLINICAL_IDEAS.push(parsedProtocol);
                
            } else {
                setErrorMsg('Parsed invalid schema from PubMed E-utilities.');
            }
        } catch (e) {
            console.error("Backend Harvest Error:", e);
            setErrorMsg('FastAPI Python backend offline. Could not contact NCBI.');
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div style={{ padding: '2rem', animation: 'fadeIn 0.5s ease-out', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ color: '#60a5fa', margin: '0 0 0.5rem 0', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <span>📚</span> Empirical Literature Matrix
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0, maxWidth: '800px' }}>
                        The Medical Digital Twins Engine anchors its predictive hazard models exclusively to major ground-truth medical trials published within the last 10 years.
                    </p>
                </div>
                
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '220px' }}>
                    <div style={{ color: '#93c5fd', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Next PubMed Cycle Sync</div>
                    <button 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        style={{ 
                            background: isRefreshing ? 'rgba(0,0,0,0.5)' : '#3b82f6', 
                            color: 'white', 
                            border: 'none', 
                            padding: '0.6rem 1.2rem', 
                            borderRadius: '6px', 
                            fontWeight: 'bold', 
                            cursor: isRefreshing ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {isRefreshing ? <span style={{ animation: 'spin 1s linear infinite' }}>🔄</span> : <span>🔄</span>}
                        {isRefreshing ? 'Crawling Repositories...' : 'Force Sync Literature'}
                    </button>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Last validated: {lastSync}</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {errorMsg && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#fca5a5', padding: '1rem', borderRadius: '8px' }}>
                        ⚠️ {errorMsg}
                    </div>
                )}
                {literatureDB.map((lit) => (
                    <div key={lit.id} className="glass-panel" style={{ padding: '2rem', borderLeft: '4px solid #3b82f6', display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'slideIn 0.4s ease-out' }}>
                        
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.3rem', maxWidth: '800px' }}>{lit.title}</h3>
                                <div style={{ background: 'rgba(244, 114, 182, 0.15)', color: '#f472b6', padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem', border: '1px solid rgba(244, 114, 182, 0.3)' }}>
                                    HR: {lit.hazardRatio}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                <span><strong>Source:</strong> {lit.source}</span>
                                <span>|</span>
                                <span><strong>Published:</strong> {lit.year}</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px' }}>
                                <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clinical Findings</div>
                                <p style={{ margin: 0, color: '#e2e8f0', lineHeight: 1.6 }}>{lit.findings}</p>
                            </div>
                            
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                <div style={{ color: '#60a5fa', fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mathematical Implementation</div>
                                <p style={{ margin: 0, color: '#e2e8f0', lineHeight: 1.6 }}>{lit.mathMapping}</p>
                            </div>
                        </div>

                        {lit.adverseEffects.length > 0 && (
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                                <div style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '1rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '1.2rem' }}>⚠️</span> Modeled Adverse Hazards
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                    {lit.adverseEffects.map((ae: any, i: number) => (
                                        <div key={i} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px dashed rgba(239, 68, 68, 0.4)', padding: '0.8rem 1.2rem', borderRadius: '6px', flex: '1 1 250px' }}>
                                            <div style={{ color: '#fca5a5', fontWeight: 'bold', marginBottom: '0.3rem' }}>{ae.type}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Severity: <span style={{ color: '#e2e8f0' }}>{ae.risk}</span></span>
                                                <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{ae.probability}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                ))}
            </div>
        </div>
    );
};
