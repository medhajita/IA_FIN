import { useEffect, useMemo, useState } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { BrainCircuit, PiggyBank, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { getByCategory, getMonthlyEvolution } from '../services/dashboardService';
import { getCategoryIcon } from '../utils/categoryIcons';
import { useFmt } from '../context/CurrencyContext';
import { useI18n } from '../context/I18nContext';
import { Badge, Card, CardHead, Page, PageHeader, StatCard } from '../components/fincoach/FinCoachUI';


const tooltipStyle = {
  borderRadius: 16,
  border: '1px solid var(--fc-border)',
  background: 'var(--fc-card)',
  color: 'var(--fc-text)',
  boxShadow: 'var(--fc-shadow)',
};

function monthOffset(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 7);
}

export default function AnalyticsPage() {
  const fmt = useFmt();
  const { t } = useI18n();
  const [allTrend, setAllTrend] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [fromMonth, setFromMonth] = useState(() => monthOffset(5));
  const [toMonth, setToMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const trend = useMemo(() => {
    const isISO = (m) => /^\d{4}-\d{2}$/.test(m);
    return allTrend.filter((item) =>
      !isISO(item.month) || (item.month >= fromMonth && item.month <= toMonth)
    );
  }, [allTrend, fromMonth, toMonth]);

  useEffect(() => {
    let alive = true;
    getMonthlyEvolution()
      .then((res) => {
        const raw = res.data?.data?.evolution || res.data?.data?.months || [];
        const normalized = raw.map((item) => {
          const income = Number(item.income || item.total_income || 0);
          const expenses = Number(item.expenses || item.total_expense || item.total_expenses || 0);
          return {
            month: item.month || item.label,
            income,
            expenses,
            savings: Math.max(0, income - expenses),
          };
        }).filter((item) => item.month);
        if (alive && normalized.length > 0) setAllTrend(normalized);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let alive = true;
    getByCategory(null, fromMonth, toMonth)
      .then((res) => {
        const raw = res.data?.data?.categories || [];
        const data = raw
          .filter((c) => c.total > 0)
          .map((c) => {
            const cfg = getCategoryIcon(c.categoryName);
            return { name: c.categoryName, value: c.total, color: cfg.color, percentage: c.percentage };
          });
        if (alive) setPieData(data);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [fromMonth, toMonth]);

  const totals = useMemo(() => {
    const income = trend.reduce((sum, item) => sum + item.income, 0);
    const expenses = trend.reduce((sum, item) => sum + item.expenses, 0);
    const savings = trend.reduce((sum, item) => sum + item.savings, 0);
    return { income, expenses, savings };
  }, [trend]);

  const healthScore = useMemo(() => {
    const rate = totals.income > 0 ? (totals.savings / totals.income) * 100 : 0;
    return Math.min(100, Math.round(40 + rate * 1.2));
  }, [totals]);

  const aiInsights = useMemo(() => {
    const topCat = pieData[0];
    const savingsRate = totals.income > 0 ? ((totals.savings / totals.income) * 100).toFixed(1) : '0.0';
    const lastTwo = trend.slice(-2);
    const spendingChange = lastTwo.length === 2 && lastTwo[0].expenses > 0
      ? Math.round(((lastTwo[1].expenses - lastTwo[0].expenses) / lastTwo[0].expenses) * 100)
      : null;
    return [
      topCat
        ? { title: t('analytics.topSpendingCat'), text: t('analytics.topCatText', { name: topCat.name, pct: topCat.percentage?.toFixed(1) }), tone: 'orange' }
        : { title: t('analytics.noExpensesYet'), text: t('analytics.startTracking'), tone: 'blue' },
      spendingChange !== null
        ? { title: t(spendingChange >= 0 ? 'analytics.spendingIncreased' : 'analytics.spendingDecreased'), text: t('analytics.vsPreviousMonth', { pct: Math.abs(spendingChange) }), tone: spendingChange >= 0 ? 'red' : 'green' }
        : { title: t('analytics.savingsHealth'), text: t('analytics.savingsRatePeriod', { rate: savingsRate }), tone: Number(savingsRate) >= 20 ? 'green' : 'orange' },
      { title: t('analytics.netSavings'), text: t('analytics.retained', { amount: fmt(totals.savings) }), tone: totals.savings > 0 ? 'green' : 'red' },
      { title: t('analytics.categoriesTitle'), text: t('analytics.categoriesTracked', { count: pieData.length }), tone: 'blue' },
    ];
  }, [pieData, trend, totals, fmt, t]);

  return (
    <Page style={{ flex: 1, minHeight: 0 }}>
      <PageHeader
        title={t('analytics.title')}
        subtitle={t('analytics.subtitle')}
      />

      <div className="fc-grid fc-grid-4">
        <StatCard title={t('analytics.totalIncome')} value={fmt(totals.income)} subtitle={t('analytics.selectedPeriod')} icon={TrendingUp} iconBg="rgba(24,185,119,0.14)" iconColor="var(--fc-green)" />
        <StatCard title={t('analytics.totalExpenses')} value={fmt(totals.expenses)} subtitle={t('analytics.selectedPeriod')} icon={TrendingDown} iconBg="rgba(255,59,48,0.14)" iconColor="var(--fc-red)" />
        <StatCard title={t('analytics.netSavings')} value={fmt(totals.savings)} subtitle={t('analytics.cashRetained')} icon={PiggyBank} iconBg="rgba(47,107,255,0.14)" iconColor="var(--fc-blue)" />
        <StatCard title={t('analytics.healthScore')} value={`${healthScore}/100`} subtitle={healthScore >= 70 ? t('analytics.goodHealth') : t('analytics.needsAttention')} icon={BrainCircuit} iconBg="rgba(118,87,255,0.14)" iconColor="var(--fc-purple)" />
      </div>

      <Card style={{ flexShrink: 0 }}>
        <CardHead title={t('analytics.incomeVsExpenses')} subtitle={t('analytics.monthlyComparison')} />
        <div style={{ height: 160 }}>
          <ResponsiveContainer>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="incomeG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18b977" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#18b977" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff3b30" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#ff3b30" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--fc-border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'var(--fc-muted)', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--fc-muted)', fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [fmt(v), n]} />
              <Area type="monotone" dataKey="income" stroke="#18b977" fill="url(#incomeG)" strokeWidth={2.5} name={t('analytics.income')} />
              <Area type="monotone" dataKey="expenses" stroke="#ff3b30" fill="url(#expenseG)" strokeWidth={2.5} name={t('analytics.expenses')} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="fc-grid fc-grid-3" style={{ flex: 1, minHeight: 0 }}>
        <Card className="fc-analytics-chart-card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <CardHead title={t('analytics.expensesByCategory')} subtitle={t('analytics.fromTransactions')} />
          <div className="fc-analytics-chart-body" style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData.length ? pieData : [{ name: 'No data', value: 1, color: 'var(--fc-border)' }]}
                  innerRadius={45} outerRadius={68} dataKey="value" paddingAngle={pieData.length ? 3 : 0}>
                  {(pieData.length ? pieData : [{ color: 'var(--fc-border)' }]).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, flexShrink: 0 }}>
            {pieData.map((item) => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--fc-text)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                <span style={{ fontSize: 10, color: 'var(--fc-muted)', flexShrink: 0 }}>{item.percentage?.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="fc-analytics-chart-card" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <CardHead title={t('analytics.monthlySavings')} subtitle={t('analytics.netSavingsPerMonth')} />
          <div className="fc-analytics-chart-body" style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid stroke="var(--fc-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: 'var(--fc-muted)', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--fc-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(v)} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="savings" fill="var(--fc-blue)" radius={[6, 6, 0, 0]} name={t('analytics.savings')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="fc-analytics-mobile-hidden" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <CardHead title={t('analytics.aiInsights')} />
          <div className="fc-list" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            {aiInsights.map(({ title, text, tone }) => (
              <div className="fc-list-item" key={title}>
                <span className="fc-item-icon" style={{ color: 'var(--fc-purple)' }}><Sparkles size={18} /></span>
                <div><strong>{title}</strong><span>{text}</span></div>
                <Badge tone={tone}>AI</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Page>
  );
}
