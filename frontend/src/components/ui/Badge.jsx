const styles = {
  income:   'bg-green-100 text-green-700',
  expense:  'bg-red-100 text-red-600',
  high:     'bg-red-100 text-red-700',
  medium:   'bg-yellow-100 text-yellow-700',
  low:      'bg-blue-100 text-blue-700',
};

export default function Badge({ variant = 'medium', label }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant] ?? styles.medium}`}>
      {label}
    </span>
  );
}
