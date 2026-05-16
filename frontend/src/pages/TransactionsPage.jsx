import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Upload, Download, AlertCircle, CheckCircle2, ArrowLeftRight,
  ChevronLeft, ChevronRight, Search, X, TrendingUp, TrendingDown, Wallet,
  ShoppingBasket, Car, RefreshCw, Ticket, HeartPulse, Home,
  MinusCircle, Banknote, ArrowUpCircle, Plus, Pencil, Trash2,
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Alimentation':  { icon: ShoppingBasket, bg: 'var(--green-bg)',    color: 'var(--green)'  },
  'Transport':     { icon: Car,            bg: 'var(--blue-bg)',     color: 'var(--blue)'   },
  'Abonnements':   { icon: RefreshCw,      bg: 'var(--purple-bg)',   color: 'var(--purple)' },
  'Loisirs':       { icon: Ticket,         bg: 'var(--orange-bg)',   color: 'var(--orange)' },
  'Santé':         { icon: HeartPulse,     bg: 'var(--red-bg)',      color: 'var(--red)'    },
  'Logement':      { icon: Home,           bg: 'var(--teal-bg)',     color: 'var(--teal)'   },
  'Autre dépense': { icon: MinusCircle,    bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)' },
  'Salaire':       { icon: Banknote,       bg: 'var(--green-bg)',    color: 'var(--green)'  },
  'Autre revenu':  { icon: ArrowUpCircle,  bg: 'var(--green-bg)',    color: 'var(--green)'  },
};
import { uploadCSV, updateCategory, createTransaction, updateTransaction, deleteTransaction } from '../services/transactionService';
import api from '../services/api';
import { useI18n } from '../context/I18nContext';

const PAGE_SIZE = 15;

const ALL_CATEGORIES = [
  { id: 1, name: 'Alimentation' }, { id: 2, name: 'Transport' },
  { id: 3, name: 'Abonnements' }, { id: 4, name: 'Loisirs' },
  { id: 5, name: 'Santé' }, { id: 6, name: 'Logement' },
  { id: 7, name: 'Autre dépense' }, { id: 8, name: 'Salaire' },
  { id: 9, name: 'Autre revenu' },
];

function fmt(amount) {
  return Number(amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}
function fmtDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR');
}
function toInputDate(dateStr) {
  if (!dateStr) return '';
  return dateStr.slice(0, 10);
}

const EMPTY_FORM = { description: '', amount: '', date: new Date().toISOString().slice(0, 10), type: 'expense', category_id: '' };

