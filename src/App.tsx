import { useState, useEffect, useRef } from 'react';
import { SimulationEngine } from './simulation/Engine';
import { initialAgents } from './simulation/InitialData';
import type { AgentState } from './simulation/Agent';
import { Explanation } from './components/Explanation';
import { TimelineView } from './components/TimelineView';
import { IngestionView } from './components/IngestionView';

const getHealthColor = (val: number) => {
  if (val > 70) return 'var(--health-good)';
  if (val > 40) return 'var(--health-warn)';
  return 'var(--health-crit)';
};

const getStressColor = (val: number) => {
  if (val < 40) return 'var(--health-good)';
  if (val < 70) return 'var(--health-warn)';
  return 'var(--health-crit)';
};

function App() {
  const engineRef = useRef<SimulationEngine | null>(null);
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [ticks, setTicks] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timeline' | 'explanation' | 'ingestion'>('dashboard');

  useEffect(() => {
    engineRef.current = new SimulationEngine(initialAgents);
    setAgents(engineRef.current.getAgents());
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (isRunning) {
      interval = window.setInterval(() => {
        if (engineRef.current) {
          engineRef.current.tick();
          setAgents([...engineRef.current.getAgents()]);
          setTicks(engineRef.current.currentTick);
        }
      }, 500);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleInjectAgent = (rawPayload: Omit<AgentState, 'history' | 'isDead'>) => {
    if (engineRef.current) {
      engineRef.current.addAgent(rawPayload);
      setAgents([...engineRef.current.getAgents()]);
    }
  };

  return (
    <div className="dashboard">
      <header className="header">
        <div className="title">
          <h1>Medical Digital Twins</h1>
          <p>Real-time simulation of Social Determinants of Health</p>
        </div>
        
        <div className="nav-tabs">
          <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>Detailed Timelines</button>
          <button className={`tab-btn ${activeTab === 'ingestion' ? 'active' : ''}`} onClick={() => setActiveTab('ingestion')}>Add Digital Twin</button>
          <button className={`tab-btn ${activeTab === 'explanation' ? 'active' : ''}`} onClick={() => setActiveTab('explanation')}>How It Works</button>
        </div>

        <div className="controls">
          <div className="tick-counter">
            Week: {ticks} {ticks > 0 && `(Year ${(ticks/52).toFixed(1)})`}
          </div>
          <button onClick={() => setIsRunning(!isRunning)} className={isRunning ? 'running' : ''}>
            {isRunning ? 'Pause Simulation' : 'Start Simulation'}
          </button>
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'explanation' && <Explanation />}
        
        {activeTab === 'timeline' && <TimelineView agents={agents} />}

        {activeTab === 'ingestion' && <IngestionView onAddAgent={handleInjectAgent} />}

        {activeTab === 'dashboard' && (
          <div className="grid">
            {agents.map((agent) => (
              <div key={agent.id} className="card" onClick={() => setActiveTab('timeline')} style={{ cursor: 'pointer' }}>
                <div className="card-header">
                  <h2>{agent.name} {agent.id.includes('custom') ? <span style={{fontSize: '0.9rem', color: '#a78bfa'}}>(Custom DB)</span> : null}</h2>
                  <span>Age: {Math.floor(agent.age)}</span>
                </div>

                <div className="tag-container">
                  {agent.foodDesert && <span className="tag warning">Food Desert</span>}
                  {agent.wealth < 40 && <span className="tag warning">Low Income</span>}
                  {agent.chronicConditions.map(cond => (
                    <span key={cond} className="tag danger">{cond}</span>
                  ))}
                  {agent.chronicConditions.length === 0 && !agent.foodDesert && agent.wealth >= 40 && (
                    <span className="tag">Stable</span>
                  )}
                </div>

                <div className="stats">
                  <div className="stat-row">
                    <div className="stat-label-row">
                      <span>Health</span>
                      <span>{Math.round(agent.baseHealth)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${agent.baseHealth}%`, backgroundColor: getHealthColor(agent.baseHealth) }} />
                    </div>
                  </div>

                  <div className="stat-row">
                    <div className="stat-label-row">
                      <span>Stress</span>
                      <span>{Math.round(agent.stressLevel)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${agent.stressLevel}%`, backgroundColor: getStressColor(agent.stressLevel) }} />
                    </div>
                  </div>

                  <div className="stat-row">
                    <div className="stat-label-row">
                      <span>Diet Quality</span>
                      <span>{Math.round(agent.dietQuality)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${agent.dietQuality}%`, backgroundColor: 'var(--accent-color)' }} />
                    </div>
                  </div>
                </div>

                <div className="events-log">
                  {agent.history.length === 0 ? (
                    <p>No major events yet.</p>
                  ) : (
                    agent.history.slice(-2).reverse().map((ev, i) => (
                      <p key={i}>
                        <strong>Wk {ev.tick} - {ev.type}:</strong> {ev.description}
                      </p>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
