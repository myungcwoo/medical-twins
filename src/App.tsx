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
import { FAQView } from './components/FAQView';
import { DevDocumentation } from './components/DevDocumentation';
import heroBg from './assets/hero_bg.png';
import { DatabaseEngine } from './simulation/DatabaseEngine';
import { InferenceEngine } from './simulation/InferenceEngine';
import { Pharmacokinetics, type PhysicsModel } from './simulation/Pharmacokinetics';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timeline' | 'explanation' | 'faq' | 'ingestion' | 'network' | 'report' | 'custom-trial' | 'training' | 'backend-train' | 'consumer-wizard' | 'dev-docs'>('dashboard');
  const [selectedId, setSelectedId] = useState<string>('');
  
  // Fast Forward State
  const [fastForwardYears, setFastForwardYears] = useState<number>(5);
  const [autoResume, setAutoResume] = useState<boolean>(true);
  const [isFastForwarding, setIsFastForwarding] = useState<boolean>(false);
  const [isCustomFastForwarding, setIsCustomFastForwarding] = useState<boolean>(false);
  
  // Mathematical Combination Engine Mode
  const [physicsMode, setPhysicsMode] = useState<PhysicsModel>('Linear');
  
  // Mobile UI States
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const hydrator = async () => {
      // 1. Await Edge ML Memory Loading
      await InferenceEngine.initialize();
      
      // 2. Hydrate the persistent simulation twin population
      const persisted = await DatabaseEngine.loadSnapshot();
      if (persisted && persisted.agents && persisted.agents.length > 0) {
          engineRef.current = new SimulationEngine(persisted.agents as any);
          engineRef.current.currentTick = persisted.ticks;
          setTicks(persisted.ticks);
          console.log("[IndexedDB] Simulation completely restored to Week " + persisted.ticks);
      } else {
          engineRef.current = new SimulationEngine(initialAgents);
      }
      setAgents(engineRef.current.getAgents());
    };
    hydrator();

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

          // Phase 5 Persistence: Autosave silently in the background
          if (engineRef.current.currentTick > 0 && engineRef.current.currentTick % 52 === 0) {
              DatabaseEngine.saveSnapshot(engineRef.current.currentTick, engineRef.current.getAgents());
          }
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
    // Pre-emptively apply the explicitly selected protocols natively across ALL Intervention clones using the Mathematical Engine
    customEngineRef.current.agents.filter(a => a.state.comparativeGroup === 'Intervention').forEach(interventionAgent => {
      
      const impactsToCalculate = selectedProtocols.map(p => p.impact);
      const protocolIds = selectedProtocols.map(p => p.id);
      
      const netCalculatedImpact = Pharmacokinetics.calculateNetImpact(
          impactsToCalculate, 
          physicsMode, 
          interventionAgent.state.medications,
          protocolIds
      );

      interventionAgent.state.history.push({ 
          tick: customEngineRef.current!.currentTick, 
          type: 'Intervention', 
          description: `User Directed Optimization Physics Sweep: [${selectedProtocols.map(p => p.title).join(', ')}] -> ${netCalculatedImpact.description}`,
          impactHealth: netCalculatedImpact.healthDelta,
          impactStress: netCalculatedImpact.stressDelta
      });
      
      interventionAgent.state.baseHealth += netCalculatedImpact.healthDelta;
      interventionAgent.state.stressLevel += netCalculatedImpact.stressDelta;
      interventionAgent.state.vitals.bpSystolic += netCalculatedImpact.bpDelta;
      interventionAgent.state.labs.a1c += netCalculatedImpact.a1cDelta;
      interventionAgent.state.labs.cvHealth += netCalculatedImpact.cvDelta;
      interventionAgent.state.labs.egfr += netCalculatedImpact.egfrDelta;
      
      netCalculatedImpact.newMeds.forEach((med: string) => {
          if (!interventionAgent.state.medications.includes(med)) interventionAgent.state.medications.push(med);
      });
      
      protocolIds.forEach((id: string) => {
          if (!interventionAgent.state.memory.includes(id)) {
              interventionAgent.state.memory.push(id);
          }
      });
      
      // Safety bounds check
      interventionAgent.state.baseHealth = Math.max(10, Math.min(100, interventionAgent.state.baseHealth));
    });

    setCustomTwins([...customEngineRef.current.getAgents()]);
    setIsCustomEnded(false);
    
    // Automatically pan the window down sequentially to expose the newly spawned Cohorts chart
    setTimeout(() => {
        const container = document.getElementById('global-scroll-container');
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

  const handleReset = async () => {
    if (window.confirm("Are you sure you want to reset the entire Sandbox? All biological data arrays and Network feed protocols will be permanently wiped.")) {
      await DatabaseEngine.clearSnapshot();
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
    <div className="layout-wrapper">
      
      {/* Mobile Hamburger Overlay Interceptor */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 1. Collapsible Vertical Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img 
            src="/logo.png" 
            alt="Medical Twins Logo" 
            className="logo"
          />
          <div className="brand">
            <h1>Clinical AI</h1>
            <p>Digital Patient Studio</p>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-group-title">Primary Workspaces</div>
          <button className={`sidebar-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} style={{ color: activeTab === 'dashboard' ? '#93c5fd' : '#3b82f6', fontWeight: 'bold' }}>⚡ Command Center</button>
          <button className={`sidebar-btn ${activeTab === 'consumer-wizard' ? 'active' : ''}`} onClick={() => { setActiveTab('consumer-wizard'); setIsMobileMenuOpen(false); }} style={{ color: activeTab === 'consumer-wizard' ? '#fbcfe8' : '#f472b6', fontWeight: 'bold' }}>🔮 Simulate Me</button>
          
          <div className="nav-group-title" style={{ marginTop: '1rem' }}>Data & Logs</div>
          {isEnded && <button className={`sidebar-btn ${activeTab === 'report' ? 'active' : ''}`} onClick={() => { setActiveTab('report'); setIsMobileMenuOpen(false); }} style={{ color: activeTab === 'report' ? '#fca5a5' : '#ef4444', fontWeight: 'bold' }}>📊 Terminated Report</button>}
          <button className={`sidebar-btn ${activeTab === 'training' ? 'active' : ''}`} onClick={() => { setActiveTab('training'); setIsMobileMenuOpen(false); }} style={{ color: activeTab === 'training' ? '#fcd34d' : '#f59e0b', fontWeight: 'bold' }}>💉 RWD Training</button>
          <button className={`sidebar-btn ${activeTab === 'ingestion' ? 'active' : ''}`} onClick={() => { setActiveTab('ingestion'); setIsMobileMenuOpen(false); }}>🧬 Add Twin (JSON)</button>
          <button className={`sidebar-btn ${activeTab === 'explanation' ? 'active' : ''}`} onClick={() => { setActiveTab('explanation'); setIsMobileMenuOpen(false); }}>📖 How It Works</button>
          <button className={`sidebar-btn ${activeTab === 'faq' ? 'active' : ''}`} onClick={() => { setActiveTab('faq'); setIsMobileMenuOpen(false); }} style={{ color: activeTab === 'faq' ? '#93c5fd' : '#60a5fa' }}>❔ Read FAQ</button>
        </nav>

        <div className="sidebar-footer">
          {import.meta.env.DEV && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className={`sidebar-btn dev-btn ${activeTab === 'dev-docs' ? 'active' : ''}`} onClick={() => { setActiveTab('dev-docs'); setIsMobileMenuOpen(false); }} style={{ color: '#ec4899', fontWeight: 'bold' }}>📚 Arch Docs</button>
              <button className={`sidebar-btn dev-btn ${activeTab === 'backend-train' ? 'active' : ''}`} onClick={() => { setActiveTab('backend-train'); setIsMobileMenuOpen(false); }} style={{ color: '#ec4899', fontWeight: 'bold' }}>⚙️ DL Trajectories</button>
            </div>
          )}
        </div>
      </aside>

      {/* 2. Main Content Area & Floating Island */}
      <div className="main-content-area">
        
        <header className="top-island">
            
            {/* Mobile Hamburger Button */}
            <button 
                className="mobile-menu-btn" 
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open Menu"
            >
                ☰
            </button>

            <div className="island-controls">
              <div className="tick-counter" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>Global Clock: Week {ticks} {ticks > 0 && `(Year ${(ticks/52).toFixed(1)})`}</span>
                {isFastForwarding && <span style={{ color: '#f59e0b', fontSize: '0.9rem', animation: 'pulseGlow 1s infinite' }}>(Processing Fast Forward...)</span>}
              </div>

              {!isEnded && (
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => setIsRunning(!isRunning)} className={`action-btn ${isRunning ? 'running' : ''}`}>
                    {isRunning ? '⏸ Pause' : '▶ Start'}
                  </button>

                  {/* Mathematical Combination Physics Selector */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(59, 130, 246, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                      <span style={{ fontSize: '0.8rem', color: '#93c5fd', fontWeight: 'bold' }}>Model</span>
                      <select 
                          value={physicsMode} 
                          onChange={(e) => setPhysicsMode(e.target.value as PhysicsModel)}
                          style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 'bold' }}
                          title="Select the mathematical ruleset for computing stacked clinical combination therapies."
                      >
                          <option value="Linear" style={{color: 'black'}}>Linear Addition</option>
                          <option value="Bliss" style={{color: 'black'}}>Bliss Independence</option>
                          <option value="Asymptotic" style={{color: 'black'}}>Diminishing Returns (Asymptotic)</option>
                          <option value="Matrix" style={{color: 'black'}}>Mechanistic Graph Antagonism</option>
                      </select>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <select 
                          value={fastForwardYears} 
                          onChange={(e) => setFastForwardYears(Number(e.target.value))}
                          style={{ background: 'transparent', color: 'white', border: 'none', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                          disabled={isFastForwarding}
                      >
                          <option value={5} style={{color: 'black'}}>5 YRS</option>
                          <option value={10} style={{color: 'black'}}>10 YRS</option>
                          <option value={15} style={{color: 'black'}}>15 YRS</option>
                          <option value={20} style={{color: 'black'}}>20 YRS</option>
                      </select>
                      
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
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
                          className="ff-btn"
                          style={{ cursor: isFastForwarding ? 'not-allowed' : 'pointer' }}
                      >
                          ⏩ Skip
                      </button>
                  </div>

                  <button 
                    onClick={() => {
                      setIsRunning(false);
                      setIsEnded(true);
                      // Removed setActiveTab('report') to preserve current context view per user request
                    }}
                    className="end-btn"
                  >
                    ⏹ End Simulation
                  </button>
                </div>
              )}

              {isEnded && (
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <div style={{ padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', fontWeight: 'bold', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    Terminated
                  </div>
                  {activeTab !== 'report' && (
                      <button onClick={() => setActiveTab('report')} style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', animation: 'pulseGlow 2s infinite' }}>
                          View Terminated Report
                      </button>
                  )}
                  <button onClick={handleReset} className="reset-btn">Reset</button>
                  <button onClick={handleSaveSimulation} className="save-btn">Save Data</button>
                </div>
              )}
            </div>
        </header>

      <main id="global-scroll-container" className="main-content" style={{ padding: activeTab === 'dashboard' ? '1rem 0' : '1rem 1rem 2rem 1rem' }}>
        {activeTab === 'dev-docs' && <DevDocumentation />}
        {activeTab === 'backend-train' && import.meta.env.DEV && <BackendTrainer />}
        {activeTab === 'report' && isEnded && (
            <div>
                <SimulationReport agents={agents} ticks={ticks} />
            </div>
        )}
        {activeTab === 'faq' && <div><FAQView /></div>}
        {activeTab === 'explanation' && <div><Explanation /></div>}
        {activeTab === 'training' && <TrainingDashboard />}
        {activeTab === 'consumer-wizard' && (
          <div id="wizard-scroll-container" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '0.5rem 0.5rem 2rem 0.5rem' }}>
             <ConsumerWizard onStartCustomTrial={handleStartCustomTrial} />
             {customTwins.length > 0 && (
                <div id="simulate-me-dashboard">
                   <CustomTwinDashboard customTwins={customTwins} customTicks={customTicks} isCustomRunning={isCustomRunning} isCustomEnded={isCustomEnded} isCustomFastForwarding={isCustomFastForwarding} onFastForward={handleCustomFastForward} onTogglePlay={() => setIsCustomRunning(!isCustomRunning)} onEndTrial={() => { setIsCustomRunning(false); setIsCustomEnded(true); }} />
                </div>
             )}
          </div>
        )}
        {activeTab === 'ingestion' && (
          <div id="ingestion-scroll-container" style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '0.5rem 0.5rem 2rem 0.5rem', height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
             <IngestionView onStartCustomTrial={handleStartCustomTrial} />
             {customTwins.length > 0 && (
                <div id="simulate-me-dashboard"> {/* Reusing ID for scroll targeting */}
                   <CustomTwinDashboard customTwins={customTwins} customTicks={customTicks} isCustomRunning={isCustomRunning} isCustomEnded={isCustomEnded} isCustomFastForwarding={isCustomFastForwarding} onFastForward={handleCustomFastForward} onTogglePlay={() => setIsCustomRunning(!isCustomRunning)} onEndTrial={() => { setIsCustomRunning(false); setIsCustomEnded(true); }} />
                </div>
             )}
          </div>
        )}
        {activeTab === 'dashboard' && (
           <>
             {selectedId && <TimelineView agents={agents} selectedId={selectedId} onSelectAgent={setSelectedId} />}
             <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(400px, 2.5fr)', gap: '1.5rem', width: '100%', height: 'calc(100vh - 200px)' }}>
                
                <div style={{ overflowY: 'auto', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <NetworkFeed ticks={ticks} />
                </div>
                
                <div style={{ overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '1.5rem 1rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                    <DashboardView agents={agents} onSelectAgent={setSelectedId} isRunning={isRunning} isFastForwarding={isFastForwarding} />
                </div>

             </div>
           </>
        )}
      </main>
      </div>
    </div>
  );
}

export default App;
