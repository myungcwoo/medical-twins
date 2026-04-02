import { useState } from 'react';
import type { FC } from 'react';
import { TrainingEngine, type RawClaim, type RawLab } from '../simulation/TrainingEngine';

export const TrainingDashboard: FC = () => {
  const [modelWeights, setModelWeights] = useState<any>(TrainingEngine.currentTrainedModel);
  const [ingestionLog, setIngestionLog] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [claimsData, setClaimsData] = useState<RawClaim[]>([]);
  const [labsData, setLabsData] = useState<RawLab[]>([]);

  const handleClaimsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIngestionLog(prev => [`[${new Date().toLocaleTimeString()}] Parsing native Claims payload: ${file.name}...`, ...prev]);
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const raw = JSON.parse(event.target?.result as string);
            setClaimsData(raw);
            setIngestionLog(prev => [`[${new Date().toLocaleTimeString()}] Successfully mapped ${raw.length} discrete historical claim events into buffer memory.`, ...prev]);
        } catch (error: any) {
            setIngestionLog(prev => [`[${new Date().toLocaleTimeString()}] ERR: Failed to parse structural Claims JSON.`, ...prev]);
        }
    };
    reader.readAsText(file);
  };

  const handleLabsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIngestionLog(prev => [`[${new Date().toLocaleTimeString()}] Parsing native Laboratory payload: ${file.name}...`, ...prev]);
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const raw = JSON.parse(event.target?.result as string);
            setLabsData(raw);
            setIngestionLog(prev => [`[${new Date().toLocaleTimeString()}] Successfully mapped ${raw.length} discrete chronological laboratory test streams into buffer memory.`, ...prev]);
        } catch (error: any) {
            setIngestionLog(prev => [`[${new Date().toLocaleTimeString()}] ERR: Failed to parse structural Labs JSON.`, ...prev]);
        }
    };
    reader.readAsText(file);
  };

  const handleExecuteETL = () => {
      if (claimsData.length === 0) {
          setIngestionLog(prev => [`[${new Date().toLocaleTimeString()}] ERR: Cannot execute ETL. No Medical Claims uploaded to establish baseline chronologies.`, ...prev]);
          return;
      }

      setIsTraining(true);
      setIngestionLog(prev => [`[${new Date().toLocaleTimeString()}] Initiating master Client-Side ETL pipeline across ${claimsData.length + labsData.length} total event vectors...`, ...prev]);
      
      setTimeout(() => {
        try {
            setIngestionLog(prev => [`[${new Date().toLocaleTimeString()}] Sifting vectors chronologically & cross-mapping disjointed datasets via universal PatientID hooks...`, ...prev]);
            const updatedWeights = TrainingEngine.processDisparateData(claimsData, labsData);
            
            setTimeout(() => {
                setModelWeights(updatedWeights);
                setIngestionLog(prev => [`[${new Date().toLocaleTimeString()}] Empirical Hazard Normalization fully complete. Target Physics Model overwritten successfully.`, ...prev]);
                setIsTraining(false);
            }, 600);
        } catch (err: any) {
            setIngestionLog(prev => [`[${new Date().toLocaleTimeString()}] FATAL ETL CRASH: ${err.message}`, ...prev]);
            setIsTraining(false);
        }
      }, 500);
  };

  const handleExportModel = () => {
      const payload = JSON.stringify(modelWeights, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medical_twins_empiric_model.json`;
      a.click();
      URL.revokeObjectURL(url);
  };

  const handleClearModel = () => {
    if (window.confirm("Are you sure you want to completely erase the empirical weights? The agents will revert fully to standard CDC probabilistic baselines.")) {
        TrainingEngine.wipeModel();
        setModelWeights({});
        setClaimsData([]);
        setLabsData([]);
        setIngestionLog(prev => [`[${new Date().toLocaleTimeString()}] Trained weights securely wiped. Reverting to base literature physics.`, ...prev]);
    }
  };

  // Developer Mock Generator (Shorthand to bypass manual file builds for demonstrations)
  const injectMockClusters = () => {
      setIngestionLog(prev => [`[${new Date().toLocaleTimeString()}] Fetching mock remote repository files automatically...`, ...prev]);
      const mockClaims: RawClaim[] = [];
      for (let i = 0; i < 500; i++) {
          const pID = crypto.randomUUID();
          const baseTime = Date.now() - (1000 * 60 * 60 * 24 * 365 * 5); // 5 Years ago
          
          mockClaims.push({ patientId: pID, date: new Date(baseTime).toISOString(), icd10: ['E66.01'], ndc: [] }); // Obesity at baseline
          mockClaims.push({ patientId: pID, date: new Date(baseTime + (1000 * 60 * 60 * 24 * 10)).toISOString(), icd10: ['E66.01'], ndc: [] }); // Confirmed baseline
          
          if (Math.random() > 0.4) {
              const htnTime = baseTime + (1000 * 60 * 60 * 24 * 365 * 1.5); // 1.5 Years later acquired
              mockClaims.push({ patientId: pID, date: new Date(htnTime).toISOString(), icd10: ['I10'], ndc: [] });
              mockClaims.push({ patientId: pID, date: new Date(htnTime + (1000 * 60 * 60 * 24 * 30)).toISOString(), icd10: ['I10'], ndc: [] }); // Confirmed acquired
          }

          if (Math.random() > 0.8) {
              const demTime = baseTime + (1000 * 60 * 60 * 24 * 365 * 4); // 4 Years later acquired Dementia
              mockClaims.push({ patientId: pID, date: new Date(demTime).toISOString(), icd10: ['F03.90'], ndc: [] });
              mockClaims.push({ patientId: pID, date: new Date(demTime + (1000 * 60 * 60 * 24 * 30)).toISOString(), icd10: ['F03.90'], ndc: [] }); // Confirmed acquired
          }
      }
      setClaimsData(mockClaims);
      setIngestionLog(prev => [`[${new Date().toLocaleTimeString()}] Remote Mock Clinical File Stream explicitly mounted into Buffer Array.`, ...prev]);
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out', overflowY: 'auto', maxHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(245, 158, 11, 0.3)', paddingBottom: '1rem' }}>
        <div style={{ flex: '1 1 500px' }}>
            <h2 style={{ color: '#f59e0b', margin: '0 0 0.5rem 0' }}>Longitudinal RWD ETL Pipeline</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>Train the Agent-Based Model systematically using scattered Medical Claims and Pharmacy structures. The Engine natively weaves them together utilizing disjointed identical Patient Hooks.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
            <button 
                onClick={handleExportModel}
                style={{ background: '#10b981', color: 'white', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                Export Model (.JSON)
            </button>
            <button 
                onClick={handleClearModel}
                style={{ background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                Wipe Local Database
            </button>
        </div>
      </div>

      <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem', color: '#fcd34d' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span role="img" aria-label="code">💻</span> Component Uploads (Disorganized Schemas)
                </h3>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#fde68a', lineHeight: 1.5 }}>
                    Inject your standalone raw datasets. The mathematical ETL Engine implicitly sorts, weeds out disjointed single diagnostic anomalies (rule-outs), and confirms condition acquisition purely through verified repetition across strictly separate chronologies.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ background: 'rgba(0,0,0,0.4)', color: '#60a5fa', padding: '0.6rem 1rem', borderRadius: '4px', fontWeight: 'bold', border: '1px solid rgba(96, 165, 250, 0.4)', cursor: 'pointer', fontSize: '0.9rem' }}>
                        📥 Inject Medical Claims
                        <input type="file" accept=".json" onChange={handleClaimsUpload} style={{ display: 'none' }} />
                    </label>
                    <label style={{ background: 'rgba(0,0,0,0.4)', color: '#34d399', padding: '0.6rem 1rem', borderRadius: '4px', fontWeight: 'bold', border: '1px solid rgba(52, 211, 153, 0.4)', cursor: 'pointer', fontSize: '0.9rem' }}>
                        🧪 Inject Raw Labs (LOINC)
                        <input type="file" accept=".json" onChange={handleLabsUpload} style={{ display: 'none' }} />
                    </label>
                    <button onClick={injectMockClusters} style={{ background: 'transparent', color: '#a78bfa', padding: '0.6rem 1rem', borderRadius: '4px', fontWeight: 'bold', border: '1px solid rgba(167, 139, 250, 0.4)', cursor: 'pointer', fontSize: '0.9rem' }}>
                        Generate Mock Data Bundle
                    </button>
                </div>
            </div>
            
            <div style={{ width: '300px', background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Claims Array Buffer:</span>
                    <strong style={{ color: claimsData.length > 0 ? '#60a5fa' : 'inherit' }}>{claimsData.length} records</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Labs Array Buffer:</span>
                    <strong style={{ color: labsData.length > 0 ? '#34d399' : 'inherit' }}>{labsData.length} records</strong>
                </div>
                <button 
                  onClick={handleExecuteETL}
                  disabled={isTraining || claimsData.length === 0}
                  style={{ width: '100%', padding: '0.8rem', background: isTraining ? '#4b5563' : '#f59e0b', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: (isTraining || claimsData.length === 0) ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                  {isTraining ? 'Executing Cross-Map...' : 'Compile & Weave RWD Timelines'}
                </button>
            </div>
          </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
          
          <div>
            <h3 style={{ marginTop: 0, color: '#e2e8f0' }}>Current Empirical Physics Model</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>These parameters actively override standard literature natively inside the ABM Pathfinder engine.</p>
            
            {Object.keys(modelWeights).length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '3rem', textAlign: 'center', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)', color: 'var(--text-muted)' }}>
                    No Empirical Data Injected. Active Simulation is strictly executing raw theoretical CDC/AHA Literature models.
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {Object.values(modelWeights).map((weight: any) => (
                        <div key={weight.condition} style={{ background: 'rgba(0,0,0,0.3)', padding: '1.2rem', borderRadius: '8px', borderLeft: `4px solid ${weight.hazardDifferential > 1 ? '#ef4444' : '#10b981'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f8fafc', marginBottom: '0.3rem' }}>{weight.condition}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Analyzed directly across {weight.sourcePopulation} total at-risk synthetic patient timelines ({weight.totalExposureYears.toFixed(1)} cumulative years).</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: weight.hazardDifferential > 1 ? '#fca5a5' : '#60a5fa' }}>
                                    {(weight.observedIncidenceRate * 100).toFixed(2)}% <span style={{fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)'}}>Annual Risk</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                                    CDC Lit: {(weight.cdcBaseline * 100).toFixed(2)}% | <span style={{ color: weight.hazardDifferential > 1 ? '#fca5a5' : '#34d399' }}>Δ {weight.hazardDifferential.toFixed(2)}x</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          <div>
              <h3 style={{ marginTop: 0, color: '#e2e8f0' }}>Data Weaving Terminal</h3>
              <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', height: '400px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.85rem', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  {ingestionLog.length === 0 ? (
                      <span style={{ color: '#059669' }}>&gt; Awaiting disjointed dataset injections into the Buffer Array...</span>
                  ) : (
                      ingestionLog.map((log, i) => (
                          <div key={i} style={{ marginBottom: '0.5rem' }}>&gt; {log}</div>
                      ))
                  )}
              </div>
          </div>

      </div>
    </div>
  );
};
