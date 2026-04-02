import { useState, useEffect, useRef } from 'react';
import { SimulationEngine } from './simulation/Engine';
import { initialAgents } from './simulation/InitialData';
import type { AgentState } from './simulation/Agent';
import { KnowledgeBase } from './simulation/KnowledgeNetwork';
import { Explanation } from './components/Explanation';
import { TimelineView } from './components/TimelineView';
import { IngestionView } from './components/IngestionView';
import { NetworkFeed } from './components/NetworkFeed';
import { DashboardView } from './components/DashboardView';
import { SimulationReport } from './components/SimulationReport';
import { CustomTwinDashboard } from './components/CustomTwinDashboard';
import { TrainingDashboard } from './components/TrainingDashboard';
import { BackendTrainer } from './components/BackendTrainer';
import { ConsumerWizard } from './components/ConsumerWizard';
import heroBg from './assets/hero_bg.png';

// Helpers extracted to DashboardView component

function App() {
  const engineRef = useRef<SimulationEngine | null>(null);
  const customEngineRef = useRef<SimulationEngine | null>(null);

  const [agents, setAgents] = useState<AgentState[]>([]);
  const [customTwins, setCustomTwins] = useState<AgentState[]>([]);
  const [ticks, setTicks] = useState(0);
  const [customTicks, setCustomTicks] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCustomRunning, setIsCustomRunning] = useState(false);
  const [isCustomEnded, setIsCustomEnded] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timeline' | 'explanation' | 'ingestion' | 'network' | 'report' | 'custom-trial' | 'training' | 'backend-train' | 'consumer-wizard'>('dashboard');
  const [selectedId, setSelectedId] = useState<string>('');
  
  // Fast Forward State
  const [fastForwardYears, setFastForwardYears] = useState<number>(5);
  const [autoResume, setAutoResume] = useState<boolean>(true);
  const [isFastForwarding, setIsFastForwarding] = useState<boolean>(false);
  const [isCustomFastForwarding, setIsCustomFastForwarding] = useState<boolean>(false);

  useEffect(() => {
    engineRef.current = new SimulationEngine(initialAgents);
    setAgents(engineRef.current.getAgents());

    // Force strict Vite hot-reloading for the Nano Banana background
    document.body.style.backgroundImage = `url(${heroBg})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning || isCustomRunning) {
      interval = window.setInterval(() => {
        if (isRunning && engineRef.current) {
          engineRef.current.tick();
          
          // --- PYTORCH LIVE CLINICAL HARVESTER HOOK ---
          // Every 52 weeks (1 Year), explicitly attempt to scrape Live Research
          if (engineRef.current.currentTick > 0 && engineRef.current.currentTick % 52 === 0) {
              fetch('http://localhost:8000/harvest_literature')
                .then(res => res.json())
                .then(data => {
                    if (data && data.title) {
                        const doctors = engineRef.current!.agents.filter((a: any) => a.state.role === 'Physician' && !a.state.isDead);
                        if (doctors.length > 0) {
                             const author = doctors[Math.floor(Math.random() * doctors.length)];
                             KnowledgeBase.broadcast(author, data as any, engineRef.current!.currentTick);
                        }
                    }
                })
                .catch(err => console.error("Background PubMed Harvester disconnected:", err));
          }

          setAgents([...engineRef.current.getAgents()]);
          setTicks(engineRef.current.currentTick);
        }
        if (isCustomRunning && customEngineRef.current) {
          customEngineRef.current.tick();
          setCustomTwins([...customEngineRef.current.getAgents()]);
          setCustomTicks(customEngineRef.current.currentTick);
        }
      }, 500);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, isCustomRunning]);

  const handleStartCustomTrial = (rawPayload: Omit<AgentState, 'history' | 'isDead' | 'biometricHistory'>, selectedProtocols: any[]) => {
    // --- Spawning Bifurcated Comparative Clones For Isolated Sandbox ---
    const allPayloads: Omit<AgentState, 'history' | 'isDead' | 'biometricHistory'>[] = [];
    const baseTwinParams = { ...rawPayload, memory: [] };

    // Inject 50 Control Clones and 50 Intervention Clones for mathematical statistically significant Area charts
    for (let c = 0; c < 50; c++) {
      allPayloads.push({
        ...baseTwinParams,
        id: crypto.randomUUID(),
        name: `${rawPayload.name} (Control ${c+1})`,
        comparativeGroup: 'Control'
      });
      
      allPayloads.push({
        ...baseTwinParams,
        id: crypto.randomUUID(),
        name: `${rawPayload.name} (Optimized ${c+1})`,
        comparativeGroup: 'Intervention'
      });
    }

    // Spin up an entirely secondary sandboxed instance for just these two cohorts
    customEngineRef.current = new SimulationEngine(allPayloads);
    
    // Force the chronological clock sequence strictly against the active time structure so charts align natively 
    if (engineRef.current) {
       customEngineRef.current.currentTick = engineRef.current.currentTick;
    }
    setCustomTicks(customEngineRef.current.currentTick);

    // Pre-emptively apply the explicitly selected protocols natively across ALL Intervention clones
    customEngineRef.current.agents.filter(a => a.state.comparativeGroup === 'Intervention').forEach(interventionAgent => {
      selectedProtocols.forEach((idea: any) => {
        interventionAgent.state.history.push({ 
          tick: customEngineRef.current!.currentTick, 
          type: 'Intervention', 
          description: `User Directed Optimization: Executed protocol checklist integration [${idea.title}].`,
          impactHealth: idea.impact.healthDelta || 0,
          impactStress: idea.impact.stressDelta || 0
        });
        
        interventionAgent.state.baseHealth += (idea.impact.healthDelta || 0);
        interventionAgent.state.stressLevel += (idea.impact.stressDelta || 0);
        interventionAgent.state.vitals.bpSystolic += (idea.impact.bpDelta || 0);
        interventionAgent.state.labs.a1c += (idea.impact.a1cDelta || 0);
        interventionAgent.state.labs.cvHealth += (idea.impact.cvDelta || 0);
        interventionAgent.state.labs.egfr += (idea.impact.egfrDelta || 0);
        
        idea.impact.newMeds?.forEach((med: string) => {
          if (!interventionAgent.state.medications.includes(med)) interventionAgent.state.medications.push(med);
        });
        if (!interventionAgent.state.memory.includes(idea.id)) {
            interventionAgent.state.memory.push(idea.id);
        }
      });
      // Safety bounds check
      interventionAgent.state.baseHealth = Math.min(100, interventionAgent.state.baseHealth);
    });

    setCustomTwins([...customEngineRef.current.getAgents()]);
    setIsCustomEnded(false);
    
    // Automatically pan the window down sequentially to expose the newly spawned Cohorts chart
    setTimeout(() => {
        const container = document.getElementById('wizard-scroll-container');
        const dash = document.getElementById('simulate-me-dashboard');
        if (container && dash) {
           container.scrollTo({ top: dash.offsetTop - 20, behavior: 'smooth' });
        }
    }, 150);
  };

  const handleFastForward = () => {
    if (!engineRef.current) return;
    
    setIsRunning(false);
    setIsCustomRunning(false);
    setIsFastForwarding(true);

    // Yield to the browser to render the "processing" state slightly
    setTimeout(() => {
      const ticksToAdvance = fastForwardYears * 52;
      
      for (let i = 0; i < ticksToAdvance; i++) {
        if (!engineRef.current) break;
        engineRef.current.tick();
        
        if (customEngineRef.current && !isCustomEnded) {
            customEngineRef.current.tick();
        }
      }

      if (engineRef.current) {
        setAgents([...engineRef.current.getAgents()]);
        setTicks(engineRef.current.currentTick);
      }

      if (customEngineRef.current) {
         setCustomTwins([...customEngineRef.current.getAgents()]);
         setCustomTicks(customEngineRef.current.currentTick);
      }

      setIsFastForwarding(false);

      if (autoResume) {
          if (activeTab === 'custom-trial' && customEngineRef.current && !isCustomEnded) {
              setIsCustomRunning(true);
          } else {
              setIsRunning(true);
          }
      }
    }, 50);
  };

  const handleCustomFastForward = (years: number) => {
    if (!customEngineRef.current || isCustomEnded) return;

    setIsCustomRunning(false);
    setIsCustomFastForwarding(true);

    setTimeout(() => {
      const ticksToAdvance = years * 52;
      
      for (let i = 0; i < ticksToAdvance; i++) {
        if (!customEngineRef.current || isCustomEnded) break;
        customEngineRef.current.tick();
      }

      if (customEngineRef.current) {
         setCustomTwins([...customEngineRef.current.getAgents()]);
         setCustomTicks(customEngineRef.current.currentTick);
      }

      setIsCustomFastForwarding(false);

      if (autoResume && !isCustomEnded) {
          setIsCustomRunning(true);
      }
    }, 50);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the entire Sandbox? All biological data arrays and Network feed protocols will be permanently wiped.")) {
      engineRef.current = new SimulationEngine(initialAgents);
      customEngineRef.current = null;
      KnowledgeBase.globalFeed = [];
      KnowledgeBase.broadcasts = [];
      KnowledgeBase.totalInteractions = 0;
      setAgents(engineRef.current.getAgents());
      setCustomTwins([]);
      setTicks(0);
      setIsEnded(false);
      setIsRunning(false);
      setIsCustomRunning(false);
      setIsCustomEnded(false);
      setActiveTab('dashboard');
    }
  };

  const handleSaveSimulation = () => {
    const payload = {
      simulationEndTick: ticks,
      totalNetworkInteractions: KnowledgeBase.totalInteractions,
      topOptimizedProtocols: KnowledgeBase.getTopValidatedProtocols(5),
      globalNetworkFeed: KnowledgeBase.globalFeed,
      agentPopulation: agents
    };
    
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical_twins_abm_export_week_${ticks}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard">
      <header className="header">
        <div className="title" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <img 
            src="/logo.png" 
            alt="Medical Twins Logo" 
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '12px', 
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)', 
              objectFit: 'cover' 
            }} 
          />
          <div>
            <h1>Digital Patient Simulation</h1>
            <p>Clinical AI Studio Pillar: Generative Agent-Based MLOps & Deep Learning Forecasts</p>
          </div>
        </div>
        
        <div className="nav-tabs">
          {isEnded && <button className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')} style={{ color: '#ef4444', fontWeight: 'bold' }}>Simulation Report</button>}
          <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')} style={{ color: '#3b82f6', fontWeight: 'bold' }}>⚡ Live Command Center</button>
          <button className={`tab-btn ${activeTab === 'consumer-wizard' ? 'active' : ''}`} onClick={() => setActiveTab('consumer-wizard')} style={{ color: '#f472b6', fontWeight: 'bold' }}>🔮 Simulate Me!</button>
          <button className={`tab-btn ${activeTab === 'training' ? 'active' : ''}`} onClick={() => setActiveTab('training')} style={{ color: '#f59e0b', fontWeight: 'bold' }}>RWD Training</button>
          <button className={`tab-btn ${activeTab === 'ingestion' ? 'active' : ''}`} onClick={() => setActiveTab('ingestion')}>Add Twin (JSON)</button>
          <button className={`tab-btn ${activeTab === 'explanation' ? 'active' : ''}`} onClick={() => setActiveTab('explanation')}>How It Works</button>
          {import.meta.env.DEV && (
            <button className={`tab-btn ${activeTab === 'backend-train' ? 'active' : ''}`} onClick={() => setActiveTab('backend-train')} style={{ color: '#ec4899', fontWeight: 'bold' }}>Train PyTorch [DEV]</button>
          )}
        </div>

        <div className="controls">
          <div className="tick-counter" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Global Clock: Week {ticks} {ticks > 0 && `(Year ${(ticks/52).toFixed(1)})`}</span>
            {isFastForwarding && <span style={{ color: '#f59e0b', fontSize: '0.9rem', animation: 'pulseGlow 1s infinite' }}>(Processing Fast Forward...)</span>}
          </div>

          {!isEnded && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => setIsRunning(!isRunning)} className={isRunning ? 'running' : ''}>
                {isRunning ? 'Pause Simulation' : 'Start Simulation'}
              </button>
              
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <select 
                      value={fastForwardYears} 
                      onChange={(e) => setFastForwardYears(Number(e.target.value))}
                      style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                      disabled={isFastForwarding}
                  >
                      <option value={5} style={{color: 'black'}}>5 Years</option>
                      <option value={10} style={{color: 'black'}}>10 Years</option>
                      <option value={15} style={{color: 'black'}}>15 Years</option>
                      <option value={20} style={{color: 'black'}}>20 Years</option>
                  </select>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <input 
                          type="checkbox" 
                          checked={autoResume} 
                          onChange={(e) => setAutoResume(e.target.checked)} 
                          disabled={isFastForwarding}
                          style={{ cursor: 'pointer' }}
                      />
                      Auto-Resume
                  </label>
                  
                  <button 
                      onClick={handleFastForward} 
                      disabled={isFastForwarding}
                      style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: isFastForwarding ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
                  >
                      ⏩ Skip
                  </button>
              </div>

              <button 
                onClick={() => {
                  // Hard stop timeline
                  setIsRunning(false);
                  setIsEnded(true);
                  setActiveTab('report');
                }}
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                End Simulation
              </button>
            </div>
          )}

          {isEnded && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontWeight: 'bold', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)', marginRight: '1rem' }}>
                Terminated
              </div>
              <button 
                onClick={handleReset}
                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Reset
              </button>
              <button 
                onClick={handleSaveSimulation}
                style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Save Data
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="main-content" style={{ padding: activeTab === 'dashboard' ? '1rem 0' : '2rem' }}>
        {activeTab === 'backend-train' && import.meta.env.DEV && <BackendTrainer />}
        {activeTab === 'report' && isEnded && (
            <div style={{ height: 'calc(100vh - 250px)', overflowY: 'auto', paddingRight: '1rem' }}>
                <SimulationReport agents={agents} ticks={ticks} />
            </div>
        )}
        {activeTab === 'explanation' && <div style={{ height: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '1rem' }}><Explanation /></div>}
        {activeTab === 'training' && <TrainingDashboard />}
        {activeTab === 'consumer-wizard' && (
          <div id="wizard-scroll-container" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', height: 'calc(100vh - 200px)', overflowY: 'auto', padding: '0.5rem 1rem 2rem 0.5rem' }}>
             <ConsumerWizard onStartCustomTrial={handleStartCustomTrial} />
             {customTwins.length > 0 && (
                <div id="simulate-me-dashboard">
                   <CustomTwinDashboard customTwins={customTwins} customTicks={customTicks} isCustomRunning={isCustomRunning} isCustomEnded={isCustomEnded} isCustomFastForwarding={isCustomFastForwarding} onFastForward={handleCustomFastForward} onTogglePlay={() => setIsCustomRunning(!isCustomRunning)} onEndTrial={() => { setIsCustomRunning(false); setIsCustomEnded(true); }} />
                </div>
             )}
          </div>
        )}
        {activeTab === 'ingestion' && <div style={{ height: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: '1rem' }}><IngestionView onStartCustomTrial={handleStartCustomTrial} /></div>}
        {activeTab === 'dashboard' && (
           <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(400px, 2fr) minmax(350px, 1.5fr)', gap: '1.5rem', width: '100%', height: 'calc(100vh - 200px)' }}>
              
              <div style={{ overflowY: 'auto', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <NetworkFeed ticks={ticks} />
              </div>
              
              <div style={{ overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1.5rem 1rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <DashboardView agents={agents} onSelectAgent={setSelectedId} />
              </div>

              <div style={{ overflowY: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                  {selectedId ? (
                     <TimelineView agents={agents} selectedId={selectedId} onSelectAgent={setSelectedId} />
                  ) : (
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                        <div>
                          <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📊</div>
                          <h3>Trajectory Analytics Pipeline</h3>
                          <p>Click on any digital patient twin within the active simulation arena to physically extract them into detailed graph telemetry.</p>
                        </div>
                     </div>
                  )}
              </div>
              
           </div>
        )}
      </main>

      <footer style={{
        marginTop: 'auto',
        padding: '1rem',
        textAlign: 'center',
        background: 'rgba(0, 0, 0, 0.4)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <p style={{ margin: 0 }}>
          <strong>Legal Disclaimer:</strong> This application is a mathematical simulation built strictly for entertainment, educational, and research modeling purposes. It does not provide medical advice, diagnosis, or treatment. 
          The Gen-AI endpoints and Actuarial hazard integrations must not be taken literally. This application is <strong>NOT HIPAA compliant</strong> and must not be fed Real Patient Health Information (PHI). Always consult a licensed physician for healthcare decisions.
        </p>
      </footer>
    </div>
  );
}

export default App;
