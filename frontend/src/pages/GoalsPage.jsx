import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, Target, PiggyBank, CheckCircle2, AlertCircle } from 'lucide-react';
import { getGoals, createGoal, updateGoal, deleteGoal, contributeToGoal } from '../services/goalService';
import { getSummary } from '../services/dashboardService';
import { useI18n } from '../context/I18nContext';
import ProgressBar from '../components/ui/ProgressBar';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import IconBox from '../components/ui/IconBox';

const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n ?? 0);

export default function GoalsPage() {
  const { t } = useI18n();
  const [goals,         setGoals]         = useState([]);
  const [balance,       setBalance]       = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [showForm,      setShowForm]      = useState(false);
  const [fundModal,     setFundModal]     = useState(null);   // goal id
  const [fundAmount,    setFundAmount]    = useState('');
  const [fundError,     setFundError]     = useState('');
  const [fundLoading,   setFundLoading]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editModal,     setEditModal]     = useState(null);  // goal object
  const [editForm,      setEditForm]      = useState({ title: '', target_amount: '', deadline: '' });
  const [editError,     setEditError]     = useState('');
  const [editSubmitting,setEditSubmitting]= useState(false);
  const [form,          setForm]          = useState({ title: '', target_amount: '', deadline: '' });
  const [formError,     setFormError]     = useState('');
  const [submitting,    setSubmitting]    = useState(false);

  const fetchAll = async () => {
    try {
      const [goalsRes, summaryRes] = await Promise.all([
        getGoals(),
        getSummary(),          // no month = all-time balance
      ]);
      setGoals(goalsRes.data.data);
      setBalance(summaryRes.data.data.balance);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openFundModal = (goalId) => {
    setFundModal(goalId);
    setFundAmount('');
    setFundError('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.title || !form.target_amount || !form.deadline)
      return setFormError(t('goals.errRequired'));
    if (parseFloat(form.target_amount) <= 0)
      return setFormError(t('goals.errAmount'));
    if (new Date(form.deadline) <= new Date())
      return setFormError(t('goals.errDeadline'));
    setSubmitting(true);
    try {
      await createGoal(form);
      setForm({ title: '', target_amount: '', deadline: '' });
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.error || t('goals.errCreate'));
    } finally { setSubmitting(false); }
  };

  const handleAddFunds = async () => {
    setFundError('');
    const amount = parseFloat(fundAmount);
    if (!fundAmount || amount <= 0) return setFundError(t('goals.errAmount'));

    // Client-side balance check (server also validates)
    if (balance !== null && amount > balance) {
      return setFundError(t('goals.errInsufficient', { balance: fmt(balance) }));
    }

    setFundLoading(true);
    try {
      const res = await contributeToGoal(fundModal, amount);
      setBalance(res.data.data.newBalance);
      setFundModal(null);
      setFundAmount('');
      fetchAll();
    } catch (err) {
      const msg = err.response?.data?.error;
      setFundError(msg || t('goals.errFund'));
      console.error('[contribute]', err.response?.status, msg, err.message);
    } finally { setFundLoading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGoal(id);
      setDeleteConfirm(null);
      fetchAll();
    } catch { /* silent */ }
  };

  const openEditModal = (goal) => {
    setEditModal(goal);
    setEditForm({
      title: goal.title,
      target_amount: String(goal.target_amount),
      deadline: goal.deadline ? goal.deadline.slice(0, 10) : '',
    });
    setEditError('');
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editForm.title || !editForm.target_amount || !editForm.deadline)
      return setEditError(t('goals.errRequired'));
    if (parseFloat(editForm.target_amount) <= 0)
      return setEditError(t('goals.errAmount'));
    setEditSubmitting(true);
    try {
      await updateGoal(editModal.id, editForm);
      setEditModal(null);
      fetchAll();
    } catch (err) {
      setEditError(err.response?.data?.error || t('goals.errEdit'));
    } finally { setEditSubmitting(false); }
  };

  const selectedGoal = goals.find((g) => g.id === fundModal);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="goals-page-shell" style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>

      {/* Header */}
      <div className="goals-page-header" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        {/* Title row */}
        <div className="goals-header" style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <div className="goals-header-icon" style={{
            width: 46, height: 46, borderRadius: 13, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--purple) 0%, #9ba3f7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(110,123,242,0.30)',
          }}>
            <Target size={22} color="#fff" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="goals-header-title" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
              {t('goals.title')}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '3px 0 0' }}>
              {t('goals.subtitle')}
            </p>
          </div>
        </div>
        {/* Balance + action row */}
        <div className="goals-actions-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          {balance !== null && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: balance >= 0 ? 'var(--green-bg)' : 'var(--red-bg)',
              color: balance >= 0 ? 'var(--green-text)' : 'var(--red-text)',
              fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
              padding: '7px 14px', borderRadius: 'var(--radius-tag)',
            }}>
              {t('goals.availableBalance')} {fmt(balance)}
            </span>
          )}
          <button onClick={() => setShowForm(!showForm)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--purple-bg)', color: 'var(--purple-text)',
            fontSize: 12, fontWeight: 600, padding: '7px 14px', whiteSpace: 'nowrap',
            borderRadius: 'var(--radius-tag)',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          }}>
            <Plus size={14} strokeWidth={2.5} />
            {t('goals.newGoal')}
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
            {t('goals.createTitle')}
          </h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {formError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
                background: 'var(--red-bg)', color: 'var(--red-text)', borderRadius: 'var(--radius-sm)', fontSize: 13,
              }}>
                <AlertCircle size={14} strokeWidth={2} />{formError}
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>{t('goals.titleLabel')}</label>
              <input type="text" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input-field" placeholder={t('goals.titlePlaceholder')} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>{t('goals.targetLabel')}</label>
              <input type="number" min="1" step="0.01" value={form.target_amount}
                onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                className="input-field" placeholder="500" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>{t('goals.deadlineLabel')}</label>
              <input type="date" value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="input-field" />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? t('goals.creating') : t('goals.create')}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setFormError(''); }} className="btn-ghost">
                {t('goals.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals list */}
      {goals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '72px 0', color: 'var(--text-tertiary)' }}>
          <PiggyBank size={48} strokeWidth={1.25} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }} />
          <p style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)', margin: '0 0 4px' }}>{t('goals.noGoals')}</p>
          <p style={{ fontSize: 13, margin: 0 }}>{t('goals.noGoalsSub')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {goals.map((goal) => {
            const achieved = parseFloat(goal.progress) >= 100;
            const overdue  = goal.isOverdue && !achieved;
            return (
              <div key={goal.id} className="card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {goal.title}
                      </h3>
                      {overdue && <span className="tag tag-red">{t('goals.overdue')}</span>}
                      {achieved && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>
                          <CheckCircle2 size={13} strokeWidth={2} /> {t('goals.achieved')}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
                      {t('goals.deadline')} {new Date(goal.deadline).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                    <button
                      onClick={() => openEditModal(goal)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: 'var(--text-tertiary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--blue)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                    >
                      <Pencil size={15} strokeWidth={1.75} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(goal.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: 'var(--text-tertiary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                    >
                      <Trash2 size={15} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>

                <ProgressBar value={goal.progress} color={overdue ? 'red' : 'blue'} showPercentage />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {fmt(goal.current_amount)} / {fmt(goal.target_amount)}
                  </span>
                  {!achieved && (
                    <button
                      onClick={() => openFundModal(goal.id)}
                      style={{
                        fontSize: 13, fontWeight: 500, padding: '5px 12px',
                        background: 'var(--blue-bg)', color: 'var(--blue)',
                        border: 'none', borderRadius: 'var(--radius-tag)', cursor: 'pointer',
                      }}
                    >
                      {t('goals.addFunds')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add funds modal ── */}
      <Modal isOpen={!!fundModal} onClose={() => setFundModal(null)} title={t('goals.fundModalTitle')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Goal info */}
          {selectedGoal && (
            <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                {selectedGoal.title}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                {t('goals.progression')} {fmt(selectedGoal.current_amount)} / {fmt(selectedGoal.target_amount)}
              </p>
            </div>
          )}

          {/* Available balance */}
          {balance !== null && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', background: balance > 0 ? 'var(--green-bg)' : 'var(--red-bg)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: balance > 0 ? 'var(--green-text)' : 'var(--red-text)' }}>
                {t('goals.balanceLabel')}
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: balance > 0 ? 'var(--green)' : 'var(--red)' }}>
                {fmt(balance)}
              </span>
            </div>
          )}

          {/* Error */}
          {fundError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px',
              background: 'var(--red-bg)', color: 'var(--red-text)', borderRadius: 'var(--radius-sm)', fontSize: 13,
            }}>
              <AlertCircle size={14} strokeWidth={2} style={{ flexShrink: 0 }} />
              {fundError}
            </div>
          )}

          <input
            type="number" min="0.01" step="0.01" value={fundAmount}
            onChange={(e) => { setFundAmount(e.target.value); setFundError(''); }}
            className="input-field" placeholder={t('goals.amountPlaceholder')} autoFocus
          />

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleAddFunds} disabled={fundLoading} className="btn-primary" style={{ flex: 1 }}>
              {fundLoading ? t('goals.confirming') : t('goals.confirm')}
            </button>
            <button onClick={() => setFundModal(null)} className="btn-ghost" style={{ flex: 1 }}>{t('goals.annuler')}</button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title={t('goals.deleteTitle')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            {t('goals.deleteConfirm')}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger" style={{ flex: 1 }}>{t('goals.delete')}</button>
            <button onClick={() => setDeleteConfirm(null)} className="btn-ghost" style={{ flex: 1 }}>{t('goals.cancel')}</button>
          </div>
        </div>
      </Modal>

      {/* Edit goal modal */}
      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title={t('goals.editTitle')}>
        <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {editError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: 'var(--red-bg)', color: 'var(--red-text)', borderRadius: 'var(--radius-sm)', fontSize: 13 }}>
              <AlertCircle size={14} strokeWidth={2} />{editError}
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>{t('goals.titleLabel')}</label>
            <input type="text" value={editForm.title}
              onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
              className="input-field" placeholder={t('goals.titlePlaceholder')} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>{t('goals.targetLabel')}</label>
            <input type="number" min="1" step="0.01" value={editForm.target_amount}
              onChange={(e) => setEditForm(f => ({ ...f, target_amount: e.target.value }))}
              className="input-field" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>{t('goals.deadlineLabel')}</label>
            <input type="date" value={editForm.deadline}
              onChange={(e) => setEditForm(f => ({ ...f, deadline: e.target.value }))}
              className="input-field" />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={editSubmitting} className="btn-primary" style={{ flex: 1 }}>
              {editSubmitting ? t('goals.creating') : t('goals.editGoal')}
            </button>
            <button type="button" onClick={() => setEditModal(null)} className="btn-ghost" style={{ flex: 1 }}>
              {t('goals.cancel')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
