import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const styles = {
  success: { bg: 'bg-green-50 border-green-200 text-green-800', Icon: CheckCircle },
  error:   { bg: 'bg-red-50 border-red-200 text-red-800',       Icon: AlertCircle },
  warning: { bg: 'bg-yellow-50 border-yellow-200 text-yellow-800', Icon: AlertTriangle },
  info:    { bg: 'bg-blue-50 border-blue-200 text-blue-800',     Icon: Info },
};

export default function Alert({ type = 'info', message, onClose }) {
  const { bg, Icon } = styles[type] ?? styles.info;
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm ${bg}`}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
