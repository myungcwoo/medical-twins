import type { FC } from 'react';
import type { AgentState } from '../simulation/Agent';

interface Props {
  agents: AgentState[];
  ticks: number;
}

export const PopulationHeatmap: FC<Props> = ({ agents }) => {
  // Separate into cohorts if applicable
  const controls = agents.filter(a => a.comparativeGroup === 'Control');
  const interventions = agents.filter(a => a.comparativeGroup === 'Intervention');
  
  // Downsample ticks: Extract unique ticks from all biometric histories, sort them
  const allTicks = new Set<number>();
  agents.forEach(a => a.biometricHistory.forEach(b => allTicks.add(Math.floor(b.tick / 4) * 4))); // Bin by 4 weeks (1 month)
  const sortedTicks = Array.from(allTicks).sort((a,b) => a-b);

  const getColor = (health: number, isDead: boolean) => {
    if (isDead) return '#000000'; 
    // Emerald: hsl(150, 80%, 45%), Amber: hsl(40, 90%, 50%), Crimson: hsl(0, 85%, 60%)
    // Interpolate health from 0 to 100 -> hue from 0 to 150
    const hue = Math.max(0, (health / 100) * 150);
    return `hsl(${hue}, 80%, 45%)`;
  };

  const renderGrid = (agentGroup: AgentState[], title: string, colorBlock: string) => {
    if (agentGroup.length === 0) return null;
    
    return (
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: colorBlock, borderBottom: `1px solid ${colorBlock}40`, paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: colorBlock, borderRadius: '2px' }}></span>
           {title} Cohort ({agentGroup.length})
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: `80px repeat(${sortedTicks.length}, 1fr)`,
          gap: '2px',
          overflowX: 'auto',
          background: 'rgba(0,0,0,0.4)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
        }}>
          {/* Header Row */}
          <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'flex-end', paddingBottom: '4px' }}>Agent ID</div>
          {sortedTicks.map(t => (
             <div key={`th-${t}`} style={{ fontSize: '0.6rem', color: '#64748b', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Wk {t}</div>
          ))}

          {/* Rows */}
          {agentGroup.map(agent => {
             // Find death tick (if any)
             const deathEvent = agent.history.find(h => h.type.includes('Mortality'));
             const deathTick = deathEvent ? deathEvent.tick : Infinity;

             return (
               <div key={agent.id} style={{ display: 'contents' }}>
                 <div style={{ fontSize: '0.75rem', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', paddingRight: '0.5rem' }}>
                   {agent.name.split(' ')[0]} {/* First name or ID */}
                 </div>
                 
                 {sortedTicks.map((t, index) => {
                    // Get closest snap on or before tick 
                    let s = null;
                    for (let i = agent.biometricHistory.length - 1; i >= 0; i--) {
                        if (agent.biometricHistory[i].tick <= t + 3 && agent.biometricHistory[i].tick >= t) {
                            s = agent.biometricHistory[i];
                            break;
                        }
                    }
                    if (!s && agent.biometricHistory.length > 0) {
                        s = agent.biometricHistory[agent.biometricHistory.length-1];
                    }

                    const isDeadAtTick = agent.isDead && (t >= deathTick);
                    const health = s && !isDeadAtTick ? s.health : (isDeadAtTick ? 0 : 100);
                    const bg = getColor(health, isDeadAtTick);

                    // Find events in this window for tooltip
                    const windowEvents = agent.history.filter(h => h.tick >= (index === 0 ? 0 : sortedTicks[index-1]) && h.tick <= t);
                    const eventStr = windowEvents.length > 0 ? `\nEvents: ${windowEvents.map(e => e.type).join(', ')}` : '';

                    return (
                      <div 
                        key={`c-${agent.id}-${t}`} 
                        title={`${agent.name} - Wk ${t}\nHealth: ${Math.round(health)}%\nAge: ${Math.round(s?.age || agent.age)}${eventStr}`}
                        style={{
                          background: bg,
                          height: '16px',
                          borderRadius: '2px',
                          cursor: 'crosshair',
                          opacity: isDeadAtTick ? 0.3 : 1,
                          transition: 'background 0.2s, opacity 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.2)';
                            e.currentTarget.style.zIndex = '10';
                            e.currentTarget.style.border = '1px solid white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.zIndex = '1';
                            e.currentTarget.style.border = 'none';
                        }}
                      />
                    )
                 })}
               </div>
             )
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in" style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
       <h3 style={{ margin: '0 0 0.5rem 0', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
         <span>🔥</span> High-Fidelity Biological Heatmap
       </h3>
       <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
         Visualizing the chronological mortality trajectory of all {agents.length} agents simultaneously. 
         Color mapping traces precise Health % (Emerald to Crimson to Black). Hover over individual cells to inspect point-in-time health metrics.
       </p>
       
       {controls.length > 0 || interventions.length > 0 ? (
         <>
           {renderGrid(controls, 'Unoptimized Base', '#60a5fa')}
           {renderGrid(interventions, 'AI-Protocoled', '#10b981')}
         </>
       ) : (
         renderGrid(agents, 'Full Simulation', '#e2e8f0')
       )}
    </div>
  );
};
