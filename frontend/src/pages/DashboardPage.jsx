import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { AlertCircle, ArrowDownRight, ArrowUpRight, PiggyBank, Plus, Sparkles, Wallet } from 'lucide-react';
import { getCategoryIcon } from '../utils/categoryIcons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { getByCategory, getSummary } from '../services/dashboardService';
import { Button, Card, CardHead, Field, Input, Modal, Select, StatCard, Page, PageHeader, Skeleton } from '../components/fincoach/FinCoachUI';
import { useFmt } from '../context/CurrencyContext';
import { useI18n } from '../context/I18nContext';
import { notifyDataChanged, subscribeDataChanged } from '../utils/dataEvents';
import { createTransaction } from '../services/transactionService';

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const categoryPalette = ['#f8bd00', '#ff3b30', '#ff7a1a', '#18b977', '#7657ff', '#2f6bff', '#6b7280'];

const REC_STYLES = {
  high:   { bg: 'rgba(255,59,48,0.10)',  text: '#ff3b30' },
  medium: { bg: 'rgba(255,122,26,0.10)', text: '#f97316' },
  low:    { bg: 'rgba(47,107,255,0.10)', text: '#2f6bff' },
};

function fmtDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}


export default function DashboardPage() {
  const fmt = useFmt();
  const { lang, t } = useI18n();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(true);
  const [recError, setRecError] = useState('');
  const [chartRange, setChartRange] = useState('1M');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', date: new Date().toISOString().slice(0, 10), type: 'expense', category_id: '' });
  const [saving, setSaving] = useState(false);

  const firstName = user?.first_name || user?.name?.split(' ')[0] || '';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, catRes, txRes] = await Promise.all([
        getSummary(),
        getByCategory(),
        api.get('/transactions'),
      ]);
      setSummary(sumRes.data.data);
      setCategories(catRes.data.data.categories);
      const allTxs = txRes.data.data.transactions || [];
      setAllTransactions(allTxs);
      setTransactions(allTxs.slice(0, 6));
    } finally {
      setLoading(false);
    }
    setRecLoading(true);
    setRecError('');
    api.get('/recommendations')
      .then((r) => {
        setRecommendations(r.data.data.recommendations || []);
      })
      .catch((err) => {
        setRecommendations([]);
        setRecError(err?.response?.data?.error || 'AI service unavailable. Please try again later.');
      })
      .finally(() => setRecLoading(false));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => subscribeDataChanged(load), [load]);

  const recents = transactions;
  async function saveTransaction(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createTransaction({ ...form, amount: Number(form.amount), category_id: form.category_id || undefined });
      setModalOpen(false);
      setForm({ description: '', amount: '', date: new Date().toISOString().slice(0, 10), type: 'expense', category_id: '' });
      const next = await load();
      notifyDataChanged({ source: 'transactions-create', transactionCount: next.length });
    } finally {
      setSaving(false);
    }
  }

  const allChartData = useMemo(() => {
    if (!allTransactions.length) return [];
    const byMonth = {};
    allTransactions.forEach((tx) => {
      const key = tx.date.slice(0, 7);
      if (!byMonth[key]) byMonth[key] = { month: key, income: 0, expenses: 0 };
      if (tx.type === 'income') byMonth[key].income += Number(tx.amount);
      else byMonth[key].expenses += Number(tx.amount);
    });
    return Object.values(byMonth)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(({ month, income, expenses }) => {
        const [y, m] = month.split('-');
        const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        return { month, monthLabel: label, income, expenses, savings: Math.max(0, income - expenses) };
      });
  }, [allTransactions]);

  const chartData = useMemo(() => {
    if (!allChartData.length) return monthLabels.map((month, i) => ({
      monthLabel: month,
      income: [2400, 5200, 3400, 4600, 5900, 4300][i],
      expenses: [1600, 2100, 3300, 1800, 3600, 3900][i],
      savings: [800, 3100, 100, 2800, 2300, 400][i],
    }));
    const now = new Date();
    const cutoffs = {
      '1W': new Date(now - 7 * 86400000).toISOString().slice(0, 7),
      '1M': new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 7),
      '6M': new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 7),
      '1Y': new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString().slice(0, 7),
    };
    const cutoff = cutoffs[chartRange];
    return cutoff ? allChartData.filter(d => d.month >= cutoff) : allChartData;
  }, [allChartData, chartRange]);

  const expenseData = useMemo(() => {
    return categories.map((cat, index) => ({
      id: cat.categoryId ?? cat.categoryName,
      name: cat.categoryName || 'Uncategorized',
      value: Number(cat.total || 0),
      count: Number(cat.count || 0),
      percentage: Number(cat.percentage || 0),
      color: cat.color || categoryPalette[index % categoryPalette.length],
    }));
  }, [categories]);
  const chartExpenseData = useMemo(() => expenseData.filter((item) => item.value > 0), [expenseData]);

  if (loading) {
    return (
      <Page>
        <Skeleton rows={8} />
      </Page>
    );
  }

  const income = summary?.global?.totalIncome ?? summary?.totalIncome ?? 16281.48;
  const expenses = summary?.global?.totalExpenses ?? summary?.totalExpenses ?? 6638.72;
  const savingsRate = summary?.global?.savingsRate ?? summary?.savingsRate ?? 18;

  const monthIncome = summary?.totalIncome ?? 0;
  const monthExpenses = summary?.totalExpenses ?? 0;
  const monthBalance = summary?.balance ?? 0;
  const monthSavingsRate = summary?.savingsRate ?? 0;

  const periodLabel = summary?.period
    ? new Date(`${summary.period}-01T00:00:00`).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: 'numeric' })
    : t('dashboard.thisMonth');

  return (
    <Page style={{ overflowY: 'auto' }}>
      <PageHeader
        title={`${t('dashboard.welcomeBack')} ${firstName}`}
        subtitle={t('dashboard.slogan')}
      />


      <div className="fc-grid fc-main-grid" style={{ gap: 8 }}>
        <div className="fc-grid" style={{ gap: 8 }}>
          <div className="fc-grid fc-grid-4" style={{ gap: 8 }}>
            <StatCard title={t('dashboard.totalBalance')}    value={fmt(monthBalance)}  subtitle={periodLabel} icon={Wallet}        iconBg="rgba(47,107,255,0.14)"  iconColor="#2f6bff" />
            <StatCard title={t('dashboard.monthlyIncome')}  value={fmt(income)}         subtitle={periodLabel} trend={`+${fmt(monthIncome)}`}                                                   trendColor="#18b977"                                   icon={ArrowUpRight}   iconBg="rgba(24,185,119,0.14)"  iconColor="#18b977" />
            <StatCard title={t('dashboard.monthlyExpenses')} value={fmt(expenses)}      subtitle={periodLabel} trend={`-${fmt(monthExpenses)}`}                                                 trendColor="#ff3b30"                                   icon={ArrowDownRight}  iconBg="rgba(255,59,48,0.14)"   iconColor="#ff3b30" />
            <StatCard title={t('dashboard.savingsRate')}    value={`${savingsRate}%`}   subtitle={periodLabel} trend={`${monthSavingsRate >= 0 ? '+' : ''}${Number(monthSavingsRate).toFixed(1)}%`} trendColor={monthSavingsRate >= 0 ? '#18b977' : '#ff3b30'} icon={PiggyBank} iconBg="rgba(118,87,255,0.14)"  iconColor="#7657ff" />
          </div>

          <Card style={{ paddingBottom: 6 }}>
            <CardHead
              title={t('dashboard.spendingActivity')}
              action={(
                <div className="fc-header-actions">
                  <div className="fc-tabs">
                    {['1M', '6M', '1Y'].map((tab) => (
                      <button key={tab} className={`fc-tab ${tab === chartRange ? 'active' : ''}`} onClick={() => setChartRange(tab)}>{tab}</button>
                    ))}
                  </div>
                </div>
              )}
            />
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={chartData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid stroke="var(--fc-border)" vertical={false} />
                <XAxis dataKey="monthLabel" tick={{ fill: 'var(--fc-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: 'var(--fc-muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v === 0 ? '0' : `${v / 1000}K`}
                />
                <Tooltip formatter={(value) => fmt(value)} contentStyle={tooltipStyle} cursor={false} />
                <Legend
                  verticalAlign="bottom"
                  height={20}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, color: 'var(--fc-muted)', paddingTop: 0, paddingBottom: 0, marginBottom: 0 }}
                  formatter={(value) => <span style={{ color: 'var(--fc-muted)', marginRight: 6 }}>{value}</span>}
                />
                <Bar dataKey="expenses" name={t('analytics.expenses')} fill="#ff3b30" radius={[4, 4, 0, 0]} />
                <Bar dataKey="income"   name={t('analytics.income')}   fill="#18b977" radius={[4, 4, 0, 0]} />
                <Bar dataKey="savings"  name={t('analytics.savings')}  fill="#2f6bff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <div className="fc-grid fc-grid-2 fc-dashboard-mobile-hidden">
            <Card>
              <CardHead title={t('dashboard.recentTransactions')} action={<Button onClick={() => setModalOpen(true)}><Plus size={14} />{t('transactions.addTransaction')}</Button>} />
              <div className="fc-list">
                {recents.length === 0 && !loading && (
                  <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--fc-muted)', fontSize: 13 }}>{t('dashboard.noTransactions') || 'No transactions yet.'}</div>
                )}
                {recents.slice(0, 6).map((tx) => {
                  const cfg = getCategoryIcon(tx.category?.name);
                  const Icon = cfg.icon;
                  return (
                    <div className="fc-list-item" key={tx.id}>
                      <span className="fc-item-icon" style={{ background: cfg.bg, color: cfg.color, borderRadius: 10 }}>
                        <Icon size={16} strokeWidth={1.75} />
                      </span>
                      <div>
                        <strong>{tx.description}</strong>
                        <span>{fmtDate(tx.date)} · <span style={{ color: cfg.color, fontWeight: 600 }}>{tx.category?.name || 'General'}</span></span>
                      </div>
                      <strong className="amount" style={{ color: tx.type === 'income' ? 'var(--fc-green)' : 'var(--fc-red)' }}>
                        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <CardHead title={t('dashboard.breakdown')} subtitle={t('dashboard.spendingByCategory')} />
              <div className="fc-list">
                {expenseData.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--fc-muted)', margin: 0 }}>{t('dashboard.noExpenseData')}</p>
                ) : expenseData.slice(0, 6).map((cat) => {
                  const cfg = getCategoryIcon(cat.name);
                  const Icon = cfg.icon;
                  return (
                    <div className="fc-list-item" key={cat.id}>
                      <span className="fc-item-icon" style={{ background: cfg.bg, color: cfg.color, borderRadius: 10 }}>
                        <Icon size={16} strokeWidth={1.75} />
                      </span>
                      <div>
                        <strong>{cat.name}</strong>
                        <span>{cat.percentage.toFixed(1)}{t('dashboard.ofExpenses')}</span>
                      </div>
                      <strong style={{ color: 'var(--fc-red)', flexShrink: 0 }}>{fmt(cat.value)}</strong>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        <div className="fc-grid" style={{ alignSelf: 'start', gap: 10 }}>
          <Card style={{ alignSelf: 'start' }}>
            <CardHead title={t('dashboard.expensesByCategory')} />
            {chartExpenseData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, fontSize: 13, color: 'var(--fc-muted)' }}>
                {t('dashboard.noExpensesThisPeriod')}
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={chartExpenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                      {chartExpenseData.map((item, i) => <Cell key={i} fill={item.color} />)}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [fmt(value), name]}
                      contentStyle={{ borderRadius: 10, border: '1px solid var(--fc-border)', fontSize: 12, background: 'var(--fc-card)', color: 'var(--fc-text)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', marginTop: 12 }}>
                  {chartExpenseData.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fc-muted)', minWidth: 0 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{item.name}</span>
                      <span style={{ flexShrink: 0, fontWeight: 500, color: 'var(--fc-text)' }}>{item.percentage.toFixed(2)}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          {/* Recommendations */}
          <Card style={{ alignSelf: 'start' }}>
            <CardHead title={t('dashboard.recommendations')} />
            {recLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...Array(3)].map((_, i) => <div key={i} style={{ height: 52, borderRadius: 10, background: 'var(--fc-border)', animation: 'shimmer 1.4s ease-in-out infinite' }} />)}
              </div>
            ) : recError ? (
              <div style={{ padding: '16px 12px', textAlign: 'center', background: 'rgba(255,59,48,0.08)', borderRadius: 10 }}>
                <AlertCircle size={24} color="var(--fc-red)" strokeWidth={1.6} style={{ marginBottom: 6 }} />
                <p style={{ fontSize: 12, color: 'var(--fc-red)', margin: 0, lineHeight: 1.45 }}>{recError}</p>
              </div>
            ) : recommendations.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <AlertCircle size={28} color="var(--fc-muted)" strokeWidth={1.5} style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 13, color: 'var(--fc-muted)', margin: 0 }}>{t('dashboard.noRecommendations')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recommendations.slice(0, 4).map((rec, i) => {
                  const priority = (rec.priority || 'low').toLowerCase();
                  const style = REC_STYLES[priority] || REC_STYLES.low;
                  return (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 10, background: style.bg }}>
                      <Sparkles size={15} style={{ color: style.text, flexShrink: 0, marginTop: 2 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: style.text, textTransform: 'capitalize', marginBottom: 3 }}>{priority}</div>
                        <div style={{ fontSize: 12, color: 'var(--fc-text)', lineHeight: 1.4 }}>{rec.message}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

        </div>
      </div>
      <Modal open={modalOpen} title={t('transactions.addTransaction')} onClose={() => setModalOpen(false)}>
        <form onSubmit={saveTransaction} style={{ display: 'grid', gap: 14 }}>
          <Field label={t('transactions.merchant')}><Input value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} required /></Field>
          <Field label={t('transactions.amountLabel')}><Input type="number" value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} required /></Field>
          <Field label={t('transactions.dateLabel')}><Input type="date" value={form.date} onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))} required /></Field>
          <Field label={t('transactions.typeLabel')}>
            <Select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
              <option value="expense">{t('transactions.typeExpense')}</option>
              <option value="income">{t('transactions.typeIncome')}</option>
            </Select>
          </Field>
          <Button disabled={saving}>{saving ? t('transactions.creating') : t('transactions.saveTransaction')}</Button>
        </form>
      </Modal>
    </Page>
  );
}

const tooltipStyle = {
  border: '1px solid var(--fc-border)',
  borderRadius: 16,
  background: 'var(--fc-card)',
  color: 'var(--fc-text)',
  boxShadow: 'var(--fc-shadow)',
};
