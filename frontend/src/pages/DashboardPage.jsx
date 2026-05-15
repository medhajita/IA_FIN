import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip,
  AreaChart, Area, ResponsiveContainer,
} from 'recharts';
import {
  Upload, PlayCircle, TrendingUp, TrendingDown,
  Wallet, PiggyBank, Sparkles, AlertCircle, Activity,
  ShoppingBasket, Car, RefreshCw, Ticket, HeartPulse, Home,
  MinusCircle, Banknote, ArrowUpCircle,
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Alimentation':   { icon: ShoppingBasket, bg: 'var(--green-bg)',  color: 'var(--green)'  },
  'Transport':      { icon: Car,            bg: 'var(--blue-bg)',   color: 'var(--blue)'   },
  'Abonnements':    { icon: RefreshCw,      bg: 'var(--purple-bg)', color: 'var(--purple)' },
  'Loisirs':        { icon: Ticket,         bg: 'var(--orange-bg)', color: 'var(--orange)' },
  'Santé':          { icon: HeartPulse,     bg: 'var(--red-bg)',    color: 'var(--red)'    },
  'Logement':       { icon: Home,           bg: 'var(--teal-bg)',   color: 'var(--teal)'   },
  'Autre dépense':  { icon: MinusCircle,    bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)' },
  'Salaire':        { icon: Banknote,       bg: 'var(--green-bg)',  color: 'var(--green)'  },
  'Autre revenu':   { icon: ArrowUpCircle,  bg: 'var(--green-bg)',  color: 'var(--green)'  },
};
import StatCard from '../components/ui/StatCard';
import Spinner from '../components/ui/Spinner';
import IconBox from '../components/ui/IconBox';
import { getSummary, getByCategory, getMonthlyEvolution } from '../services/dashboardService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const REC_CONFIG = {
  high:   { bg: 'var(--red-bg)',    text: 'var(--red-text)',    label: 'Urgent' },
  medium: { bg: 'var(--orange-bg)', text: 'var(--orange-text)', label: 'Attention' },
  low:    { bg: 'var(--blue-bg)',   text: 'var(--blue-text)',   label: 'Info' },
};

function fmt(amount) {
  return Number(amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}
function fmtDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR');
}
function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
const MONTH_NAMES = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];

