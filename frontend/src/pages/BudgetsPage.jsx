import { PieChart, Wallet } from 'lucide-react';
import IconBox from '../components/ui/IconBox';

export default function BudgetsPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <IconBox icon={PieChart} bgColor="var(--orange-bg)" iconColor="var(--orange)" size="md" />
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: 0 }}>
          Budgets
        </h1>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '64px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <IconBox icon={Wallet} bgColor="var(--orange-bg)" iconColor="var(--orange)" size="lg" />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
          Budget tracking — coming soon
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          Set monthly spending limits per category and track your progress in real time.
        </p>
      </div>
    </div>
  );
}
