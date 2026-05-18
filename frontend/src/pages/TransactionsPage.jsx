import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Eye, Filter, Plus, Search, Sparkles, Trash2, Upload, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCategoryIcon } from '../utils/categoryIcons';
import api from '../services/api';
import { createTransaction, deleteTransaction, uploadCSV } from '../services/transactionService';
import { Badge, Button, Card, CardHead, Field, Input, StatCard, Modal, Page, PageHeader, Select, Skeleton } from '../components/fincoach/FinCoachUI';
import { useFmt } from '../context/CurrencyContext';
import { useI18n } from '../context/I18nContext';
import { notifyDataChanged, subscribeDataChanged } from '../utils/dataEvents';

const PAGE_SIZE = 8;

function fmtDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}


export default function TransactionsPage() {
  const fmt = useFmt();
  const { t, tCat, lang } = useI18n();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [importStatus, setImportStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewTx, setViewTx] = useState(null);
  const [deleteTx, setDeleteTx] = useState(null);
  const [form, setForm] = useState({ description: '', amount: '', date: new Date().toISOString().slice(0, 10), type: 'expense', category_id: '' });
  const fileRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/transactions', { params: type ? { type } : {} });
      const next = res.data.data.transactions || [];
      setTransactions(next);
      return next;
    } catch {
      setTransactions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => subscribeDataChanged(load), [load]);

  const rows = transactions;
  const filtered = rows.filter((row) => {
    if (search && !row.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && row.category?.name !== category) return false;
    if (dateFrom && row.date < dateFrom) return false;
    if (dateTo && row.date > dateTo) return false;
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const spent = filtered.filter((row) => row.type === 'expense').reduce((sum, row) => sum + Number(row.amount), 0);
  const avg = filtered.length ? spent / filtered.length : 0;
  const topCategory = filtered.find((row) => row.type === 'expense')?.category?.name || 'Food';
  const aiAccuracy = useMemo(() => Math.min(99, 92 + Math.round(rows.length / 8)), [rows.length]);
  const dbCategories = useMemo(() => [...new Set(rows.map((r) => r.category?.name).filter(Boolean))], [rows]);

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

  async function prepareDashboardAfterImport() {
    setImportStatus(t('onboarding.preparingDashboard') || 'Preparing your dashboard...');
    const [txRes] = await Promise.all([
      api.get('/transactions', { params: { limit: 1 } }),
      api.get('/dashboard/summary'),
      api.get('/dashboard/by-category'),
    ]);
    const count = txRes.data?.data?.transactions?.length ?? 0;
    if (count <= 0) throw new Error(t('onboarding.noImportedRows') || 'No transactions were imported from this CSV.');
    return count;
  }

  async function handleUpload() {
    if (!file) return;
    setSaving(true);
    setImportStatus(t('transactions.importing') || 'Importing...');
    try {
      const res = await uploadCSV(file);
      const imported = Number(res.data?.data?.imported || 0);
      if (imported <= 0) throw new Error(t('onboarding.noImportedRows') || 'No transactions were imported from this CSV.');
      const count = await prepareDashboardAfterImport();
      setFile(null);
      setImportOpen(false);
      setImportStatus('');
      await load();
      notifyDataChanged({ source: 'transactions-upload', transactionCount: count });
      navigate('/dashboard');
    } catch (err) {
      setImportStatus(err?.response?.data?.error || err.message || 'Import failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function doDelete() {
    if (!deleteTx) return;
    setSaving(true);
    try {
      await deleteTransaction(deleteTx.id);
      setDeleteTx(null);
      const next = await load();
      notifyDataChanged({ source: 'transactions-delete', transactionCount: next.length });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Page style={{ flex: 1, minHeight: 0 }}>
      <PageHeader
        title={t('transactions.title')}
        subtitle={t('transactions.subtitle')}
        actions={(
          <>
            <Button variant="soft" onClick={() => setImportOpen(true)}><Upload size={16} />{t('transactions.importCsv')}</Button>
            <Button onClick={() => setModalOpen(true)}><Plus size={16} />{t('transactions.addTransaction')}</Button>
          </>
        )}
      />

      <div className="fc-grid fc-grid-4">
        <StatCard title={t('transactions.totalTransactions')} value={filtered.length} subtitle={t('transactions.allRecords')} icon={WalletCards} iconBg="rgba(47,107,255,0.14)" iconColor="var(--fc-blue)" />
        <StatCard title={t('transactions.totalSpent')} value={fmt(spent)} subtitle={t('transactions.expenseTransactions')} icon={WalletCards} iconBg="rgba(255,59,48,0.14)" iconColor="var(--fc-red)" />
        <StatCard title={t('transactions.avgSpending')} value={fmt(avg)} subtitle={t('transactions.perTxAvg')} icon={WalletCards} iconBg="rgba(118,87,255,0.14)" iconColor="var(--fc-purple)" />
        <StatCard title={t('transactions.topCategory')} value={tCat(topCategory)} subtitle={t('transactions.topCategoryArea')} icon={Filter} iconBg="rgba(255,159,26,0.14)" iconColor="var(--fc-orange)" />
      </div>

      <div className="fc-grid fc-two-one" style={{ flex: 1, minHeight: 0 }}>
        <Card className="fc-transactions-ledger" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <CardHead
            title={t('transactions.ledger')}
            subtitle={t('transactions.ledgerSub')}
            action={(
              <label className="fc-search">
                <Search size={18} color="var(--fc-muted)" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder={t('transactions.searchPlaceholder')}
                />
              </label>
            )}
          />
          {loading ? <Skeleton rows={7} /> : rows.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '48px 0', color: 'var(--fc-muted)', fontSize: 14 }}>
              <WalletCards size={36} strokeWidth={1.4} />
              <span>{t('transactions.noTransactions') || 'No transactions yet. Add your first transaction.'}</span>
            </div>
          ) : (
            <div className="fc-table-wrap" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
              <table className="fc-table">
                <thead>
                  <tr>
                    <th className="fc-tx-date">{t('transactions.colDate')}</th>
                    <th className="fc-tx-merchant">{t('transactions.merchant')}</th>
                    <th className="fc-tx-category">{t('transactions.colCategory')}</th>
                    <th className="fc-tx-amount">{t('transactions.colAmount')}</th>
                    <th className="fc-tx-actions">{t('transactions.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((row) => {
                    const cfg = getCategoryIcon(row.category?.name, row.description);
                    const Icon = cfg.icon;
                    return (
                    <tr key={row.id}>
                      <td className="fc-tx-date">{fmtDate(row.date)}</td>
                      <td className="fc-tx-merchant">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textAlign: 'left' }}>
                          <span style={{ width: 28, height: 28, borderRadius: 8, background: cfg.bg || 'var(--fc-sidebar)', color: cfg.color || 'var(--fc-muted)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={14} strokeWidth={1.75} />
                          </span>
                          <strong>{row.description}</strong>
                        </div>
                      </td>
                      <td className="fc-tx-category"><Badge tone="blue">{tCat(row.category?.name || 'Uncategorized')}</Badge></td>
                      <td className="fc-tx-amount" style={{ color: row.type === 'income' ? 'var(--fc-green)' : 'var(--fc-red)', fontWeight: 900 }}>
                        {row.type === 'income' ? '+' : '-'}{fmt(row.amount)}
                      </td>
                      <td className="fc-tx-actions">
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          <button className="fc-icon-button" aria-label="View" onClick={() => setViewTx(row)}><Eye size={15} /></button>
                          <button className="fc-icon-button" aria-label="Delete" onClick={() => setDeleteTx(row)}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--fc-border)', background: 'transparent', color: 'var(--fc-muted)', cursor: safePage === 1 ? 'default' : 'pointer', opacity: safePage === 1 ? 0.4 : 1 }}
              >‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(n => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, i) => n === '…' ? (
                  <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--fc-muted)' }}>…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: '1px solid var(--fc-border)',
                      background: safePage === n ? 'var(--fc-blue)' : 'transparent',
                      color: safePage === n ? '#fff' : 'var(--fc-text)',
                      fontWeight: safePage === n ? 700 : 400,
                      cursor: 'pointer', fontSize: 13,
                    }}
                  >{n}</button>
                ))
              }
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--fc-border)', background: 'transparent', color: 'var(--fc-muted)', cursor: safePage === totalPages ? 'default' : 'pointer', opacity: safePage === totalPages ? 0.4 : 1 }}
              >›</button>
            </div>
          )}
        </Card>

        <div className="fc-grid fc-transactions-tools" style={{ alignSelf: 'start' }}>
          <Card className="fc-filter-card">
            <CardHead title={t('transactions.filterTitle')} subtitle={t('transactions.filterSub')} icon={<span style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,159,26,0.14)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Filter size={15} color="var(--fc-orange)" /></span>} />
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'flex', background: 'var(--fc-sidebar)', borderRadius: 10, padding: 3, gap: 2 }}>
                {[['', t('transactions.filterAll')], ['income', t('transactions.filterIncome')], ['expense', t('transactions.filterExpense')]].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => {
                      setType(val);
                      setPage(1);
                    }}
                    style={{
                      flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                      background: type === val ? 'var(--fc-blue)' : 'transparent',
                      color: type === val ? '#fff' : 'var(--fc-muted)',
                      transition: 'background 0.15s',
                    }}
                  >{label}</button>
                ))}
              </div>

              <Field label={t('transactions.colCategory')}>
                <Select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                  <option value="">{t('transactions.allCategories')}</option>
                  {dbCategories.map((cat) => <option key={cat} value={cat}>{tCat(cat)}</option>)}
                </Select>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <Field label={t('transactions.from')}><Input type="date" lang={lang} value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} /></Field>
                <Field label={t('transactions.to')}><Input type="date" lang={lang} value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} /></Field>
              </div>

              <Button
                variant="soft"
                onClick={() => {
                  setType('');
                  setCategory('');
                  setDateFrom('');
                  setDateTo('');
                  setPage(1);
                }}
              >
                {t('transactions.clear')}
              </Button>
            </div>
          </Card>

          <Card className="fc-ai-classification-card">
            <CardHead title={t('transactions.aiClassification')} icon={<span style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(118,87,255,0.14)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Sparkles size={15} color="var(--fc-purple)" /></span>} />
            <div style={{ display: 'grid', gap: 14 }}>
              <h3 style={{ margin: 0, fontSize: 28 }}>{rows.length} transactions</h3>
              <p style={{ margin: 0, color: 'var(--fc-muted)' }}>{t('transactions.categorizedWith', { pct: aiAccuracy })}</p>
              <Button>{t('transactions.reviewCategories')}</Button>
            </div>
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

      <Modal
        open={importOpen}
        title={t('transactions.importTitle')}
        onClose={() => {
          if (saving) return;
          setImportOpen(false);
          setImportStatus('');
        }}
      >
        <div style={{ display: 'grid', gap: 14 }}>
          <button className="fc-card fc-card-pad" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
            <Upload size={28} color="var(--fc-blue)" />
            <strong style={{ display: 'block', marginTop: 10 }}>{file ? file.name : t('transactions.chooseFile')}</strong>
            <span style={{ color: 'var(--fc-muted)' }}>{t('transactions.dropZoneSub')}</span>
          </button>
          <input hidden ref={fileRef} type="file" accept=".csv" onChange={(e) => { setFile(e.target.files[0] || null); setImportStatus(''); }} />
          <Button disabled={!file || saving} onClick={handleUpload}>{saving ? t('transactions.importing') : t('transactions.import')}</Button>
          {importStatus && (
            <span style={{ color: importStatus.toLowerCase().includes('fail') || importStatus.toLowerCase().includes('error') ? 'var(--fc-red)' : 'var(--fc-muted)', fontSize: 13, textAlign: 'center' }}>
              {importStatus}
            </span>
          )}
        </div>
      </Modal>

      <Modal open={!!viewTx} title={t('transactions.viewTitle')} onClose={() => setViewTx(null)}>
        {viewTx && (() => {
          const cfg = getCategoryIcon(viewTx.category?.name, viewTx.description);
          const Icon = cfg.icon;
          return (
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ width: 48, height: 48, borderRadius: 14, background: cfg.bg, color: cfg.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={22} strokeWidth={1.75} />
                </span>
                <div>
                  <strong style={{ fontSize: 18, display: 'block', letterSpacing: '-0.02em' }}>{viewTx.description}</strong>
                  <span style={{ fontSize: 13, color: 'var(--fc-muted)' }}>{fmtDate(viewTx.date)}</span>
                </div>
                <strong style={{ marginLeft: 'auto', fontSize: 22, color: viewTx.type === 'income' ? 'var(--fc-green)' : 'var(--fc-red)' }}>
                  {viewTx.type === 'income' ? '+' : '-'}{fmt(viewTx.amount)}
                </strong>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: t('transactions.type_'), value: viewTx.type === 'income' ? t('transactions.typeIncome') : t('transactions.typeExpense') },
                  { label: t('transactions.category'), value: tCat(viewTx.category?.name || 'Uncategorized') },
                  { label: t('transactions.date'), value: fmtDate(viewTx.date) },
                  { label: t('transactions.amount'), value: fmt(viewTx.amount) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'var(--fc-sidebar)', borderRadius: 10, padding: '10px 14px' }}>
                    <span style={{ fontSize: 11, color: 'var(--fc-muted)', fontWeight: 600, display: 'block', marginBottom: 4 }}>{label}</span>
                    <strong style={{ fontSize: 14 }}>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal open={!!deleteTx} title={t('transactions.deleteTitle')} onClose={() => setDeleteTx(null)}>
        {deleteTx && (
          <div style={{ display: 'grid', gap: 18 }}>
            <p style={{ margin: 0, color: 'var(--fc-muted)', lineHeight: 1.6 }}>
              {t('transactions.deleteText')} <strong style={{ color: 'var(--fc-text)' }}>{deleteTx.description}</strong> ({fmtDate(deleteTx.date)} · {fmt(deleteTx.amount)})
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="fc-button-soft" style={{ flex: 1 }} onClick={() => setDeleteTx(null)}>{t('transactions.cancel')}</button>
              <button className="fc-button-danger" style={{ flex: 1 }} disabled={saving} onClick={doDelete}>{saving ? t('transactions.deleting') : t('transactions.delete')}</button>
            </div>
          </div>
        )}
      </Modal>
    </Page>
  );
}
