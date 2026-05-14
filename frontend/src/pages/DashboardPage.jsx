import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip, ResponsiveContainer,
} from 'recharts';
import { Upload } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import { getSummary, getByCategory, getMonthlyEvolution } from '../services/dashboardService';
import api from '../services/api';

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

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function DashboardPage() {
  const [month, setMonth] = useState(currentMonth());
  const [summary, setSummary] = useState(null);
  const [categories, setCategories] = useState([]);
  const [evolution, setEvolution] = useState([]);
  const [recentTxns, setRecentTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll(month);
  }, [month]);

  async function fetchAll(m) {
    setLoading(true);
    setError('');
    try {
      const [sumRes, catRes, evoRes, txnRes] = await Promise.all([
        getSummary(m),
        getByCategory(m),
        getMonthlyEvolution(),
        api.get('/transactions', { params: { type: undefined } }),
      ]);
      setSummary(sumRes.data.data);
      setCategories(catRes.data.data.categories);
      setEvolution(
        evoRes.data.data.evolution.map((e) => ({
          ...e,
          monthLabel: MONTH_NAMES[parseInt(e.month.split('-')[1]) - 1],
        }))
      );
      setRecentTxns(txnRes.data.data.transactions.slice(0, 5));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (recentTxns.length === 0 && summary?.transactionCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center max-w-sm w-full">
          <Upload className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">No data yet</h2>
          <p className="text-sm text-gray-500 mb-6">Import your first CSV to see your dashboard.</p>
          <Link
            to="/transactions"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Month filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Month</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={fmt(summary.totalIncome)}
          subtitle="This month"
          icon="💰"
        />
        <StatCard
          title="Total Expenses"
          value={fmt(summary.totalExpenses)}
          subtitle="This month"
          icon="💸"
        />
        <StatCard
          title="Balance"
          value={fmt(summary.balance)}
          subtitle="This month"
          icon="📊"
        />
        <StatCard
          title="Savings Rate"
          value={`${summary.savingsRate}%`}
          subtitle="This month"
          icon="🎯"
          trend={summary.savingsRate > 0 ? summary.savingsRate : undefined}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pie Chart — expenses by category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          {categories.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">
              No expenses this month
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="total"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {categories.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <PieTooltip
                    formatter={(value, name) => [fmt(value), name]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-3">
                {categories.map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                    {c.categoryName} ({c.percentage}%)
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bar Chart — monthly evolution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Monthly Evolution</h3>
          {evolution.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">
              No data for the last 6 months
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={evolution} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `${v}€`} />
                <BarTooltip
                  formatter={(value, name) => [fmt(value), name === 'income' ? 'Income' : 'Expenses']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Bar dataKey="income" name="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>
          <Link to="/transactions" className="text-sm text-indigo-600 hover:underline">
            See all
          </Link>
        </div>
        {recentTxns.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentTxns.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.description}</p>
                    <p className="text-xs text-gray-400">{fmtDate(t.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  {t.category && (
                    <span className="hidden sm:inline text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {t.category.name}
                    </span>
                  )}
                  <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </span>
                  <Badge variant={t.type} label={t.type === 'income' ? 'Income' : 'Expense'} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
