import { useState, useEffect } from 'react';
import type { FC } from 'react';
import type { AgentState } from '../simulation/Agent';
import { KnowledgeBase } from '../simulation/KnowledgeNetwork';
import { LLMEngine } from '../simulation/LLMEngine';
import avatarImg from '../assets/avatar.png';

interface Props {
  agents: AgentState[];
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

export const DashboardView: FC<Props> = ({ agents, onSelectAgent }) => {
  const [page, setPage] = useState(1);
  const [apiKey, setApiKey] = useState(LLMEngine.apiKey || '');
  const [provider, setProvider] = useState<any>(LLMEngine.provider);
  const itemsPerPage = 20;

  const handleSaveKey = () => {
    LLMEngine.setCredentials(provider, apiKey);
    alert(`${provider} Engine Authenticated and Secured! The digital twins will now prompt this network for protocol evaluations.`);
  };

  useEffect(() => {
    // If agents shrink below current page (e.g. extreme filtering later), clamp page
    const totalPages = Math.ceil(agents.length / itemsPerPage);
    if (page > totalPages && totalPages > 0) setPage(totalPages);
  }, [agents.length, page, itemsPerPage]);

  const total = agents.length;
  const active = agents.filter(a => !a.isDead).length;
  const survivalRate = total > 0 ? ((active / total) * 100).toFixed(1) : '0.0';
  
  const totalInteractions = KnowledgeBase.totalInteractions;
  const avgHealth = active > 0 ? (agents.filter(a => !a.isDead).reduce((acc, a) => acc + a.baseHealth, 0) / active).toFixed(1) : '0.0';

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const paginatedAgents = agents.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="dashboard-wrapper">
       {/* Generative AI Configuration */}
       <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🧠</span>
              <div>
                 <div style={{ fontWeight: 'bold', color: '#34d399', fontSize: '1.1rem' }}>Clinical Gen-AI Injection</div>
                 <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Authenticate an LLM to dynamically prompt the network. Your keys never leave your browser loop.</div>
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
       </div>

       {/* Analytics Banner */}
       <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {/* Voxel Avatar Block */}
          <div style={{ flexShrink: 0, width: '280px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(34, 211, 238, 0.3)', boxShadow: '0 0 40px rgba(34, 211, 238, 0.15)', position: 'relative' }}>
            <img src={avatarImg} alt="Digital Twin Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem 1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>Digital Patient Twin</div>
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
    </div>
  );
};
