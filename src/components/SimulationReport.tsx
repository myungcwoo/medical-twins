import type { FC } from 'react';
import type { AgentState } from '../simulation/Agent';
import { KnowledgeBase } from '../simulation/KnowledgeNetwork';

interface Props {
  agents: AgentState[];
  ticks: number;
}

export const SimulationReport: FC<Props> = ({ agents, ticks }) => {
  // --- 1. Top Level Epidemiology ---
  const total = agents.length;
  const alive = agents.filter(a => !a.isDead);
  const survivalRate = total > 0 ? ((alive.length / total) * 100).toFixed(1) : '0';

  // --- 2. Sub-population Mortality Extraction ---
  const getSubRate = (cond: string) => {
    const pool = agents.filter(a => a.chronicConditions.includes(cond));
    const numAlive = pool.filter(a => !a.isDead).length;
    return { 
      total: pool.length, 
      rate: pool.length > 0 ? ((numAlive / pool.length) * 100).toFixed(1) : 'N/A' 
    };
  };

  const chfStats = getSubRate('Congestive Heart Failure');
  const esrdStats = getSubRate('End-Stage Renal Disease');
  const copdStats = getSubRate('COPD');
  const esldStats = getSubRate('End-Stage Liver Disease');
  
  // --- 3. Multi-Agent Network Efficacy Extraction ---
  const trendMap = KnowledgeBase.broadcasts.reduce((acc, b) => {
    if (!acc[b.template.title]) {
      acc[b.template.title] = {
        title: b.template.title,
        source: b.template.source,
        adoptions: 0,
        failures: 0,
        healthImpact: b.template.impact.healthDelta
      };
    }
    return acc;
  }, {} as Record<string, { title: string; source: string; adoptions: number; failures: number; healthImpact: number; }> );

  KnowledgeBase.globalFeed.forEach(ev => {
    if (ev.ideaTitle && trendMap[ev.ideaTitle] && ev.action !== 'Broadcasted') {
      if (ev.success) trendMap[ev.ideaTitle].adoptions++;
      else trendMap[ev.ideaTitle].failures++;
    }
  });

  const allInterventions = Object.values(trendMap);
  const whatWorked = allInterventions.filter(t => t.adoptions > t.failures && t.healthImpact >= 0).sort((a,b) => b.adoptions - a.adoptions);
  const whatFailed = allInterventions.filter(t => t.failures > t.adoptions || t.healthImpact < 0).sort((a,b) => b.failures - a.failures);
  const totalConsidered = allInterventions.length;

  return (
    <div className="dashboard-wrapper">
      <div style={{ textAlign: 'center', marginBottom: '3rem', padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ fontSize: '3rem', color: '#e2e8f0', margin: '0 0 1rem 0' }}>Simulation Terminated</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>
          The chronological simulation ran for <strong>{ticks} Weeks</strong> ({Math.floor(ticks/52)} Years). Here is the comprehensive post-mortem epidemiological report of the cohort's clinical survival algorithms and the efficacy of their transferred multi-agent intelligence.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        {/* Global Survival */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ color: '#60a5fa', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Macro Survival Outcomes</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Aggregate Cohort Rate</span>
            <strong style={{ fontSize: '1.5rem', color: Number(survivalRate) > 50 ? '#10b981' : '#fca5a5' }}>{survivalRate}% Survival</strong>
          </div>
          
          <h3 style={{ color: '#e2e8f0', marginTop: '2rem', marginBottom: '1rem', fontSize: '1rem' }}>Critical Sub-Population Epidemiology:</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>Congestive Heart Failure ({chfStats.total} subjects)</span>
              <strong style={{ color: Number(chfStats.rate) > 50 ? '#34d399' : '#fca5a5' }}>{chfStats.rate}% Survived</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>ESRD Dialysis ({esrdStats.total} subjects)</span>
              <strong style={{ color: Number(esrdStats.rate) > 50 ? '#34d399' : '#fca5a5' }}>{esrdStats.rate}% Survived</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>End-Stage Liver Disease ({esldStats.total} subjects)</span>
              <strong style={{ color: Number(esldStats.rate) > 50 ? '#34d399' : '#fca5a5' }}>{esldStats.rate}% Survived</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
              <span>COPD / Pulmonology ({copdStats.total} subjects)</span>
              <strong style={{ color: Number(copdStats.rate) > 50 ? '#34d399' : '#fca5a5' }}>{copdStats.rate}% Survived</strong>
            </li>
          </ul>
        </div>

        {/* Intelligence Overview */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ color: '#a78bfa', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Network Intelligence Discovery</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Unique Protocols Evaluated</span>
            <strong style={{ fontSize: '1.5rem', color: '#a78bfa' }}>{totalConsidered} Discovered</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Total Network Adoptions</span>
            <strong style={{ fontSize: '1.5rem', color: '#a78bfa' }}>{KnowledgeBase.totalInteractions} Interactions</strong>
          </div>
          
          <h3 style={{ color: '#e2e8f0', marginTop: '2rem', marginBottom: '1rem', fontSize: '1rem', fontStyle: 'italic' }}>Conclusion on AI-Driven Communication:</h3>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
            {Number(survivalRate) > 50 
              ? 'The digital twins successfully leveraged cross-network knowledge transfers to mitigate raw biological decay. Highly compliant agent networks reliably intercepted lethal physiological thresholds earlier than isolated control analogs.'
              : 'Despite massive intelligence generation, the structural decay of the twin physiology superseded their ability to adopt and execute clinical rescue protocols safely, heavily favoring catastrophic mortality arcs.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>
        {/* What Worked */}
        <div className="glass-panel" style={{ padding: '2rem', borderTop: '4px solid #10b981' }}>
          <h2 style={{ color: '#10b981', margin: '0 0 1.5rem 0' }}>What Worked Effectively</h2>
          {whatWorked.length === 0 ? <p style={{ color: '#94a3b8' }}>No protocols achieved massive population success metrics.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {whatWorked.map((item, i) => {
                const totalAttempts = item.adoptions + item.failures;
                const effRate = ((item.adoptions / totalAttempts) * 100).toFixed(0);
                return (
                  <div key={i} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', borderLeft: '3px solid #10b981' }}>
                    <div style={{ fontWeight: 'bold', color: '#e2e8f0' }}>{item.title}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{item.adoptions} successful adoptions out of {totalAttempts} attempts ({effRate}% Efficacy). Originated via {item.source}.</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* What Failed */}
        <div className="glass-panel" style={{ padding: '2rem', borderTop: '4px solid #ef4444' }}>
          <h2 style={{ color: '#ef4444', margin: '0 0 1.5rem 0' }}>Failed & Toxic Interventions</h2>
          {whatFailed.length === 0 ? <p style={{ color: '#94a3b8' }}>No protocols actively collapsed the population demographics.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {whatFailed.map((item, i) => {
                const totalAttempts = item.adoptions + item.failures;
                const failRate = ((item.failures / totalAttempts) * 100).toFixed(0);
                return (
                  <div key={i} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
                    <div style={{ fontWeight: 'bold', color: '#e2e8f0' }}>{item.title}</div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rejected {item.failures} times out of {totalAttempts} network attempts ({failRate}% Failure Ratio). {item.healthImpact < 0 ? `Highly toxic (-Health offsets). originating via ${item.source}.` : `Extremely low compliance rate originating via ${item.source}.`}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
