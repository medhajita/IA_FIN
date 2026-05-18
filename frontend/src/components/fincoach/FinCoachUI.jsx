import { Search, X } from 'lucide-react';

export function Page({ children, className = '', style }) {
  return <div className={`fc-page ${className}`} style={style}>{children}</div>;
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="fc-page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="fc-header-actions">{actions}</div>}
    </header>
  );
}

export function Card({ children, className = '', padded = true, style }) {
  return <section className={`fc-card ${padded ? 'fc-card-pad' : ''} ${className}`} style={style}>{children}</section>;
}

export function CardHead({ title, subtitle, action, icon }) {
  return (
    <div className="fc-card-head">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        {icon}
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function MetricCard({ title, value, note, icon: Icon, tone = 'blue' }) {
  const colors = {
    blue: 'var(--fc-blue)',
    purple: 'var(--fc-purple)',
    green: 'var(--fc-green)',
    red: 'var(--fc-red)',
    orange: 'var(--fc-orange)',
  };

  return (
    <Card className="fc-metric" padded={false}>
      <div className="fc-metric-top">
        <span className="fc-metric-label">{title}</span>
        {Icon && (
          <span className="fc-metric-icon" style={{ color: colors[tone] }}>
            <Icon size={19} strokeWidth={2.2} />
          </span>
        )}
      </div>
      <strong className="fc-metric-value">{value}</strong>
      {note && <span className="fc-metric-note">{note}</span>}
    </Card>
  );
}

export function StatCard({ title, value, subtitle, trend, trendColor, icon: Icon, iconBg, iconColor }) {
  return (
    <Card className="fc-metric" padded={false}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        {Icon && (
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: iconBg || 'rgba(47,107,255,0.14)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={15} color={iconColor || 'var(--fc-blue)'} strokeWidth={1.85} />
          </div>
        )}
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--fc-muted)' }}>{title}</span>
      </div>
      <strong style={{ display: 'block', fontSize: 'clamp(16px, 1.6vw, 20px)', fontWeight: 900, color: 'var(--fc-text)', letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</strong>
      {(subtitle || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          {subtitle && <span style={{ fontSize: 11, color: 'var(--fc-muted)' }}>{subtitle}</span>}
          {trend && <span style={{ fontSize: 11, fontWeight: 700, color: trendColor || 'var(--fc-green)' }}>{trend}</span>}
        </div>
      )}
    </Card>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const classNameByVariant = {
    primary: 'fc-button',
    soft: 'fc-button-soft',
    danger: 'fc-button-danger',
    icon: 'fc-icon-button',
  };
  return <button className={`${classNameByVariant[variant] || classNameByVariant.primary} ${className}`} {...props}>{children}</button>;
}

export function Field({ label, children }) {
  return (
    <label className="fc-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Input(props) {
  return <input className="fc-input" {...props} />;
}

export function Select({ children, ...props }) {
  return <select className="fc-select" {...props}>{children}</select>;
}

export function Badge({ children, tone = 'blue' }) {
  return <span className={`fc-badge fc-badge-${tone}`}>{children}</span>;
}

export function Progress({ value }) {
  return (
    <div className="fc-progress">
      <span style={{ width: `${Math.max(0, Math.min(100, Number(value) || 0))}%` }} />
    </div>
  );
}

export function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fc-modal-backdrop" onClick={onClose}>
      <section className="fc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fc-modal-head">
          <h2>{title}</h2>
          <Button variant="icon" onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={2.2} />
          </Button>
        </div>
        <div className="fc-modal-body">{children}</div>
      </section>
    </div>
  );
}

export function Skeleton({ rows = 4 }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {Array.from({ length: rows }).map((_, index) => <div className="fc-skeleton" key={index} />)}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <Card className="fc-empty">
      <div>
        {Icon && (
          <span className="fc-item-icon" style={{ width: 56, height: 56, margin: '0 auto 16px', color: 'var(--fc-blue)' }}>
            <Icon size={28} strokeWidth={2.2} />
          </span>
        )}
        <h2 style={{ margin: '0 0 8px', color: 'var(--fc-text)' }}>{title}</h2>
        {text && <p style={{ margin: '0 auto 18px', maxWidth: 420 }}>{text}</p>}
        {action}
      </div>
    </Card>
  );
}

export function GlobalSearch({ placeholder = 'Search everywhere...' }) {
  return (
    <label className="fc-search">
      <Search size={18} color="var(--fc-muted)" />
      <input placeholder={placeholder} />
    </label>
  );
}
