import { Target, TrendingDown, TrendingUp } from 'lucide-react';

const BARS = [38, 62, 48, 78, 55, 88, 72];

export default function AppMockup({ lang }) {
  const fr = lang === 'fr';
  return (
    <div className="auth-mockup">
      <div className="auth-mockup-chrome">
        <div className="auth-mockup-dots"><span /><span /><span /></div>
        <div className="auth-mockup-url">fincoach.app/dashboard</div>
      </div>
      <div className="auth-mockup-body">
        <div className="auth-mock-topbar">
          <span className="auth-mock-greeting">{fr ? 'Bonjour, Alice 👋' : 'Hello, Alice 👋'}</span>
          <div className="auth-mock-avatar">A</div>
        </div>

        <div className="auth-mock-balance">
          <span>{fr ? 'Solde disponible' : 'Available balance'}</span>
          <strong>1 358,27 €</strong>
          <div className="auth-mock-progress">
            <div className="auth-mock-progress-fill" style={{ width: '62%' }} />
          </div>
          <small>{fr ? '62% de votre objectif mensuel' : '62% of your monthly goal'}</small>
        </div>

        <div className="auth-mock-stats">
          <div className="auth-mock-stat-card green">
            <TrendingUp size={12} />
            <span>{fr ? 'Revenus' : 'Income'}</span>
            <strong>+3 250 €</strong>
          </div>
          <div className="auth-mock-stat-card red">
            <TrendingDown size={12} />
            <span>{fr ? 'Dépenses' : 'Expenses'}</span>
            <strong>-1 891 €</strong>
          </div>
          <div className="auth-mock-stat-card blue">
            <Target size={12} />
            <span>{fr ? 'Objectifs' : 'Goals'}</span>
            <strong>42%</strong>
          </div>
        </div>

        <div className="auth-mock-chart-area">
          <span className="auth-mock-chart-title">{fr ? 'Activité (7 jours)' : 'Activity (7 days)'}</span>
          <div className="auth-mock-bars">
            {BARS.map((h, i) => (
              <div key={i} className="auth-mock-bar-wrap">
                <div className="auth-mock-bar" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
        </div>

        <div className="auth-mock-txs">
          <div className="auth-mock-tx">
            <div className="auth-mock-tx-dot neg" />
            <span>{fr ? 'Supermarché' : 'Grocery'}</span>
            <strong className="neg">-87 €</strong>
          </div>
          <div className="auth-mock-tx">
            <div className="auth-mock-tx-dot pos" />
            <span>{fr ? 'Salaire' : 'Salary'}</span>
            <strong className="pos">+3 250 €</strong>
          </div>
          <div className="auth-mock-tx">
            <div className="auth-mock-tx-dot neg" />
            <span>Netflix</span>
            <strong className="neg">-17 €</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
