import { TrendingUp, TrendingDown } from 'lucide-react';
import IconBox from './IconBox';

export default function StatCard({ title, value, subtitle, icon: Icon, iconBg, iconColor, trend }) {
  const trendNeutral = trend === 0 || trend === undefined || trend === null;
  const trendPositive = trend > 0;

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        {Icon && (
          <IconBox
            icon={Icon}
            bgColor={iconBg || 'var(--blue-bg)'}
            iconColor={iconColor || 'var(--blue)'}
            size="sm"
          />
        )}
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>{title}</p>
      </div>
      <div>
        <p style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </p>
        {subtitle && (
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>{subtitle}</p>
        )}
      </div>
      {!trendNeutral && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, marginTop: 12,
          fontSize: 12, fontWeight: 500,
          color: trendPositive ? 'var(--green)' : 'var(--red)',
        }}>
          {trendPositive
            ? <TrendingUp size={13} strokeWidth={2} />
            : <TrendingDown size={13} strokeWidth={2} />}
          {trendPositive ? '+' : ''}{trend}% vs last month
        </div>
      )}
    </div>
  );
}
