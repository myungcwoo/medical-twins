import { useState, useMemo, useEffect, useRef } from 'react';
import type { FC } from 'react';
import type { AgentState } from '../simulation/Agent';
import { KnowledgeBase } from '../simulation/KnowledgeNetwork';
import { LLMEngine } from '../simulation/LLMEngine';
import ForceGraph2D from 'react-force-graph-2d';

interface Props {
  agents: AgentState[];
  onSelectAgent: (id: string) => void;
  isRunning?: boolean;
  isFastForwarding?: boolean;
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

export const DashboardView: FC<Props> = ({ agents, onSelectAgent, isRunning, isFastForwarding }) => {
  const [page, setPage] = useState(1);
  const [subTab, setSubTab] = useState<'overview' | 'database'>('overview');
  const [hoverNode, setHoverNode] = useState<any>(null);
  const [apiKey, setApiKey] = useState(LLMEngine.apiKey || '');
  const [provider, setProvider] = useState<any>(LLMEngine.provider);
  const [targetModel, setTargetModel] = useState<string>(LLMEngine.activeModel || 'gemini-2.5-flash');
  const [llmEnabled, setLlmEnabled] = useState<boolean>(LLMEngine.isEnabled);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const itemsPerPage = 20;

  const handleSaveKey = () => {
    LLMEngine.setCredentials(provider, apiKey, targetModel);
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
              const ms = data.models.map((m: any) => m.name.replace('models/', '')).filter((n: string) => n.includes('gemini'));
              setAvailableModels(ms);
              if (ms.length > 0 && !ms.includes(targetModel)) {
                  setTargetModel(ms[0]);
              }
          } else {
              alert('Could not fetch models. Check your API Key.');
          }
      } catch (e) {
          alert("Failed to fetch models.");
      }
  };

  useEffect(() => {
    // If agents shrink below current page (e.g. extreme filtering later), clamp page
    const totalPages = Math.ceil(agents.length / itemsPerPage);
    if (page > totalPages && totalPages > 0) setPage(totalPages);
  }, [agents.length, page, itemsPerPage]);

  const total = agents.length;
  // High-Performance Physics Memoization
  // We strictly isolate both nodes and links into a single immutable reference.
  const graphRef = useRef<any>(null);
  const staticNodes = useMemo(() => {
     return agents.map(a => ({ id: a.id, health: a.baseHealth, isDead: a.isDead }));
  }, [agents.length]);

  // Draw topological paths dynamically based exclusively on exact peer-to-peer clinical adoptions!
  const liveLinks = useMemo(() => {
      const explicitTwinLinks = agents.filter(a => a.pairedTwinId).map(a => ({ source: a.id, target: a.pairedTwinId! }));
      
      if (explicitTwinLinks.length > 0) return explicitTwinLinks;

      // Map dynamic communication histories
      return agents.flatMap(a => (a.networkConnections || []).map(targetId => ({ source: a.id, target: targetId })));
  }, [agents, KnowledgeBase.totalInteractions]);

  const liveGraphData = useMemo(() => {
      return { nodes: staticNodes, links: liveLinks };
  }, [staticNodes, liveLinks]);

  // Silently mutate the underlying D3 node references so we don't break gravity layout constraints.
  // We explicitly trigger a canvas redraw using d3ReheatSimulation to reflect color/size changes.
  useEffect(() => {
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
  }, [agents, liveGraphData]);

  const active = agents.filter(a => !a.isDead).length;
  const survivalRate = total > 0 ? ((active / total) * 100).toFixed(1) : '0.0';
  
  const totalInteractions = KnowledgeBase.totalInteractions;
  const avgHealth = active > 0 ? (agents.filter(a => !a.isDead).reduce((acc, a) => acc + a.baseHealth, 0) / active).toFixed(1) : '0.0';

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const paginatedAgents = agents.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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
                    style={{
                        background: llmEnabled ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: llmEnabled ? '#fca5a5' : '#34d399',
                        border: `1px solid ${llmEnabled ? '#fca5a5' : '#34d399'}`,
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap'
                    }}
                 >
                    {llmEnabled ? 'Disable LLM Sandbox' : 'Enable LLM Sandbox'}
                 </button>
              </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select 
                value={provider} 
                onChange={(e) => setProvider(e.target.value)}
                style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '4px', fontSize: '0.95rem', outline: 'none', flex: 1, minWidth: '150px' }}
              >
                <option value="OpenAI">OpenAI (GPT-4o)</option>
                <option value="Gemini">Google Gemini</option>
                <option value="Claude">Anthropic Claude</option>
              </select>

              <input 
                type="password" 
                value={apiKey} 
                onChange={e => setApiKey(e.target.value)} 
                placeholder="Paste raw API token..." 
                style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '4px', flex: 2, minWidth: '200px', fontSize: '0.95rem' }} 
              />
              <button 
                onClick={handleSaveKey} 
                style={{ background: '#10b981', color: 'white', padding: '0.6rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', whiteSpace: 'nowrap' }}
              >
                Save
              </button>
          </div>

          {/* Dynamic Model Sub-Selection */}
          {provider === 'Gemini' && (
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button onClick={handleFetchModels} style={{ background: 'var(--panel-bg)', color: '#3b82f6', border: '1px solid currentColor', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                     Scan Authorized Models
                  </button>
                  {availableModels.length > 0 ? (
                      <select value={targetModel} onChange={e => setTargetModel(e.target.value)} style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '4px', flex: 1, minWidth: '200px' }}>
                          {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                  ) : (
                      <input type="text" value={targetModel} onChange={e => setTargetModel(e.target.value)} placeholder="Manual Override: e.g. gemini-2.5-flash" style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '4px', flex: 1, minWidth: '200px' }} />
                  )}
              </div>
          )}
       </div>

       {/* Analytics Banner */}
       <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {/* Live Force Graph Block */}
          <div style={{ flexShrink: 0, width: '280px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(139, 92, 246, 0.3)', boxShadow: '0 0 40px rgba(139, 92, 246, 0.15)', position: 'relative', background: '#000' }}>
             {(isRunning || isFastForwarding) ? (
                 <div style={{ width: '280px', height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.9)' }}>
                     <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid rgba(139, 92, 246, 0.2)', borderTopColor: '#8b5cf6', animation: 'spin 1s linear infinite' }}></div>
                     <div style={{ color: '#8b5cf6', fontWeight: 'bold', marginTop: '1.5rem', fontSize: '1rem', letterSpacing: '0.05em' }}>COMPUTING DATA</div>
                     <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center', padding: '0 1rem' }}>
                         Topology mapping suspended.<br/>Pause simulation to render.
                     </div>
                 </div>
             ) : (
                 <ForceGraph2D 
                    ref={graphRef}
                    width={280}
                    height={280}
                    backgroundColor="#000000"
                    graphData={liveGraphData}
                    // Interactive visual node sizing (significantly smaller for navigation)
                    nodeVal={(node: any) => Math.max(0.5, (node.health || 50) / 40)}
                    nodeRelSize={3}
                    
                    // Artificially increase the invisible click/hover boundary for micro-nodes
                    nodePointerAreaPaint={(node: any, color: any, ctx: any) => {
                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI, false);
                        ctx.fill();
                    }}
                    
                    // Hover dynamics: Highlight the hovered node and its physical connections
                    nodeColor={(node: any) => {
                        if (hoverNode) {
                            if (node === hoverNode) return '#fbbf24'; // Active hover (gold)
                            
                            // Check if link exists between hoverNode and this node
                            const isConnected = liveGraphData.links.some((l: any) => 
                                (l.source.id === node.id && l.target.id === hoverNode.id) || 
                                (l.target.id === node.id && l.source.id === hoverNode.id) ||
                                (l.source === node.id && l.target === hoverNode.id) || 
                                (l.target === node.id && l.source === hoverNode.id)
                            );
                            
                            if (isConnected) return '#f472b6'; // Linked agents (pink highlight)
                            return 'rgba(255, 255, 255, 0.05)'; // Dim all non-related nodes heavily
                        }
                        return node.isDead ? 'rgba(239, 68, 68, 0.4)' : '#3b82f6';
                    }}
                    
                    // Edge highlighting
                    linkColor={(link: any) => {
                        if (hoverNode) {
                            const isLinkActive = (link.source.id === hoverNode.id || link.target.id === hoverNode.id) ||
                                                 (link.source === hoverNode.id || link.target === hoverNode.id);
                            return isLinkActive ? 'rgba(244, 114, 182, 0.8)' : 'rgba(255, 255, 255, 0.02)';
                        }
                        return 'rgba(139, 92, 246, 0.2)';
                    }}
                    linkWidth={(link: any) => {
                        if (hoverNode) {
                            const isLinkActive = (link.source.id === hoverNode.id || link.target.id === hoverNode.id) ||
                                                 (link.source === hoverNode.id || link.target === hoverNode.id);
                            return isLinkActive ? 2 : 1;
                        }
                        return 1;
                    }}
                    
                    // Rich interactive tooltips
                    nodeLabel={(node: any) => {
                        const live = agents.find(a => a.id === node.id);
                        if (!live) return '';
                        return `
                          <div style="background: rgba(15, 23, 42, 0.95); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.3); font-family: Inter, sans-serif; pointer-events: none; backdrop-filter: blur(4px);">
                            <div style="color: #60a5fa; font-weight: bold; font-size: 0.9rem; margin-bottom: 4px;">${live.name}</div>
                            <div style="color: #94a3b8; font-size: 0.75rem; text-transform: uppercase;">${live.role}</div>
                            <div style="margin-top: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8rem;">
                                <div><span style="color: #94a3b8">Health:</span> <span style="color: ${getHealthColor(live.baseHealth)}">${live.baseHealth.toFixed(1)}</span></div>
                                <div><span style="color: #94a3b8">Network:</span> <span style="color: white">${(live.networkConnections || []).length} connections</span></div>
                            </div>
                            ${live.isDead ? '<div style="color: #ef4444; font-size: 0.7rem; margin-top: 4px; font-weight: bold;">TERMINATED</div>' : ''}
                          </div>
                        `;
                    }}
                    
                    // Allow users to drill down by clicking
                    onNodeHover={(node) => setHoverNode(node)}
                    onNodeClick={(node) => {
                       onSelectAgent(node.id);
                       // Auto scroll up to the timeline viewer implicitly mapped
                       window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    
                    onEngineStop={() => {
                        if (liveGraphData && liveGraphData.nodes) {
                            liveGraphData.nodes.forEach((node: any) => {
                                if (node.x !== undefined && node.y !== undefined) {
                                    node.fx = node.x;
                                    node.fy = node.y;
                                }
                            });
                        }
                    }}
                 />
             )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem 1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', pointerEvents: 'none' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Knowledge Dispersion Graph</div>
            </div>
          </div>
          
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignContent: 'start' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #facc15' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Active Twins</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#facc15' }}>{active} <span style={{fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 'normal'}}>/ {total}</span></div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: `4px solid ${active > (total*0.5) ? '#10b981' : '#ef4444'}` }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Survival Rate</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: active > (total*0.5) ? '#10b981' : '#ef4444' }}>{survivalRate}%</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '4px solid #a78bfa' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Network Interactions</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#a78bfa' }}>{totalInteractions}</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: `4px solid ${getHealthColor(parseFloat(avgHealth))}` }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Avg Baseline Health</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: getHealthColor(parseFloat(avgHealth)) }}>{avgHealth}%</div>
            </div>
          </div>
       </div>
       </>
      )}

       {subTab === 'database' && (
        <>
        {/* Pagination Controls */}
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
         <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#e2e8f0' }}>Population Database</h2>
         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '0.5rem 1rem', background: 'var(--panel-bg)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: page === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>&lt; Prev</button>
           <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Page {page} of {totalPages}</span>
           <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '0.5rem 1rem', background: 'var(--panel-bg)', color: 'white', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>Next &gt;</button>
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

                <div className="stats" style={{opacity: agent.isDead ? 0.4 : 1}}>
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
                      <span>CV Health</span>
                      <span>{Math.round(agent.labs.cvHealth)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${agent.labs.cvHealth}%`, backgroundColor: 'var(--accent-color)' }} />
                    </div>
                  </div>
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
    </div>
  );
};
