import type { FC } from 'react';
import { KnowledgeBase } from '../simulation/KnowledgeNetwork';

export const NetworkFeed: FC<{ ticks: number }> = ({ ticks }) => {
  // We strictly create a new array to .reverse() to prevent mutating the global singleton organically
  const events = [...KnowledgeBase.globalFeed].reverse();
  const broadcasts = [...KnowledgeBase.broadcasts];

  // Calculate Dynamic Population Trends
  const trendMap = broadcasts.reduce((acc, b) => {
    if (!acc[b.template.title]) {
      acc[b.template.title] = {
        title: b.template.title,
        source: b.template.source,
        adoptions: 0,
        failures: 0,
        healthImpact: b.template.impact.healthDelta,
        bpImpact: b.template.impact.bpDelta
      };
    }
    return acc;
  }, {} as Record<string, { title: string; source: string; adoptions: number; failures: number; healthImpact: number; bpImpact: number; }> );

  events.forEach(ev => {
    if (ev.ideaTitle && trendMap[ev.ideaTitle]) {
      if (ev.action === 'Adopted') trendMap[ev.ideaTitle].adoptions++;
      if (ev.action === 'Failed Adoption') trendMap[ev.ideaTitle].failures++;
    }
  });

  const sortedTrends = Object.values(trendMap)
    .filter(t => (t.adoptions + t.failures) > 0)
    .sort((a, b) => (b.adoptions + b.failures) - (a.adoptions + a.failures))
    .slice(0, 3);

  return (
    <div className="timeline-container">
      <div className="timeline-content glass-panel" style={{ height: '70vh', padding: '2rem' }}>
        <h2 style={{ color: '#60a5fa', marginTop: 0, marginBottom: '0.5rem' }}>Global Intelligence Network</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Digital Twins are actively researching external literature (JAMA, Reddit) and AI-generated strategies, transferring actionable protocols to one another in real-time. Current Active Tick: {ticks}
        </p>

        {/* Global Protocol Analytics Summary */}
        {sortedTrends.length > 0 && (
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#e2e8f0', fontSize: '1.1rem' }}>Top Circulating Protocols Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              {sortedTrends.map((trend, i) => {
                const totalAttempts = trend.adoptions + trend.failures;
                const successRate = totalAttempts > 0 ? ((trend.adoptions / totalAttempts) * 100).toFixed(0) : 0;
                
                return (
                  <div key={i} style={{ background: 'var(--panel-bg)', padding: '1rem', borderRadius: '6px', borderLeft: `3px solid ${trend.healthImpact >= 0 ? '#10b981' : '#f59e0b'}` }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.5rem', color: '#e2e8f0' }}>{trend.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Source: <span style={{color: '#a78bfa'}}>{trend.source}</span></span>
                      <span style={{color: Number(successRate) > 50 ? '#34d399' : '#fca5a5'}}>{successRate}% Efficacy Rate</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      Biological Offsets: <span style={{color: trend.healthImpact >= 0 ? '#34d399' : '#fca5a5'}}>Health {trend.healthImpact > 0 ? '+' : ''}{trend.healthImpact}</span>
                      {trend.bpImpact !== 0 && <span style={{color: trend.bpImpact <= 0 ? '#34d399' : '#fca5a5'}}> | BP {trend.bpImpact > 0 ? '+' : ''}{trend.bpImpact}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {events.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>Detecting radio silence. Awaiting first Researcher or WebSurfer broadcast...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {events.map((ev, i) => {
              const bColor = ev.action === 'Broadcasted' ? 'rgba(139, 92, 246, 0.15)' : ev.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
              const txtColor = ev.action === 'Broadcasted' ? '#a78bfa' : ev.success ? '#10b981' : '#fca5a5';
              const bdColor = ev.action === 'Broadcasted' ? 'var(--accent-color)' : ev.success ? '#10b981' : '#ef4444';

              return (
                <div key={i} style={{ 
                  background: bColor, 
                  borderLeft: `4px solid ${bdColor}`, 
                  padding: '1.2rem', 
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <span><strong>{ev.agentName} | <span style={{color: ev.agentRole === 'Researcher' ? '#60a5fa' : ev.agentRole === 'WebSurfer' ? '#f59e0b' : '#94a3b8'}}>{ev.agentRole}</span></strong></span>
                    <span>Week {ev.tick}</span>
                  </div>

                  <div style={{ fontSize: '1.05rem', color: '#e2e8f0' }}>
                    {ev.action === 'Broadcasted' && (
                      <><span role="img" aria-label="shout">📢</span> <strong>Broadcasted Findings:</strong> Found a {ev.ideaTitle} protocol via {ev.source}. Uploading to network...</>
                    )}
                    {ev.action === 'Adopted' && (
                      <><span role="img" aria-label="success">✅</span> <strong>Adopted Protocol:</strong> Executed {ev.ideaTitle} read from {ev.source}.</>
                    )}
                    {ev.action === 'Failed Adoption' && (
                      <><span role="img" aria-label="error">❌</span> <strong>Rejected Protocol:</strong> Attempted {ev.ideaTitle}.</>
                    )}
                  </div>

                  {ev.action !== 'Broadcasted' && (
                    <div style={{ fontSize: '0.95rem', color: txtColor, fontWeight: '500' }}>
                      Result: {ev.resultString}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
