import { useState, useEffect } from 'react';
import { Plus, Trash2, Target, PiggyBank, CheckCircle2, AlertCircle } from 'lucide-react';
import { getGoals, createGoal, updateGoal, deleteGoal } from '../services/goalService';
import ProgressBar from '../components/ui/ProgressBar';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import IconBox from '../components/ui/IconBox';

const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);

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
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title || !form.target_amount || !form.deadline) return setFormError('All fields are required.');
    if (parseFloat(form.target_amount) <= 0) return setFormError('Amount must be greater than 0.');
    if (new Date(form.deadline) <= new Date()) return setFormError('Deadline must be in the future.');
    setSubmitting(true);
    try {
      await createGoal(form);
      setForm({ title: '', target_amount: '', deadline: '' });
      setShowForm(false);
      fetchGoals();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Error creating goal.');
    } finally { setSubmitting(false); }
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
    } catch { /* silent */ }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGoal(id);
      setDeleteConfirm(null);
      fetchGoals();
    } catch { /* silent */ }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <Spinner size="lg" />
    </div>
  );

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <IconBox icon={Target} bgColor="var(--purple-bg)" iconColor="var(--purple)" size="md" />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px', margin: 0 }}>
            Savings Goals
          </h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={15} strokeWidth={2} />
          New Goal
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
            Create a New Goal
          </h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {formError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
                background: 'var(--red-bg)', color: 'var(--red-text)', borderRadius: 'var(--radius-sm)', fontSize: 13,
              }}>
                <AlertCircle size={14} strokeWidth={2} />
                {formError}
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Title</label>
              <input type="text" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field" placeholder="e.g. Vacances été" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Target Amount (€)</label>
              <input type="number" min="1" step="0.01" value={form.target_amount}
                onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                className="input-field" placeholder="500" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>Deadline</label>
              <input type="date" value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="input-field" />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Creating…' : 'Create Goal'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setFormError(''); }} className="btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals list */}
      {goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '72px 0', color: 'var(--text-tertiary)' }}>
          <PiggyBank size={48} strokeWidth={1.25} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }} />
          <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)', margin: '0 0 4px' }}>No savings goals yet.</p>
          <p style={{ fontSize: 13, margin: 0 }}>Create your first goal to start saving!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {goals.map((goal) => {
            const achieved = parseFloat(goal.progress) >= 100;
            const overdue = goal.isOverdue && !achieved;
            return (
              <div key={goal.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {goal.title}
                      </h3>
                      {overdue && (
                        <span className="tag tag-red">Overdue</span>
                      )}
                      {achieved && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>
                          <CheckCircle2 size={13} strokeWidth={2} /> Achieved!
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
                      Deadline: {new Date(goal.deadline).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <button
                    onClick={() => setDeleteConfirm(goal.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                      borderRadius: 6, color: 'var(--text-tertiary)',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                  >
                    <Trash2 size={15} strokeWidth={1.75} />
                  </button>
                </div>

                <ProgressBar value={goal.progress} color={overdue ? 'red' : 'blue'} showPercentage />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {fmt(goal.current_amount)} / {fmt(goal.target_amount)}
                  </span>
                  {!achieved && (
                    <button
                      onClick={() => setFundModal(goal.id)}
                      style={{
                        fontSize: 13, fontWeight: 500, padding: '5px 12px',
                        background: 'var(--blue-bg)', color: 'var(--blue)',
                        border: 'none', borderRadius: 'var(--radius-tag)', cursor: 'pointer',
                        transition: 'opacity 0.15s',
                      }}
                    >
                      + Add funds
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add funds modal */}
      <Modal isOpen={!!fundModal} onClose={() => { setFundModal(null); setFundAmount(''); }} title="Add Funds">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>How much did you save?</p>
          <input type="number" min="0.01" step="0.01" value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            className="input-field" placeholder="0.00" autoFocus />
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleAddFunds} className="btn-primary" style={{ flex: 1 }}>Confirm</button>
            <button onClick={() => { setFundModal(null); setFundAmount(''); }} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Goal">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Are you sure you want to delete this goal? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger" style={{ flex: 1 }}>Delete</button>
            <button onClick={() => setDeleteConfirm(null)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
