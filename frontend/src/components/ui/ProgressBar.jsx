import { useEffect, useState } from 'react';

const colorMap = {
  indigo: 'var(--blue)',
  blue:   'var(--blue)',
  green:  'var(--green)',
  red:    'var(--red)',
  orange: 'var(--orange)',
  purple: 'var(--purple)',
};

export default function ProgressBar({ value = 0, color = 'indigo', label, showPercentage = false }) {
  const clamped = Math.min(100, Math.max(0, value));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(clamped), 50);
    return () => clearTimeout(t);
  }, [clamped]);

  const barColor = colorMap[color] || 'var(--blue)';

  return (
    <div style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          {label && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>}
          {showPercentage && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{clamped.toFixed(0)}%</span>}
        </div>
      )}
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${width}%`, background: barColor }} />
      </div>
    </div>
  );
}
