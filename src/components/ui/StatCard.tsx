import type { FC, ReactNode } from 'react';

interface Props {
  label: string;
  value: ReactNode;
  color: string;
}

export const StatCard: FC<Props> = ({ label, value, color }) => {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '2.5rem', fontWeight: '800', color }}>
        {value}
      </div>
    </div>
  );
};
