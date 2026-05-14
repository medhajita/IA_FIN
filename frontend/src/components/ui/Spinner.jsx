const sizes = {
  sm: 'w-3.5 h-3.5 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-4',
};

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizes[size]} border-indigo-600 border-t-transparent rounded-full animate-spin`} />
    </div>
  );
}
