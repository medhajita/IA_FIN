import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Download, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { uploadCSV, getTransactions, updateCategory } from '../services/transactionService';
import api from '../services/api';

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

export default function TransactionsPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadAlert, setUploadAlert] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ type: '', category_id: '', startDate: '', endDate: '' });
  const [page, setPage] = useState(1);

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
      setError(err.response?.data?.error || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTransactions(filters); }, [filters]);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.name.endsWith('.csv')) setFile(dropped);
    else setUploadAlert({ type: 'error', message: 'Only .csv files are accepted.' });
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setUploadAlert(null);
    try {
      const res = await uploadCSV(file);
      const { imported } = res.data.data;
      setUploadAlert({ type: 'success', message: `${imported} transactions imported successfully.` });
      setFile(null);
      fetchTransactions(filters);
    } catch (err) {
      setUploadAlert({ type: 'error', message: err.response?.data?.error || 'Upload failed.' });
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

  const paginated = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil(transactions.length / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Upload Zone */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Import CSV</h2>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
          }`}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          {file ? (
            <p className="text-sm font-medium text-indigo-600">{file.name}</p>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700">Drag & drop your CSV here, or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">Max 5 MB · .csv only</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { setFile(e.target.files[0] || null); e.target.value = ''; }}
          />
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {uploading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Upload className="w-4 h-4" />}
            {uploading ? 'Importing…' : 'Import'}
          </button>
          <a
            href="/example.csv"
            download
            className="flex items-center gap-1.5 text-sm text-indigo-600 hover:underline"
          >
            <Download className="w-4 h-4" />
            Download sample CSV
          </a>
        </div>

        {uploadAlert && (
          <div className={`flex items-center gap-2 mt-4 px-4 py-3 rounded-lg text-sm border ${
            uploadAlert.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {uploadAlert.type === 'success'
              ? <CheckCircle className="w-4 h-4 shrink-0" />
              : <AlertCircle className="w-4 h-4 shrink-0" />}
            {uploadAlert.message}
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Transactions
          {!loading && <span className="ml-2 text-sm font-normal text-gray-400">({transactions.length})</span>}
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={filters.category_id}
            onChange={(e) => setFilters((f) => ({ ...f, category_id: e.target.value }))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All categories</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {(filters.type || filters.category_id || filters.startDate || filters.endDate) && (
            <button
              onClick={() => setFilters({ type: '', category_id: '', startDate: '', endDate: '' })}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 border border-gray-200 rounded-lg"
            >
              Clear
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-red-600 text-sm py-4">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Upload className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-gray-500">No transactions yet.</p>
            <p className="text-sm mt-1">Import a CSV file to get started.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-3 font-medium text-gray-500 whitespace-nowrap">Date</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Description</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-500 whitespace-nowrap">Amount</th>
                    <th className="text-center py-2 px-3 font-medium text-gray-500">Type</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-500">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap">{fmtDate(t.date)}</td>
                      <td className="py-3 px-3 text-gray-900 max-w-xs truncate">{t.description}</td>
                      <td className={`py-3 px-3 text-right font-semibold whitespace-nowrap ${
                        t.type === 'income' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}>
                          {t.type === 'income' ? 'Income' : 'Expense'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={t.category_id || ''}
                          onChange={(e) => handleCategoryChange(t.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[150px]"
                        >
                          <option value="">— None —</option>
                          {ALL_CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, transactions.length)} of {transactions.length}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
