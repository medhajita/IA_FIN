import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Eye, FileSpreadsheet, Search, TrendingDown, TrendingUp, Trash2, X } from 'lucide-react';
import { deleteTransaction, getTransactions } from '../services/transactionService';
import { getCategoryIcon } from '../utils/categoryIcons';
import { Badge, Card, CardHead, EmptyState, Page, PageHeader, Skeleton, StatCard } from '../components/fincoach/FinCoachUI';
import { useFmt } from '../context/CurrencyContext';
import { useI18n } from '../context/I18nContext';
import { notifyDataChanged, subscribeDataChanged } from '../utils/dataEvents';

function fmtDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function monthLabel(key) {
  const [year, month] = key.split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function DocumentsPage() {
  const fmt = useFmt();
  const { t } = useI18n();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [confirmMonth, setConfirmMonth] = useState(null);
  const [query, setQuery] = useState('');
  const [viewMonth, setViewMonth] = useState(null);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTransactions();
      const next = res.data.data.transactions || [];
      setTransactions(next);
      return next;
    } catch {
      setTransactions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => subscribeDataChanged(load), [load]);
  useEffect(() => { setPage(1); }, [query]);

  const groups = transactions.reduce((acc, tx) => {
    const key = tx.date.slice(0, 7);
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  const months = Object.entries(groups)
    .sort(([a], [b]) => b.localeCompare(a))
    .filter(([key]) => monthLabel(key).toLowerCase().includes(query.toLowerCase()))
    .map(([key, txs]) => ({
      key,
      label: monthLabel(key),
      count: txs.length,
      income: txs.filter(tx => tx.type === 'income').reduce((s, tx) => s + Number(tx.amount), 0),
      expense: txs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + Number(tx.amount), 0),
      txs,
    }));

  const PAGE_SIZE = 6;
  const totalPages = Math.max(1, Math.ceil(months.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(() => months.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE), [months, safePage]);

  async function doDelete() {
    if (!confirmMonth) return;
    setDeleting(confirmMonth.key);
    setConfirmMonth(null);
    try {
      await Promise.all(confirmMonth.txs.map(tx => deleteTransaction(tx.id)));
      const next = await load();
      notifyDataChanged({ source: 'documents-delete', transactionCount: next.length });
    } finally {
      setDeleting(null);
    }
  }

  const viewData = viewMonth ? months.find(m => m.key === viewMonth) : null;

  return (
    <Page style={{ flex: 1, minHeight: 0 }}>
      <PageHeader title={t('documents.title')} subtitle={t('documents.subtitle')} />

      <div className="fc-grid fc-grid-4">
        <StatCard title={t('documents.totalMonths')} value={months.length} subtitle={t('documents.importedPeriods')} icon={FileSpreadsheet} iconBg="rgba(47,107,255,0.14)" iconColor="var(--fc-blue)" />
        <StatCard title={t('documents.totalTransactions')} value={transactions.length} subtitle={t('documents.acrossImports')} icon={FileSpreadsheet} iconBg="rgba(118,87,255,0.14)" iconColor="var(--fc-purple)" />
        <StatCard title={t('documents.totalIncome')} value={fmt(transactions.filter(tx => tx.type === 'income').reduce((s, tx) => s + Number(tx.amount), 0))} subtitle={t('documents.allPeriods')} icon={FileSpreadsheet} iconBg="rgba(24,185,119,0.14)" iconColor="var(--fc-green)" />
        <StatCard title={t('documents.totalExpenses')} value={fmt(transactions.filter(tx => tx.type === 'expense').reduce((s, tx) => s + Number(tx.amount), 0))} subtitle={t('documents.allPeriods')} icon={FileSpreadsheet} iconBg="rgba(255,59,48,0.14)" iconColor="var(--fc-red)" />
      </div>

      <Card className="fc-documents-card" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <CardHead
          title={t('documents.importedFiles')}
          subtitle={t('documents.fileSubtitle')}
          action={(
            <label className="fc-search">
              <Search size={18} color="var(--fc-muted)" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('documents.searchMonth')} />
            </label>
          )}
        />
        {loading ? <Skeleton rows={5} /> : months.length ? (
          <div className="fc-table-wrap" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
            <table className="fc-table">
              <thead>
                <tr>
                  <th className="fc-doc-col-index" style={{ width: 40 }}>#</th>
                  <th className="fc-doc-col-month">{t('documents.colMonth')}</th>
                  <th className="fc-doc-col-count">{t('documents.colTransactions')}</th>
                  <th className="fc-doc-col-income">{t('documents.colIncome')}</th>
                  <th className="fc-doc-col-expenses">{t('documents.colExpenses')}</th>
                  <th className="fc-doc-col-net">{t('documents.colNet')}</th>
                  <th className="fc-doc-col-actions">{t('documents.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((m, i) => (
                  <tr key={m.key}>
                    <td className="fc-doc-col-index" style={{ color: 'var(--fc-muted)', fontSize: 12 }}>{(safePage - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="fc-doc-col-month"><strong>{m.label}</strong></td>
                    <td className="fc-doc-col-count"><Badge tone="blue">{m.count}</Badge></td>
                    <td className="fc-doc-col-income" style={{ color: 'var(--fc-green)', fontWeight: 700 }}>+{fmt(m.income)}</td>
                    <td className="fc-doc-col-expenses" style={{ color: 'var(--fc-red)', fontWeight: 700 }}>-{fmt(m.expense)}</td>
                    <td className="fc-doc-col-net" style={{ color: m.income - m.expense >= 0 ? 'var(--fc-green)' : 'var(--fc-red)', fontWeight: 700 }}>
                      {fmt(m.income - m.expense)}
                    </td>
                    <td className="fc-doc-col-actions">
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button className="fc-icon-button" aria-label="View" onClick={() => setViewMonth(m.key)}><Eye size={15} /></button>
                        <button
                          className="fc-icon-button"
                          aria-label="Delete"
                          disabled={deleting === m.key}
                          onClick={() => setConfirmMonth(m)}
                        ><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={FileSpreadsheet} title={t('documents.noImports')} text={t('documents.noImportsSub')} />
        )}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 12, flexWrap: 'wrap', flexShrink: 0 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
              style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--fc-border)', background: 'transparent', color: 'var(--fc-muted)', cursor: safePage === 1 ? 'default' : 'pointer', opacity: safePage === 1 ? 0.4 : 1 }}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
              .reduce((acc, n, idx, arr) => { if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…'); acc.push(n); return acc; }, [])
              .map((n, i) => n === '…' ? (
                <span key={`e-${i}`} style={{ padding: '0 4px', color: 'var(--fc-muted)' }}>…</span>
              ) : (
                <button key={n} onClick={() => setPage(n)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--fc-border)', background: safePage === n ? 'var(--fc-blue)' : 'transparent', color: safePage === n ? '#fff' : 'var(--fc-text)', fontWeight: safePage === n ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>{n}</button>
              ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
              style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--fc-border)', background: 'transparent', color: 'var(--fc-muted)', cursor: safePage === totalPages ? 'default' : 'pointer', opacity: safePage === totalPages ? 0.4 : 1 }}>›</button>
          </div>
        )}
      </Card>

      {confirmMonth && (
        <div className="fc-modal-backdrop" onClick={() => setConfirmMonth(null)}>
          <section className="fc-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="fc-modal-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,59,48,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={18} color="var(--fc-red)" />
                </span>
                <h2 style={{ margin: 0 }}>{t('documents.deleteFile')}</h2>
              </div>
              <button className="fc-icon-button" onClick={() => setConfirmMonth(null)}><X size={18} /></button>
            </div>
            <div className="fc-modal-body" style={{ display: 'grid', gap: 18 }}>
              <p style={{ margin: 0, color: 'var(--fc-muted)', lineHeight: 1.6 }}>
                {t('documents.deleteText', { count: confirmMonth.count, month: confirmMonth.label })}
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="fc-button-soft" style={{ flex: 1 }} onClick={() => setConfirmMonth(null)}>{t('documents.cancel')}</button>
                <button className="fc-button-danger" style={{ flex: 1 }} onClick={doDelete}>{t('documents.delete')}</button>
              </div>
            </div>
          </section>
        </div>
      )}

      {viewData && (
        <div className="fc-modal-backdrop" onClick={() => setViewMonth(null)}>
          <section className="fc-modal" style={{ maxWidth: 860, width: '92vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="fc-modal-head">
              <div>
                <h2 style={{ margin: 0 }}>{viewData.label}</h2>
                <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--fc-muted)' }}>{t('documents.transactionCount', { count: viewData.count })}</p>
              </div>
              <button className="fc-icon-button" onClick={() => setViewMonth(null)}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '12px 20px', borderBottom: '1px solid var(--fc-border)' }}>
              <div style={{ background: 'rgba(24,185,119,0.08)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <TrendingUp size={14} color="var(--fc-green)" />
                  <span style={{ fontSize: 11, color: 'var(--fc-muted)', fontWeight: 600 }}>{t('documents.income')}</span>
                </div>
                <strong style={{ fontSize: 16, color: 'var(--fc-green)' }}>+{fmt(viewData.income)}</strong>
              </div>
              <div style={{ background: 'rgba(255,59,48,0.08)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <TrendingDown size={14} color="var(--fc-red)" />
                  <span style={{ fontSize: 11, color: 'var(--fc-muted)', fontWeight: 600 }}>{t('documents.expenses')}</span>
                </div>
                <strong style={{ fontSize: 16, color: 'var(--fc-red)' }}>-{fmt(viewData.expense)}</strong>
              </div>
              <div style={{ background: 'rgba(47,107,255,0.08)', borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--fc-muted)', fontWeight: 600 }}>{t('documents.net')}</span>
                </div>
                <strong style={{ fontSize: 16, color: viewData.income - viewData.expense >= 0 ? 'var(--fc-green)' : 'var(--fc-red)' }}>
                  {fmt(viewData.income - viewData.expense)}
                </strong>
              </div>
            </div>

            <div className="fc-modal-body" style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>
              <table className="fc-table" style={{ minWidth: 'unset' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>{t('documents.date')}</th>
                    <th style={{ textAlign: 'left' }}>{t('documents.description')}</th>
                    <th>{t('documents.category')}</th>
                    <th style={{ textAlign: 'right' }}>{t('documents.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...viewData.txs].sort((a, b) => b.date.localeCompare(a.date)).map((tx) => {
                    const cfg = getCategoryIcon(tx.category?.name);
                    const Icon = cfg.icon;
                    return (
                      <tr key={tx.id}>
                        <td style={{ textAlign: 'left', color: 'var(--fc-muted)', fontSize: 13 }}>{fmtDate(tx.date)}</td>
                        <td style={{ textAlign: 'left' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 28, height: 28, borderRadius: 7, background: cfg.bg, color: cfg.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Icon size={13} strokeWidth={1.75} />
                            </span>
                            <strong style={{ fontSize: 13 }}>{tx.description}</strong>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: cfg.color }}>{tx.category?.name || t('documents.uncategorized')}</span>
                        </td>
                        <td style={{ textAlign: 'right', color: tx.type === 'income' ? 'var(--fc-green)' : 'var(--fc-red)', fontWeight: 700, fontSize: 14 }}>
                          {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </Page>
  );
}
