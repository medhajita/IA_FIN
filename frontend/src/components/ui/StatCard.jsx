import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, subtitle, icon, trend }) {
  const trendPositive = trend > 0;
  const trendNeutral = trend === 0 || trend === undefined || trend === null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className="text-2xl ml-3 shrink-0">{icon}</div>
        )}
      </div>
      {!trendNeutral && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trendPositive ? 'text-green-600' : 'text-red-500'}`}>
          {trendPositive
            ? <TrendingUp className="w-3.5 h-3.5" />
            : <TrendingDown className="w-3.5 h-3.5" />}
          {trendPositive ? '+' : ''}{trend}% vs last month
        </div>
      )}
    </div>
  );
}
