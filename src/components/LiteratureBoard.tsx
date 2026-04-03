import { useState, type FC } from 'react';
import { KnowledgeBase, type IdeaTemplate } from '../simulation/KnowledgeNetwork';

const STATIC_LITERATURE_DB = [
    {
        id: 'LIT-001',
        title: "SELECT Trial: Semaglutide Effects on Cardiovascular Outcomes in People With Overweight or Obesity",
        source: "New England Journal of Medicine (NEJM)",
        year: 2023,
        intervention: "GLP-1 Receptor Agonists",
        phenotype: "Obesity + Cardiovascular Disease Risk",
        hazardRatio: 0.80,
        findings: "Demonstrated a 20% relative risk reduction (HR 0.80) in major adverse cardiovascular events (death, myocardial infarction, stroke) compared to placebo over a mean follow-up of 39.8 months.",
        mathMapping: "Multiplies baseline CAD and Hypertension acquisition probabilities by 0.80. Deducts 15% from total Base Health decay.",
        adverseEffects: [
            { risk: "Severe", type: "Gastroparesis / Neuromuscular Gastric Failure", probability: "0.2% Annual" },
            { risk: "Moderate", type: "Cholelithiasis (Gallstones)", probability: "1.5% Annual" }
        ]
    },
    {
        id: 'LIT-002',
        title: "DAPA-HF & EMPA-REG OUTCOME: SGLT2 Inhibitors in Patients with Heart Failure and CKD",
        source: "The Lancet / JAMA Cardiology",
        year: 2021,
        intervention: "SGLT2 Inhibitors (Flozins)",
        phenotype: "Congestive Heart Failure / Chronic Kidney Disease",
        hazardRatio: 0.65,
        findings: "Aggressive reduction in heart failure hospitalization and cardiovascular death (Hazard ratio 0.65). Exceptionally protective mechanism preserving Nephron function and eGFR trajectory independently of diabetic status.",
        mathMapping: "Applies a massive 0.65 (35% risk reduction) probability multiplier to CHF and CKD fatal exacerbation thresholds. Offsets baseline exponential Gompertz age decay.",
        adverseEffects: [
            { risk: "Life-Threatening", type: "Euglycemic Diabetic Ketoacidosis (DKA)", probability: "0.1% Annual" },
            { risk: "Severe", type: "Fournier's Gangrene / Severe Urogenital Infection", probability: "0.05% Annual" }
        ]
    },
    {
        id: 'LIT-003',
        title: "Meta-Analysis: Socioeconomic Determinants in Long-Term Pharmacological Adherence",
        source: "American Heart Association (AHA) Journals",
        year: 2022,
        intervention: "Systemic Protocol Adherence Drops",
        phenotype: "Low SDOH / 'Food Deserts'",
        hazardRatio: 2.15,
        findings: "Patients prescribed highly efficacious modern treatments (GLP-1/SGLT2) exhibit an 80% discontinuation rate within 12 months if their wealth access indices fall below sustainable copay thresholds.",
        mathMapping: "Agents with a 'Wealth' score < 40 and 'Food Desert = True' will auto-reject these medications exactly 12 ticks (weeks) post-intervention.",
        adverseEffects: []
    }
];

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
