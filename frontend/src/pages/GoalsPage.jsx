import { useState, useEffect } from 'react';
import { Plus, Trash2, PiggyBank } from 'lucide-react';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../services/goalService';
import ProgressBar from '../components/ui/ProgressBar';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [fundModal, setFundModal] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ title: '', target_amount: '', deadline: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    try {
      const res = await getGoals();
      setGoals(res.data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title || !form.target_amount || !form.deadline) {
      return setFormError('All fields are required.');
    }
    if (parseFloat(form.target_amount) <= 0) {
      return setFormError('Amount must be greater than 0.');
    }
    if (new Date(form.deadline) <= new Date()) {
      return setFormError('Deadline must be in the future.');
    }
    setSubmitting(true);
    try {
      await createGoal(form);
      setForm({ title: '', target_amount: '', deadline: '' });
      setShowForm(false);
      fetchGoals();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error creating goal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddFunds = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) return;
    const goal = goals.find((g) => g.id === fundModal);
    const newAmount = parseFloat(goal.current_amount) + parseFloat(fundAmount);
    try {
      await updateGoal(fundModal, { current_amount: newAmount });
      setFundModal(null);
      setFundAmount('');
      fetchGoals();
    } catch {
      // silent
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGoal(id);
      setDeleteConfirm(null);
      fetchGoals();
    } catch {
      // silent
    }
  };

  const fmt = (n) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Savings Goals</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus size={16} />
          New Goal
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Create a New Goal</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. Vacances été"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (€)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={form.target_amount}
                onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Goal'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setFormError(''); }}
                className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <PiggyBank size={48} className="mb-4 text-gray-300" />
          <p className="text-lg font-medium text-gray-500">No savings goals yet.</p>
          <p className="text-sm mt-1">Create your first goal to start saving!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => (
            <div key={goal.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900">{goal.title}</h3>
                    {goal.isOverdue && <Badge variant="expense" label="Overdue" />}
                    {parseFloat(goal.progress) >= 100 && (
                      <span className="text-green-600 font-semibold text-sm">✓ Goal Achieved!</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Deadline: {new Date(goal.deadline).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <button
                  onClick={() => setDeleteConfirm(goal.id)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <ProgressBar
                value={goal.progress}
                color={goal.isOverdue ? 'red' : 'indigo'}
                showPercentage
              />

              <div className="flex items-center justify-between mt-3">
                <span className="text-sm text-gray-600">
                  {fmt(goal.current_amount)} / {fmt(goal.target_amount)}
                </span>
                {parseFloat(goal.progress) < 100 && (
                  <button
                    onClick={() => setFundModal(goal.id)}
                    className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-100 transition font-medium"
                  >
                    + Add funds
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!fundModal} onClose={() => { setFundModal(null); setFundAmount(''); }} title="Add Funds">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">How much did you save?</p>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="0.00"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={handleAddFunds}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
            >
              Confirm
            </button>
            <button
              onClick={() => { setFundModal(null); setFundAmount(''); }}
              className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Goal">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Are you sure you want to delete this goal? This action cannot be undone.</p>
          <div className="flex gap-3">
            <button
              onClick={() => handleDelete(deleteConfirm)}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
            >
              Delete
            </button>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
