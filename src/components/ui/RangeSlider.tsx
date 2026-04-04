import type { FC, ReactNode } from 'react';

interface Props {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (val: number) => void;
  accentColor: string;
  rightLabel?: ReactNode;
  footer?: ReactNode;
  containerStyle?: React.CSSProperties;
}

export const RangeSlider: FC<Props> = ({ 
  label, value, min, max, step, onChange, accentColor, rightLabel, footer, containerStyle 
}) => {
  return (
    <div style={{ marginBottom: '1rem', ...containerStyle }}>
      <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
        <span>{label}</span>
        {rightLabel && <span>{rightLabel}</span>}
      </label>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={value} 
        onChange={e => onChange(parseFloat(e.target.value))} 
        style={{ width: '100%', accentColor }} 
      />
      {footer && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>{footer}</div>}
    </div>
  );
};
