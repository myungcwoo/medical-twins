import type { FC, ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSimulationStore } from '../../store/useSimulationStore';

// Reusing inline SVGs for layout icons
const BrainIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>;

interface MainLayoutProps {
  children: ReactNode;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const MainLayout: FC<MainLayoutProps> = ({
  children,
  isMobileMenuOpen, setIsMobileMenuOpen
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    ticks, isRunning, isFastForwarding, fastForwardYears, setFastForwardYears,
    autoResume, setAutoResume, handleFastForward, setIsRunning, setIsEnded, isEnded,
    handleSaveSimulation, handleReset 
  } = useSimulationStore();

  const formatTime = (t: number) => {
    const years = Math.floor(t / 52);
    const weeks = t % 52;
    return `Week ${t} (Year ${years}.${Math.floor((weeks/52)*10)})`;
  };

  return (
    <div className="layout-wrapper">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #3b82f6' } }} />
      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar Navigation */}
      <nav className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo cursor-pointer" onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}>
            <div className="logo-icon" style={{color: '#60a5fa'}}><BrainIcon /></div>
            <div className="logo-text">
              <h1>Clinical AI</h1>
              <p>Digital Patient Studio</p>
            </div>
          </div>
          <button className="mobile-menu-btn close" onClick={() => setIsMobileMenuOpen(false)}>×</button>
        </div>

        <div style={{ padding: '0.75rem', margin: '0 1rem 1rem 1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
           <p style={{ color: '#fca5a5', fontSize: '0.7rem', lineHeight: 1.4, margin: 0, textAlign: 'center' }}>
             <strong>EXPLORATORY ONLY:</strong> Clinical AI Studio is an AI-powered theoretical simulation. It is <strong>NOT</strong> a diagnostic tool and does not provide real recommendations for people to take action on.
           </p>
        </div>

        <div className="sidebar-nav">
          <span className="nav-group-title">PRIMARY WORKSPACES</span>
          <NavLink to="/dashboard" className={({isActive}) => `sidebar-btn ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
            ⚡ Command Center
          </NavLink>

          <NavLink to="/agent-hub" className={({isActive}) => `sidebar-btn ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
            🧠 Clinical Agents Hub
          </NavLink>
          
          <NavLink to="/network" className={({isActive}) => `sidebar-btn ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
            ⚙️ LLM Knowledge Maps
          </NavLink>

          <NavLink to="/consumer-wizard" className={({isActive}) => `sidebar-btn ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
            👨🏽‍⚕️ Simulate Me
          </NavLink>

          <span className="nav-group-title">DATA & MODELING</span>
          <NavLink to="/timeline" className={({isActive}) => `sidebar-btn ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
            📊 Clinical Evidence
          </NavLink>
          
          <NavLink to="/training" className={({isActive}) => `sidebar-btn ${isActive || location.pathname === '/backend-train' ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
            ☄ Edge RWD Training
          </NavLink>
          
          <NavLink to="/ingestion" className={({isActive}) => `sidebar-btn ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
            🧬 Data Ingestion
          </NavLink>

          <span className="nav-group-title">DOCUMENTATION</span>
          <NavLink to="/explanation" className={({isActive}) => `sidebar-btn ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
            💻 How It Works
          </NavLink>
          
          <NavLink to="/algorithms" className={({isActive}) => `sidebar-btn ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
            🧮 Algorithmic Engine
          </NavLink>

          <NavLink to="/dev-docs" className={({isActive}) => `sidebar-btn ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
            📚 Architecture Specs
          </NavLink>
          
          <NavLink to="/faq" className={({isActive}) => `sidebar-btn ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
            ❓ Read FAQ
          </NavLink>

          <NavLink to="/release-notes" className={({isActive}) => `sidebar-btn ${isActive ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
            📝 Release Notes
          </NavLink>
        </div>
      </nav>

      {/* Main Content Viewport */}
      <main className="main-content-area">
        
        {/* Top Header Island */}
        <div className="top-island">
          <div className="island-controls">
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>☰</button>
            <div className="tag warning" style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
               <span style={{ fontSize: '0.6rem' }}>●</span> GLOBAL SANDBOX LIVE <span className={`pulse ${!isRunning ? 'paused' : ''}`}></span>
            </div>
            
            {!isEnded ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem', flexWrap: 'wrap' }}>
                <span className="tick-counter glowing-text">Global Clock: {formatTime(ticks)}</span>
                
                <button className={`btn ${isRunning ? 'btn-warning' : 'btn-primary'}`} onClick={() => setIsRunning(!isRunning)}>
                  {isRunning ? '⏸ Pause' : '▶ Start'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,0,0,0.4)', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                   <select className="input-field" value={fastForwardYears} onChange={e => setFastForwardYears(Number(e.target.value))} style={{ padding: '0.3rem', width: 'auto', border: 'none', background: 'transparent' }}>
                      <option value={5} style={{background:'#1e293b'}}>5 YRS</option>
                      <option value={10} style={{background:'#1e293b'}}>10 YRS</option>
                      <option value={15} style={{background:'#1e293b'}}>15 YRS</option>
                      <option value={20} style={{background:'#1e293b'}}>20 YRS</option>
                   </select>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: '#94a3b8', cursor: 'pointer', margin: '0 0.5rem' }}>
                     <input type="checkbox" checked={autoResume} onChange={e => setAutoResume(e.target.checked)} style={{cursor: 'pointer'}} />
                     Auto-Resume
                   </label>
                   <button 
                     className="btn btn-warning" 
                     onClick={handleFastForward}
                     disabled={isFastForwarding}
                     style={{ animation: isFastForwarding ? 'pulseGlow 1s infinite' : 'none' }}
                   >
                     {isFastForwarding ? '⏱ Skipping...' : '⏩ Skip'}
                   </button>
                </div>

                <button onClick={() => { setIsRunning(false); setIsEnded(true); }} className="btn btn-danger">⏹ End Simulation</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
                <div className="tag danger">
                  Terminated
                </div>
                {location.pathname !== '/report' && (
                    <button onClick={() => navigate('/report')} className="btn btn-outline" style={{ animation: 'pulseGlow 2s infinite', borderColor: '#ef4444', color: '#fca5a5' }}>
                        View Terminated Report
                    </button>
                )}
                <button onClick={handleReset} className="btn btn-primary">Reset</button>
                <button onClick={handleSaveSimulation} className="btn btn-success">Save Data</button>
              </div>
            )}
          </div>
        </div>

        <div className="main-content">
          {children}
        </div>
      </main>
    </div>
  );
};