function TransactionModal({ open, onClose, onSave, initial, t }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (open) {
      setForm(initial
        ? { description: initial.description, amount: String(initial.amount), date: toInputDate(initial.date), type: initial.type, category_id: initial.category_id || '' }
        : EMPTY_FORM
      );
      setErr('');
    }
  }, [open, initial]);

  if (!open) return null;

  async function handleSave(e) {
    e.preventDefault();
    if (!form.description || !form.amount || !form.date || !form.type) return setErr(t('transactions.errSave'));
    setSaving(true);
    setErr('');
    try {
      await onSave({ ...form, amount: parseFloat(form.amount), category_id: form.category_id || undefined });
      onClose();
    } catch (ex) {
      setErr(ex.response?.data?.error || t('transactions.errSave'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-primary)', borderRadius: 'var(--radius-card)',
        width: '100%', maxWidth: 440, padding: 24, boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {initial ? t('transactions.editTransaction') : t('transactions.addTransaction')}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--text-secondary)' }}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {err && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--red-bg)', color: 'var(--red-text)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginBottom: 14, fontSize: 13 }}>
            <AlertCircle size={14} /> {err}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>{t('transactions.descriptionLabel')}</label>
            <input className="input-field" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>{t('transactions.amountLabel')}</label>
              <input type="number" min="0" step="0.01" className="input-field" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>{t('transactions.dateLabel')}</label>
              <input type="date" className="input-field" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ width: '100%' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>{t('transactions.typeLabel')}</label>
            <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 3, gap: 2 }}>
              {[{ v: 'income', l: t('transactions.typeIncome') }, { v: 'expense', l: t('transactions.typeExpense') }].map(({ v, l }) => (
                <button key={v} type="button" onClick={() => setForm(f => ({ ...f, type: v }))} style={{
                  flex: 1, padding: '6px 0', borderRadius: 'calc(var(--radius-sm) - 2px)',
                  fontSize: 13, fontWeight: form.type === v ? 600 : 500,
                  background: form.type === v ? 'var(--blue)' : 'transparent',
                  color: form.type === v ? '#fff' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>{t('transactions.categoryLabel')}</label>
            <select className="input-field" value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} style={{ width: '100%' }}>
              <option value="">{t('transactions.noneCategory')}</option>
              {ALL_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>{t('goals.cancel')}</button>
            <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1 }}>
              {saving ? t('transactions.creating') : (initial ? t('transactions.editTransaction') : t('transactions.addTransaction'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ open, onClose, onConfirm, t }) {
  const [deleting, setDeleting] = useState(false);
  if (!open) return null;
  async function go() {
    setDeleting(true);
    try { await onConfirm(); onClose(); }
    catch { /* silent */ }
    finally { setDeleting(false); }
  }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-card)', width: '100%', maxWidth: 360, padding: 24, boxShadow: '0 16px 48px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--red-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={17} color="var(--red-text)" strokeWidth={2} />
          </div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t('transactions.deleteTransaction')}</h2>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>{t('transactions.deleteConfirm')}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>{t('goals.cancel')}</button>
          <button onClick={go} disabled={deleting} style={{
            flex: 1, padding: '9px 0', borderRadius: 'var(--radius-sm)', border: 'none',
            background: 'var(--red)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>{deleting ? '…' : t('transactions.deleteTransaction')}</button>
        </div>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const { t } = useI18n();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ type: '', category_id: '', startDate: '', endDate: '' });
  const [dateDisplay, setDateDisplay] = useState({ start: '', end: '' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [showImport, setShowImport] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadAlert, setUploadAlert] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef();

  const [txnModal, setTxnModal] = useState({ open: false, editing: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  const fetchTransactions = useCallback(async (activeFilters) => {
    setLoading(true);
    setPage(1);
    try {
      const params = {};
      if (activeFilters.type) params.type = activeFilters.type;
      if (activeFilters.category_id) params.category_id = activeFilters.category_id;
      if (activeFilters.startDate) params.startDate = activeFilters.startDate;
      if (activeFilters.endDate) params.endDate = activeFilters.endDate;
      const res = await api.get('/transactions', { params });
      setTransactions(res.data.data.transactions);
    } catch (err) {
      setError(err.response?.data?.error || t('transactions.errLoad'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTransactions(filters); }, [filters]);

  useEffect(() => {
    if (transactions.length > 0 && !dateDisplay.start) {
      const sorted = [...transactions].map(t => t.date).sort();
      setDateDisplay({ start: sorted[0], end: sorted[sorted.length - 1] });
    }
  }, [transactions]);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith('.csv')) setFile(dropped);
    else setUploadAlert({ type: 'error', message: t('transactions.errCsvOnly') });
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setUploadAlert(null);
    try {
      const res = await uploadCSV(file);
      const { imported } = res.data.data;
      setUploadAlert({ type: 'success', message: t('transactions.imported', { count: imported }) });
      setFile(null);
      fetchTransactions(filters);
    } catch (err) {
      setUploadAlert({ type: 'error', message: err.response?.data?.error || t('transactions.errUpload') });
    } finally {
      setUploading(false);
    }
  }

  async function handleCategoryChange(txnId, categoryId) {
    try {
      await updateCategory(txnId, categoryId || null);
      setTransactions((prev) =>
        prev.map((t) => (t.id === txnId ? { ...t, category_id: categoryId ? Number(categoryId) : null } : t))
      );
    } catch { /* silent */ }
  }

  async function handleSaveTxn(data) {
    if (txnModal.editing) {
      await updateTransaction(txnModal.editing.id, data);
    } else {
      await createTransaction(data);
    }
    fetchTransactions(filters);
  }

  async function handleDelete() {
    await deleteTransaction(deleteModal.id);
    fetchTransactions(filters);
  }

  const totalIncome   = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const net           = totalIncome - totalExpenses;

  const filtered   = transactions.filter(t => !search || t.description.toLowerCase().includes(search.toLowerCase()));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const actionBtnStyle = (color) => ({
    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
    borderRadius: 7, display: 'flex', alignItems: 'center', color,
    transition: 'background 0.15s',
  });

  return (
    <div className="transactions-page-shell" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ── */}
      <div className="transactions-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 13, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--purple) 0%, #9ba3f7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(110,123,242,0.30)',
          }}>
            <ArrowLeftRight size={22} color="#fff" strokeWidth={1.75} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
              {t('transactions.title')}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '3px 0 0' }}>
              {loading ? '…' : `${transactions.length} transaction${transactions.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <div className="transactions-header-actions" style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => setTxnModal({ open: true, editing: null })}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--green-bg)', color: 'var(--green-text)',
              fontSize: 12, fontWeight: 600, padding: '7px 14px', whiteSpace: 'nowrap',
              borderRadius: 'var(--radius-tag)', border: 'none', cursor: 'pointer', flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            }}
          >
            <Plus size={14} strokeWidth={2.5} />
            {t('transactions.addTransaction')}
          </button>
          <button
            onClick={() => setShowImport(v => !v)}
            className="transactions-import-button"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--blue-bg)', color: 'var(--blue-text)',
              fontSize: 12, fontWeight: 600, padding: '7px 14px', whiteSpace: 'nowrap',
              borderRadius: 'var(--radius-tag)', border: 'none', cursor: 'pointer', flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            }}
          >
            <Upload size={14} strokeWidth={2} />
            {t('transactions.importCsv')}
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      {!loading && (
        <div className="transactions-stats-grid grid grid-cols-2 md:grid-cols-3 gap-[14px]">
          {[
            { label: t('transactions.income'),   value: `+${fmt(totalIncome)}`,   color: 'var(--green)', Icon: TrendingUp,   cls: '' },
            { label: t('transactions.expenses'), value: `-${fmt(totalExpenses)}`, color: 'var(--red)',   Icon: TrendingDown, cls: '' },
            { label: t('transactions.net'),      value: `${net >= 0 ? '+' : ''}${fmt(net)}`, color: net >= 0 ? 'var(--green)' : 'var(--red)', Icon: Wallet, cls: 'transaction-stat-net col-span-2 md:col-span-1 justify-self-center md:justify-self-auto w-[calc(50%-7px)] md:w-auto' },
          ].map(({ label, value, color, Icon, cls }) => (
            <div key={label} className={`card transaction-stat-card ${cls}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <Icon size={13} color={color} strokeWidth={2} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.03em', color: 'var(--text-secondary)' }}>
                  {label}
                </span>
              </div>
              <p style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: '-0.5px', margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Import CSV (toggled) ── */}
      {showImport && <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{t('transactions.importSection')}</h2>
          <a href="/example.csv" download style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>
            <Download size={14} strokeWidth={1.75} />
            {t('transactions.downloadSample')}
          </a>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--blue)' : 'var(--border)'}`,
            background: dragging ? 'var(--blue-bg)' : 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)', padding: '40px 20px',
            textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <Upload size={28} color="var(--text-tertiary)" strokeWidth={1.5} style={{ margin: '0 auto 10px', display: 'block' }} />
          {file ? (
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--blue)', margin: 0 }}>{file.name}</p>
          ) : (
            <>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', margin: '0 0 4px' }}>
                {t('transactions.dropZone')}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>{t('transactions.dropZoneSub')}</p>
            </>
          )}
          <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }}
            onChange={(e) => { setFile(e.target.files[0] || null); e.target.value = ''; }} />
        </div>

        <div style={{ marginTop: 16 }}>
          <button onClick={handleUpload} disabled={!file || uploading} className="btn-primary">
            {uploading
              ? <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : <Upload size={14} strokeWidth={1.75} />}
            {uploading ? t('transactions.importing') : t('transactions.import')}
          </button>
        </div>

        {uploadAlert && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginTop: 14,
            padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: 13,
            background: uploadAlert.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)',
            color: uploadAlert.type === 'success' ? 'var(--green-text)' : 'var(--red-text)',
          }}>
            {uploadAlert.type === 'success'
              ? <CheckCircle2 size={15} strokeWidth={2} style={{ flexShrink: 0 }} />
              : <AlertCircle size={15} strokeWidth={2} style={{ flexShrink: 0 }} />}
            {uploadAlert.message}
          </div>
        )}
      </div>}

      {/* ── Search ── */}
      <div className="card transactions-search-card" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Search size={16} color="var(--text-tertiary)" strokeWidth={1.75} style={{ flexShrink: 0 }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('transactions.searchPlaceholder')}
            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, color: 'var(--text-primary)', outline: 'none' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}>
              <X size={14} color="var(--text-tertiary)" />
            </button>
          )}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="card transactions-filter-card" style={{ padding: '12px 16px' }}>
        <div className="transactions-filter-wrap" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div className="transactions-type-filter" style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: 3, gap: 2 }}>
            {[{ v: '', l: t('transactions.filterAll') }, { v: 'income', l: t('transactions.filterIncome') }, { v: 'expense', l: t('transactions.filterExpense') }].map(({ v, l }) => {
              const active = filters.type === v;
              return (
                <button key={v} onClick={() => setFilters(f => ({ ...f, type: v }))} style={{
                  padding: '5px 14px', borderRadius: 'calc(var(--radius-sm) - 2px)',
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  background: active ? 'var(--blue)' : 'transparent',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                }}>{l}</button>
              );
            })}
          </div>

          <select value={filters.category_id}
            onChange={(e) => setFilters(f => ({ ...f, category_id: e.target.value }))}
            className="input-field transactions-category-select" style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}>
            <option value="">{t('transactions.allCategories')}</option>
            {ALL_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <div className="transactions-date-field" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{t('transactions.from')}</span>
            <input type="date"
              value={filters.startDate || dateDisplay.start}
              onChange={(e) => {
                const v = e.target.value;
                setDateDisplay(d => ({ ...d, start: v }));
                setFilters(f => ({ ...f, startDate: v }));
                setPage(1);
              }}
              className="input-field" style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }} />
          </div>

          <div className="transactions-date-field" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{t('transactions.to')}</span>
            <input type="date"
              value={filters.endDate || dateDisplay.end}
              onChange={(e) => {
                const v = e.target.value;
                setDateDisplay(d => ({ ...d, end: v }));
                setFilters(f => ({ ...f, endDate: v }));
                setPage(1);
              }}
              className="input-field" style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }} />
          </div>

          {(filters.category_id || filters.startDate || filters.endDate) && (
            <button onClick={() => {
              const sorted = [...transactions].map(t => t.date).sort();
              setDateDisplay({ start: sorted[0], end: sorted[sorted.length - 1] });
              setFilters({ type: '', category_id: '', startDate: '', endDate: '' });
            }}
              className="btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }}>
              {t('transactions.clear')}
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card transactions-list-card">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: 36, background: 'var(--bg-tertiary)', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--red)', fontSize: 13, padding: '16px 0' }}>
            <AlertCircle size={15} strokeWidth={2} /> {error}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Search size={32} strokeWidth={1.5} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4, color: 'var(--text-tertiary)' }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', margin: '0 0 4px' }}>
              {search ? t('transactions.noResults') : t('transactions.noTransactions')}
            </p>
          </div>
        ) : (
          <>
            {/* ── Mobile card list ── */}
            <div className="md:hidden transactions-mobile-list">
              {paginated.map((txn, i) => {
                const catName = ALL_CATEGORIES.find(c => c.id === txn.category_id)?.name || txn.category?.name;
                const cfg     = catName ? CATEGORY_ICONS[catName] : null;
                const CatIcon = cfg?.icon;
                return (
                  <div key={txn.id} className="transaction-mobile-row" style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 0',
                    borderBottom: i < paginated.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: cfg ? cfg.bg : 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {CatIcon ? <CatIcon size={17} strokeWidth={1.75} color={cfg.color} /> : <Wallet size={17} strokeWidth={1.75} color="var(--text-secondary)" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {txn.description}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                        {fmtDate(txn.date)}{catName ? ` · ${catName}` : ''}
                      </p>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: txn.type === 'income' ? 'var(--green)' : 'var(--red)', margin: '0 0 4px' }}>
                        {txn.type === 'income' ? '+' : '-'}{fmt(txn.amount)}
                      </p>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button style={actionBtnStyle('var(--blue)')} onClick={() => setTxnModal({ open: true, editing: txn })}>
                          <Pencil size={13} strokeWidth={2} />
                        </button>
                        <button style={actionBtnStyle('var(--red-text)')} onClick={() => setDeleteModal({ open: true, id: txn.id })}>
                          <Trash2 size={13} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop table ── */}
            <div className="hidden md:block" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, tableLayout: 'fixed' }}>
                <colgroup>
                  <col style={{ width: '5%' }} />
                  <col style={{ width: '11%' }} />
                  <col style={{ width: '27%' }} />
                  <col style={{ width: '13%' }} />
                  <col style={{ width: '12%' }} />
                  <col style={{ width: '23%' }} />
                  <col style={{ width: '9%' }} />
                </colgroup>
                <thead>
                  <tr>
                    {['', t('transactions.colDate'), t('transactions.colDescription'), t('transactions.colAmount'), t('transactions.colType'), t('transactions.colCategory'), ''].map((h, idx) => (
                      <th key={idx} style={{
                        padding: '8px 12px', fontWeight: 600, fontSize: 11,
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        color: 'var(--text-secondary)', textAlign: 'center',
                        borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((txn, i) => {
                    const catName = ALL_CATEGORIES.find(c => c.id === txn.category_id)?.name || txn.category?.name;
                    const cfg     = catName ? CATEGORY_ICONS[catName] : null;
                    const CatIcon = cfg?.icon;
                    return (
                    <tr key={txn.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, margin: '0 auto', background: cfg ? cfg.bg : 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {CatIcon ? <CatIcon size={14} strokeWidth={1.75} color={cfg.color} /> : <Wallet size={14} strokeWidth={1.75} color="var(--text-secondary)" />}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', textAlign: 'center', whiteSpace: 'nowrap' }}>{fmtDate(txn.date)}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{txn.description}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap', color: txn.type === 'income' ? 'var(--green)' : 'var(--red)' }}>
                        {txn.type === 'income' ? '+' : '-'}{fmt(txn.amount)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span className={`tag tag-${txn.type === 'income' ? 'green' : 'red'}`}>
                          {txn.type === 'income' ? t('transactions.tagIncome') : t('transactions.tagExpense')}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <select value={txn.category_id || ''}
                          onChange={(e) => handleCategoryChange(txn.id, e.target.value)}
                          className="input-field" style={{ padding: '4px 8px', fontSize: 12, width: '100%' }}>
                          <option value="">{t('transactions.noneCategory')}</option>
                          {ALL_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                          <button style={actionBtnStyle('var(--blue)')} title={t('transactions.editTransaction')}
                            onClick={() => setTxnModal({ open: true, editing: txn })}>
                            <Pencil size={13} strokeWidth={2} />
                          </button>
                          <button style={actionBtnStyle('var(--red-text)')} title={t('transactions.deleteTransaction')}
                            onClick={() => setDeleteModal({ open: true, id: txn.id })}>
                            <Trash2 size={13} strokeWidth={2} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                    style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                    <ChevronLeft size={15} color="var(--text-secondary)" />
                  </button>
                  <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                    style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>
                    <ChevronRight size={15} color="var(--text-secondary)" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <TransactionModal
        open={txnModal.open}
        onClose={() => setTxnModal({ open: false, editing: null })}
        onSave={handleSaveTxn}
        initial={txnModal.editing}
        t={t}
      />
      <DeleteModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={handleDelete}
        t={t}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @media (max-width: 640px) {
          .transactions-header { flex-direction: column; align-items: flex-start; gap: 10px; }
          .transactions-header-actions { width: 100%; justify-content: center; }
          .transactions-header-actions button { box-shadow: 0 2px 8px rgba(0,0,0,0.10); }
        }
      `}</style>
    </div>
  );
}
