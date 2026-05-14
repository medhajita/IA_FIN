import { useEffect, useState } from 'react';

const colors = {
  indigo: 'bg-indigo-600',
  green:  'bg-green-500',
  red:    'bg-red-500',
};

export default function ProgressBar({
  value = 0,
  color = 'indigo',
  label,
  showPercentage = false,
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(clamped), 50);
    return () => clearTimeout(t);
  }, [clamped]);

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-gray-600">{label}</span>}
          {showPercentage && <span className="text-xs font-medium text-gray-700">{clamped.toFixed(0)}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-700 ease-out ${colors[color] ?? colors.indigo}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
