import type { FC } from 'react';

interface Props {
  label: string;
  value: number;
  color: string;
}

export const ProgressBar: FC<Props> = ({ label, value, color }) => {
  return (
    <div className="stat-row">
      <div className="stat-label-row">
        <span>{label}</span>
        <span>{Math.round(value)}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};
