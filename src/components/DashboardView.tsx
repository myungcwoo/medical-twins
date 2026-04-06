import { useState, useMemo, useEffect, useRef } from 'react';
import type { FC } from 'react';

import { KnowledgeBase } from '../simulation/KnowledgeNetwork';
import { LLMEngine, type Provider } from '../simulation/LLMEngine';
import { StatCard } from './ui/StatCard';
import { ProgressBar } from './ui/ProgressBar';
import { KnowledgeGraphCanvas } from './ui/KnowledgeGraphCanvas';
import { useSimulationStore } from '../store/useSimulationStore';
import { FederationPanel } from './FederationPanel';
import { TimeScrubber } from './ui/TimeScrubber';
import { AnalyticsChatView } from './ui/AnalyticsChatView';

interface Props {
  onSelectAgent: (id: string) => void;
}

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

export const DashboardView: FC<Props> = ({ onSelectAgent }) => {
  const { agents, isFastForwarding } = useSimulationStore();
  const [page, setPage] = useState(1);
  const [subTab, setSubTab] = useState<'overview' | 'database' | 'analytics'>('overview');
  const [hoverNode, setHoverNode] = useState<{ id: string; health?: number; isDead?: boolean; x?: number; y?: number; fx?: number; fy?: number; } | null>(null);
  const [apiKey, setApiKey] = useState(LLMEngine.apiKey || '');
  const [provider, setProvider] = useState<Provider>(LLMEngine.provider);
  const [targetModel, setTargetModel] = useState<string>(LLMEngine.activeModel || 'gemini-2.5-flash');
  const [llmEnabled, setLlmEnabled] = useState<boolean>(LLMEngine.isEnabled);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const itemsPerPage = 20;

  const handleSaveKey = () => {
    LLMEngine.setCredentials(provider, apiKey, targetModel);
    // eslint-disable-next-line no-alert
    alert(`${provider} Engine Authenticated (${targetModel})! The digital twins will now prompt this network for protocol evaluations.`);
  };

  const handleFetchModels = async () => {
      if (provider !== 'Gemini') return;
      if (!apiKey) {
          alert('Please enter your API Key first.');
          return;
      }
      try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
          const data = await res.json();
          if (data.models) {
              const ms = data.models.map((m: { name: string }) => m.name.replace('models/', '')).filter((n: string) => n.includes('gemini'));
              setAvailableModels(ms);
              if (ms.length > 0 && !ms.includes(targetModel)) {
                  setTargetModel(ms[0]);
              }
          } else {
              // eslint-disable-next-line no-alert
              alert('Could not fetch models. Check your API Key.');
          }
      } catch (e) {
          alert("Failed to fetch models.");
      }
  };

  const total = agents.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const currentPage = Math.min(page, totalPages);

  // High-Performance Physics Memoization
  // We strictly isolate both nodes and links into a single immutable reference.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const staticNodes = useMemo(() => {
     return agents.map(a => ({ id: a.id, health: a.baseHealth, isDead: a.isDead }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents]);

  // Draw topological paths dynamically based exclusively on exact peer-to-peer clinical adoptions!
  const liveLinks = useMemo(() => {
      const explicitTwinLinks = agents.filter(a => a.pairedTwinId).map(a => ({ source: a.id, target: a.pairedTwinId! }));
      
      if (explicitTwinLinks.length > 0) return explicitTwinLinks;

      // Map dynamic communication histories
      return agents.flatMap(a => (a.networkConnections || []).map(targetId => ({ source: a.id, target: targetId })));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents]);

  const liveGraphData = useMemo(() => {
      return { nodes: staticNodes, links: liveLinks };
  }, [staticNodes, liveLinks]);

  useEffect(() => {
      useSimulationStore.getState().fetchCheckpoints();
  }, []);

  // Silently mutate the underlying D3 node references so we don't break gravity layout constraints.
  // We explicitly trigger a canvas redraw using d3ReheatSimulation to reflect color/size changes.
  useEffect(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      staticNodes.forEach((node: any) => {
          const liveAgent = agents.find(a => a.id === node.id);
          if (liveAgent) {
              node.health = liveAgent.baseHealth;
              node.isDead = liveAgent.isDead;
          }
      });
      // Gently wake the simulation to trigger nodeColor and nodeVal recalculations, 
      // but conditionally limit firing rate to avoid WebGL context collapsing (Black Screen).
      if (graphRef.current && Math.random() < 0.2) {
         graphRef.current.d3ReheatSimulation();
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents, liveGraphData, staticNodes]);

  const active = agents.filter(a => !a.isDead).length;
  const survivalRate = total > 0 ? ((active / total) * 100).toFixed(1) : '0.0';
  
  const totalInteractions = KnowledgeBase.totalInteractions;
  const avgHealth = active > 0 ? (agents.filter(a => !a.isDead).reduce((acc, a) => acc + a.baseHealth, 0) / active).toFixed(1) : '0.0';

  const paginatedAgents = agents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="dashboard-wrapper">
      {/* Sub-Tab Navigation */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setSubTab('overview')} 
          style={{ background: 'transparent', border: 'none', color: subTab === 'overview' ? '#3b82f6' : 'var(--text-muted)', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', borderBottom: subTab === 'overview' ? '2px solid #3b82f6' : '2px solid transparent', paddingBottom: '0.4rem', transition: 'all 0.2s' }}>
          Global Overview
        </button>
        <button 
          onClick={() => setSubTab('database')} 
          style={{ background: 'transparent', border: 'none', color: subTab === 'database' ? '#10b981' : 'var(--text-muted)', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', borderBottom: subTab === 'database' ? '2px solid #10b981' : '2px solid transparent', paddingBottom: '0.4rem', transition: 'all 0.2s' }}>
          Population Database
        </button>
        <button 
          onClick={() => setSubTab('analytics')} 
          style={{ background: 'transparent', border: 'none', color: subTab === 'analytics' ? '#8b5cf6' : 'var(--text-muted)', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', borderBottom: subTab === 'analytics' ? '2px solid #8b5cf6' : '2px solid transparent', paddingBottom: '0.4rem', transition: 'all 0.2s' }}>
          A.I. Analytics Center
        </button>
      </div>

       {subTab === 'overview' && (
         <>
           {/* Generative AI Configuration */}
       <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem', opacity: llmEnabled ? 1 : 0.5 }}>🧠</span>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                 <div>
                    <div style={{ fontWeight: 'bold', color: llmEnabled ? '#34d399' : 'var(--text-muted)', fontSize: '1.1rem' }}>Clinical Gen-AI Injection {llmEnabled ? '(Active)' : '(Disabled)'}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Authenticate an LLM to dynamically prompt the network. Your keys never leave your browser loop.</div>
                 </div>
                 <button 
                    onClick={() => {
                        const newState = !llmEnabled;
                        setLlmEnabled(newState);
                        LLMEngine.setEnabled(newState);
                    }}
                    className={`btn ${llmEnabled ? 'btn-danger' : 'btn-success'}`}
                 >
                    {llmEnabled ? 'Disable LLM Sandbox' : 'Enable LLM Sandbox'}
                 </button>
              </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select 
                className="input-field"
                value={provider} 
                onChange={(e) => setProvider(e.target.value as Provider)}
                style={{ flex: 1, minWidth: '150px' }}
              >
                <option value="OpenAI">OpenAI (GPT-4o)</option>
                <option value="Gemini">Google Gemini</option>
                <option value="Claude">Anthropic Claude</option>
              </select>

              <input 
                className="input-field"
                type="password" 
                value={apiKey} 
                onChange={e => setApiKey(e.target.value)} 
                placeholder="Paste raw API token..." 
                style={{ flex: 2, minWidth: '200px' }} 
              />
              <button onClick={handleSaveKey} className="btn btn-success" style={{ whiteSpace: 'nowrap' }}>
                Save
              </button>
          </div>

          {/* Dynamic Model Sub-Selection */}
          {provider === 'Gemini' && (
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button onClick={handleFetchModels} className="btn btn-outline" style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
                     Scan Authorized Models
                  </button>
                  {availableModels.length > 0 ? (
                      <select className="input-field" value={targetModel} onChange={e => setTargetModel(e.target.value)} style={{ flex: 1, minWidth: '200px' }}>
                          {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                  ) : (
                      <input className="input-field" type="text" value={targetModel} onChange={e => setTargetModel(e.target.value)} placeholder="Manual Override: e.g. gemini-2.5-flash" style={{ flex: 1, minWidth: '200px' }} />
                  )}
              </div>
          )}
       </div>

       {/* Analytics Banner */}
       <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {/* Live Force Graph Block */}
          <div style={{ flexShrink: 0, width: '280px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(139, 92, 246, 0.3)', boxShadow: '0 0 40px rgba(139, 92, 246, 0.15)', position: 'relative', background: '#000' }}>
             {isFastForwarding ? (
                 <div style={{ width: '280px', height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.9)' }}>
                     <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid rgba(139, 92, 246, 0.2)', borderTopColor: '#8b5cf6', animation: 'spin 1s linear infinite' }}></div>
                     <div style={{ color: '#8b5cf6', fontWeight: 'bold', marginTop: '1.5rem', fontSize: '1rem', letterSpacing: '0.05em' }}>COMPUTING DATA</div>
                     <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center', padding: '0 1rem' }}>
                         Topology mapping suspended during Fast-Forward.
                     </div>
                 </div>
             ) : (
                 <KnowledgeGraphCanvas
                    agents={agents}
                    liveGraphData={liveGraphData}
                    isFastForwarding={isFastForwarding}
                    hoverNode={hoverNode}
                    setHoverNode={setHoverNode}
                    onSelectAgent={onSelectAgent}
                    graphRef={graphRef}
                    getHealthColor={getHealthColor}
                 />
             )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem 1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', pointerEvents: 'none' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Knowledge Dispersion Graph</div>
            </div>
          </div>
          
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignContent: 'start' }}>
            <StatCard 
              label="Active Twins" 
              value={<>{active} <span style={{fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal'}}>/ {total}</span></>} 
              color="#facc15" 
            />
            <StatCard 
              label="Survival Rate" 
              value={`${survivalRate}%`} 
              color={active > (total*0.5) ? '#10b981' : '#ef4444'} 
            />
            <StatCard 
              label="Network Interactions" 
              value={totalInteractions} 
              color="#a78bfa" 
            />
            <StatCard 
              label="Avg Baseline Health" 
              value={`${avgHealth}%`} 
              color={getHealthColor(parseFloat(avgHealth))} 
            />
          </div>
       </div>

       <FederationPanel />
       <TimeScrubber />
       </>
      )}

       {subTab === 'database' && (
        <>
        {/* Pagination Controls */}
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
         <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#e2e8f0' }}>Population Database</h2>
         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ padding: '0.5rem 1rem', background: 'var(--panel-bg)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>&lt; Prev</button>
           <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Page {currentPage} of {totalPages}</span>
           <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ padding: '0.5rem 1rem', background: 'var(--panel-bg)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>Next &gt;</button>
         </div>
       </div>
       
       <div className="grid">
            {paginatedAgents.map((agent) => (
              <div key={agent.id} className="card" onClick={() => onSelectAgent(agent.id)} style={{ cursor: 'pointer', transition: 'all 0.2s', borderColor: agent.isDead ? 'rgba(239, 68, 68, 0.4)' : '' }}>
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
                  <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${agent.id}`} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', filter: agent.isDead ? 'grayscale(100%)' : 'none' }} />
                  <div>
                    <h2 style={{color: agent.isDead ? '#fca5a5' : 'inherit', margin: 0, fontSize: '1.2rem'}}>{agent.isDead ? '✝ ' : ''}{agent.name} {agent.id.includes('custom') ? <span style={{fontSize: '0.8rem', color: '#a78bfa'}}>(Custom)</span> : null}</h2>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chronological Age: {Math.floor(agent.age)} Years</span>
                  </div>
                </div>

                <div className="tag-container" style={{opacity: agent.isDead ? 0.6 : 1}}>
                  {agent.foodDesert && <span className="tag warning">Food Desert</span>}
                  {agent.wealth < 40 && <span className="tag warning">Low Income</span>}
                  <span className="tag" style={{background: 'rgba(139, 92, 246, 0.15)', color: '#bfdbfe', border: '1px solid rgba(139, 92, 246, 0.3)'}}>{agent.role}</span>
                  {agent.chronicConditions.map(cond => (
                    <span key={cond} className="tag danger">{cond}</span>
                  ))}
                  {agent.chronicConditions.length === 0 && !agent.foodDesert && agent.wealth >= 40 && (
                    <span className="tag" style={{background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399'}}>Stable</span>
                  )}
                </div>

                <div className="stats" style={{opacity: agent.isDead ? 0.4 : 1, display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                  <ProgressBar label="Health" value={agent.baseHealth} color={getHealthColor(agent.baseHealth)} />
                  <ProgressBar label="Stress" value={agent.stressLevel} color={getStressColor(agent.stressLevel)} />
                  <ProgressBar label="CV Health" value={agent.labs.cvHealth} color="var(--accent-color)" />
                </div>

                <div className="events-log" style={{opacity: agent.isDead ? 0.5 : 1}}>
                  {agent.history.length === 0 ? (
                    <p>No major events yet.</p>
                  ) : (
                    agent.history.slice(-2).reverse().map((ev, i) => (
                      <p key={i}>
                        <strong style={{color: ev.type.includes('Mortality') ? '#fca5a5' : ev.type.includes('Adoption') ? '#a78bfa' : '#60a5fa'}}>Wk {ev.tick} - {ev.type} | </strong> 
                        <span style={{ fontStyle: 'italic', color: '#e2e8f0', fontSize: '0.9rem', lineHeight: '1.4' }}>"ATTENDING NOTE: {ev.description}"</span>
                      </p>
                    ))
                  )}
                </div>
              </div>
            ))}
       </div>
       </>
      )}

      {subTab === 'analytics' && (
          <AnalyticsChatView />
      )}
    </div>
  );
};