export default function DashboardPage() {
  const [month, setMonth] = useState(currentMonth());
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [evolution, setEvolution] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seeding, setSeeding] = useState(false);
  const { login } = useAuth();

  useEffect(() => { fetchAll(month); }, [month]);

  async function fetchAll(m) {
    setLoading(true);
    setError('');
    try {
      // Fast DB calls only — AI endpoint runs independently so it never blocks the page
      const [sumRes, catRes, evoRes, txnRes] = await Promise.all([
        getSummary(m),
        getByCategory(m),
        getMonthlyEvolution(),
        api.get('/transactions', { params: { type: undefined } }),
      ]);
      setSummary(sumRes.data.data);
      setCategories(catRes.data.data.categories);
      setEvolution(evoRes.data.data.evolution.map((e) => ({
        ...e,
        monthLabel: MONTH_NAMES[parseInt(e.month.split('-')[1]) - 1],
      })));
      setRecentTxns(txnRes.data.data.transactions.slice(0, 5));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
    // Recommendations: AI call fires independently, page is already visible by the time it resolves
    setRecLoading(true);
    api.get('/recommendations')
      .then(r => setRecommendations(r.data.data.recommendations))
      .catch(() => {})
      .finally(() => setRecLoading(false));
  }

  async function loadDemo() {
    setSeeding(true);
    try {
      const res = await api.post('/demo/seed');
      const { token, user } = res.data.data;
      login(token, user);
      fetchAll('2025-10');
      setMonth('2025-10');
    } catch (err) {
      setError(err.response?.data?.error || 'Demo seed failed');
    } finally {
      setSeeding(false);
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
        {/* Header skeleton */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--bg-tertiary)', animation: 'shimmer 1.4s ease-in-out infinite' }} />
            <div>
              <div style={{ width: 120, height: 20, borderRadius: 6, background: 'var(--bg-tertiary)', animation: 'shimmer 1.4s ease-in-out infinite', marginBottom: 8 }} />
              <div style={{ width: 200, height: 14, borderRadius: 6, background: 'var(--bg-tertiary)', animation: 'shimmer 1.4s ease-in-out infinite' }} />
            </div>
          </div>
          <div style={{ width: 140, height: 38, borderRadius: 20, background: 'var(--bg-tertiary)', animation: 'shimmer 1.4s ease-in-out infinite' }} />
        </div>
        {/* Stat cards skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card" style={{ height: 88 }}>
              <div style={{ width: 80, height: 12, borderRadius: 4, background: 'var(--bg-tertiary)', animation: 'shimmer 1.4s ease-in-out infinite', marginBottom: 14 }} />
              <div style={{ width: '70%', height: 28, borderRadius: 6, background: 'var(--bg-tertiary)', animation: 'shimmer 1.4s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
        {/* Charts skeleton */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="card" style={{ height: 280 }}>
              <div style={{ width: 140, height: 16, borderRadius: 4, background: 'var(--bg-tertiary)', animation: 'shimmer 1.4s ease-in-out infinite', marginBottom: 20 }} />
              <div style={{ height: 220, borderRadius: 8, background: 'var(--bg-tertiary)', animation: 'shimmer 1.4s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
        {/* Transactions skeleton */}
        <div className="card">
          <div style={{ width: 160, height: 16, borderRadius: 4, background: 'var(--bg-tertiary)', animation: 'shimmer 1.4s ease-in-out infinite', marginBottom: 16 }} />
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-tertiary)', flexShrink: 0, animation: 'shimmer 1.4s ease-in-out infinite' }} />
              <div style={{ flex: 1 }}>
                <div style={{ width: '50%', height: 13, borderRadius: 4, background: 'var(--bg-tertiary)', animation: 'shimmer 1.4s ease-in-out infinite', marginBottom: 6 }} />
                <div style={{ width: '30%', height: 11, borderRadius: 4, background: 'var(--bg-tertiary)', animation: 'shimmer 1.4s ease-in-out infinite' }} />
              </div>
              <div style={{ width: 70, height: 16, borderRadius: 4, background: 'var(--bg-tertiary)', animation: 'shimmer 1.4s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentTxns.length === 0 && summary?.transactionCount === 0) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: 340, width: '100%', padding: 40 }}>
          <IconBox icon={Upload} bgColor="var(--blue-bg)" iconColor="var(--blue)" size="lg" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '16px 0 8px' }}>No data yet</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Import your first CSV to see your dashboard.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/transactions" className="btn-primary" style={{ justifyContent: 'center', textDecoration: 'none' }}>
              <Upload size={15} strokeWidth={1.75} />
              Import CSV
            </Link>
            <button onClick={loadDemo} disabled={seeding} className="btn-ghost">
              <PlayCircle size={15} strokeWidth={1.75} />
              {seeding ? 'Loading…' : 'Load demo data'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        {/* Left: icon + title + live badge + subtitle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 13, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--blue) 0%, #7EB0FF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(74,124,246,0.30)',
          }}>
            <Activity size={22} color="#fff" strokeWidth={1.75} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
                Dashboard
              </h1>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'var(--green-bg)', color: 'var(--green-text)',
                fontSize: 12, fontWeight: 600, padding: '3px 9px',
                borderRadius: 'var(--radius-tag)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
                Live
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '3px 0 0' }}>
              Your financial overview at a glance
            </p>
          </div>
        </div>

        {/* Right: period selector */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          border: '1px solid var(--border)', borderRadius: 'var(--radius-tag)',
          padding: '8px 16px', background: 'var(--bg-primary)',
          boxShadow: 'var(--card-shadow)',
        }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Period</span>
          <input
            type="month" value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{
              border: 'none', background: 'transparent', fontSize: 13,
              fontWeight: 600, color: 'var(--text-primary)', outline: 'none',
              fontFamily: 'inherit', cursor: 'pointer',
            }}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard title="Total Income"    value={fmt(summary.totalIncome)}    subtitle="This month" icon={TrendingUp}   iconBg="var(--green-bg)"  iconColor="var(--green)" />
        <StatCard title="Total Expenses"  value={fmt(summary.totalExpenses)}  subtitle="This month" icon={TrendingDown} iconBg="var(--red-bg)"    iconColor="var(--red)" />
        <StatCard title="Balance"         value={fmt(summary.balance)}        subtitle="This month" icon={Wallet}       iconBg="var(--blue-bg)"   iconColor="var(--blue)" />
        <StatCard title="Savings Rate"    value={`${summary.savingsRate}%`}   subtitle="This month" icon={PiggyBank}    iconBg="var(--purple-bg)" iconColor="var(--purple)" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>

        {/* Pie */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>Expenses by Category</h3>
          {categories.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, fontSize: 13, color: 'var(--text-tertiary)' }}>
              No expenses this month
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categories} dataKey="total" nameKey="categoryName" cx="50%" cy="50%" outerRadius={80}>
                    {categories.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <PieTooltip
                    formatter={(value, name) => [fmt(value), name]}
                    contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginTop: 12 }}>
                {categories.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', minWidth: 0 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{c.categoryName}</span>
                    <span style={{ flexShrink: 0, fontWeight: 500, color: 'var(--text-primary)' }}>{c.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bar */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>Monthly Evolution</h3>
          {evolution.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, fontSize: 13, color: 'var(--text-tertiary)' }}>
              No data for the last 6 months
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={evolution} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(v) => `${v}€`} />
                <BarTooltip
                  formatter={(value, name) => [fmt(value), name === 'income' ? 'Income' : 'Expenses']}
                  contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12, background: 'var(--bg-primary)', color: 'var(--text-primary)', boxShadow: 'none' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="income"   name="income"   fill="var(--green)" radius={[4,4,0,0]} />
                <Bar dataKey="expenses" name="expenses" fill="var(--red)"   radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Savings Rate chart */}
      {evolution.length > 0 && (() => {
        const srData = evolution.map((e) => ({
          monthLabel: e.monthLabel,
          rate: e.income > 0 ? parseFloat(((e.income - e.expenses) / e.income * 100).toFixed(1)) : 0,
        }));
        return (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <IconBox icon={PiggyBank} bgColor="var(--purple-bg)" iconColor="var(--purple)" size="sm" />
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Savings Rate Evolution
                </h3>
              </div>
              <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--purple)', letterSpacing: '-0.5px' }}>
                {summary.savingsRate}%
              </span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={srData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="srGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#5856D6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#5856D6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} tickFormatter={(v) => `${v}%`} axisLine={false} tickLine={false} domain={[0, 100]} />
                <BarTooltip
                  formatter={(value) => [`${value}%`, 'Savings Rate']}
                  contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12, background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
                <Area
                  type="monotone" dataKey="rate"
                  stroke="var(--purple)" strokeWidth={2}
                  fill="url(#srGrad)"
                  dot={{ r: 4, fill: 'var(--purple)', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: 'var(--purple)', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );
      })()}

      {/* Recommendations */}
      {recLoading ? (
        <div className="card">
          <div style={{ width: 180, height: 14, borderRadius: 4, background: 'var(--bg-tertiary)', animation: 'shimmer 1.4s ease-in-out infinite', marginBottom: 16 }} />
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ height: 44, borderRadius: 8, background: 'var(--bg-tertiary)', animation: 'shimmer 1.4s ease-in-out infinite', marginBottom: i === 0 ? 10 : 0 }} />
          ))}
        </div>
      ) : recommendations.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <IconBox icon={Sparkles} bgColor="var(--purple-bg)" iconColor="var(--purple)" size="sm" />
            <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Recommandations personnalisées</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recommendations.map((rec, i) => {
              const cfg = REC_CONFIG[rec.priority] || REC_CONFIG.low;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '12px 14px', borderRadius: 'var(--radius-sm)',
                  background: cfg.bg,
                }}>
                  <AlertCircle size={15} color={cfg.text} strokeWidth={2} style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                    {rec.message}
                  </p>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '2px 8px',
                    borderRadius: 'var(--radius-tag)', background: cfg.bg,
                    color: cfg.text, flexShrink: 0, border: `1px solid ${cfg.text}22`,
                  }}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Recent Transactions</h3>
          <Link to="/transactions" style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 500, textDecoration: 'none' }}>
            See all
          </Link>
        </div>
        {recentTxns.length === 0 ? (
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)', padding: '24px 0' }}>
            No transactions yet.
          </p>
        ) : (
          <div>
            {recentTxns.map((t, i) => {
              const catName = t.category?.name;
              const catCfg  = catName ? CATEGORY_ICONS[catName] : null;
              const CatIcon = catCfg?.icon;
              return (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                }}>
                  {/* Category icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: catCfg ? catCfg.bg : 'var(--bg-tertiary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {CatIcon
                      ? <CatIcon size={16} strokeWidth={1.75} color={catCfg.color} />
                      : <Wallet size={16} strokeWidth={1.75} color="var(--text-secondary)" />}
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.description}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                      {fmtDate(t.date)}
                      {catName && ` · ${catName}`}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 14, fontWeight: 600, flexShrink: 0,
                    color: t.type === 'income' ? 'var(--green)' : 'var(--red)',
                  }}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
