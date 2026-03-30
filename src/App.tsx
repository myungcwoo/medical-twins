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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timeline' | 'explanation' | 'ingestion' | 'network' | 'report' | 'custom-trial' | 'training'>('dashboard');
  const [selectedId, setSelectedId] = useState<string>('');

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

  const handleStartCustomTrial = (rawPayload: Omit<AgentState, 'history' | 'isDead'>, selectedProtocols: any[]) => {
    // --- Spawning Bifurcated Comparative Clones For Isolated Sandbox ---
    const controlId = crypto.randomUUID();
    const interventionId = crypto.randomUUID();

    const baseTwinParams = {
      ...rawPayload,
      memory: []
    };

    const controlPayload: Omit<AgentState, 'history' | 'isDead'> = {
      ...baseTwinParams,
      id: controlId,
      name: `${rawPayload.name} (Control)`,
      comparativeGroup: 'Control',
      pairedTwinId: interventionId
    };

    const altPayload: Omit<AgentState, 'history' | 'isDead'> = {
      ...baseTwinParams,
      id: interventionId,
      name: `${rawPayload.name} (Optimized)`,
      comparativeGroup: 'Intervention',
      pairedTwinId: controlId
    };

    // Spin up an entirely secondary sandboxed instance for just these two twins
    customEngineRef.current = new SimulationEngine([controlPayload, altPayload]);
    // Force the chronological clock sequence strictly against the active time structure so charts align natively 
    if (engineRef.current) {
       customEngineRef.current.currentTick = engineRef.current.currentTick;
    }
    setCustomTicks(customEngineRef.current.currentTick);

    // Pre-emptively apply the explicitly selected protocols natively
    const interventionAgent = customEngineRef.current.agents.find(a => a.state.id === interventionId);
    if (interventionAgent) {
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
    }

    setCustomTwins([...customEngineRef.current.getAgents()]);
    setIsCustomEnded(false);
    setActiveTab('custom-trial');
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
        <div className="title">
          <h1>Medical Digital Twins AI</h1>
          <p>Generative ABM Network & Epidemiological Decay Engine</p>
        </div>
        
        <div className="nav-tabs">
          {isEnded && <button className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')} style={{ color: '#ef4444', fontWeight: 'bold' }}>Simulation Report</button>}
          <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>Detailed Timelines</button>
          <button className={`tab-btn ${activeTab === 'network' ? 'active' : ''}`} onClick={() => setActiveTab('network')}>Global Network</button>
          <button className={`tab-btn ${activeTab === 'training' ? 'active' : ''}`} onClick={() => setActiveTab('training')} style={{ color: '#f59e0b', fontWeight: 'bold' }}>RWD Training</button>
          <button className={`tab-btn ${activeTab === 'ingestion' ? 'active' : ''}`} onClick={() => setActiveTab('ingestion')}>Add Digital Twin</button>
          <button className={`tab-btn ${activeTab === 'custom-trial' ? 'active' : ''}`} onClick={() => setActiveTab('custom-trial')} style={{ color: '#3b82f6', fontWeight: 'bold' }}>Custom Trial</button>
          <button className={`tab-btn ${activeTab === 'explanation' ? 'active' : ''}`} onClick={() => setActiveTab('explanation')}>How It Works</button>
        </div>

        <div className="controls">
          <div className="tick-counter">
            Global Clock: Week {ticks} {ticks > 0 && `(Year ${(ticks/52).toFixed(1)})`}
          </div>

          {!isEnded && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setIsRunning(!isRunning)} className={isRunning ? 'running' : ''}>
                {isRunning ? 'Pause Simulation' : 'Start Simulation'}
              </button>
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

      <main className="main-content">
        {activeTab === 'report' && isEnded && <SimulationReport agents={agents} ticks={ticks} />}
        {activeTab === 'explanation' && <Explanation />}
        {activeTab === 'network' && <NetworkFeed ticks={ticks} />}
        {activeTab === 'training' && <TrainingDashboard />}
        {activeTab === 'timeline' && <TimelineView agents={agents} selectedId={selectedId} onSelectAgent={setSelectedId} />}
        {activeTab === 'custom-trial' && <CustomTwinDashboard customTwins={customTwins} customTicks={customTicks} isCustomRunning={isCustomRunning} isCustomEnded={isCustomEnded} onTogglePlay={() => setIsCustomRunning(!isCustomRunning)} onEndTrial={() => { setIsCustomRunning(false); setIsCustomEnded(true); }} />}
        {activeTab === 'ingestion' && <IngestionView onStartCustomTrial={handleStartCustomTrial} />}
        {activeTab === 'dashboard' && <DashboardView agents={agents} onSelectAgent={(id) => { setSelectedId(id); setActiveTab('timeline'); }} />}
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
