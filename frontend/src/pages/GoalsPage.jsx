import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Car, Laptop, Pencil, PiggyBank, Plus, ShieldCheck, Trash2, Umbrella, Wallet } from 'lucide-react';
import { getSummary } from '../services/dashboardService';
import { contributeToGoal, createGoal, deleteGoal, getGoals, updateGoal } from '../services/goalService';
import api from '../services/api';
import { Button, Card, CardHead, Field, Input, MetricCard, Modal, Page, PageHeader, Progress } from '../components/fincoach/FinCoachUI';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFmt } from '../context/CurrencyContext';
import { useI18n } from '../context/I18nContext';



export default function GoalsPage() {
  const fmt = useFmt();
  const { lang, t } = useI18n();
  const [goals, setGoals] = useState([]);
  const [balance, setBalance] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [open, setOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [contributeTarget, setContributeTarget] = useState(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [form, setForm] = useState({ title: '', target_amount: '', deadline: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [goalsRes, summaryRes, txRes] = await Promise.all([getGoals(), getSummary(), api.get('/transactions')]);
        setGoals(goalsRes.data.data);
        setBalance(summaryRes.data.data.balance);

        const txs = txRes.data.data.transactions || [];
        const byMonth = {};
        txs.forEach((tx) => {
          const d = new Date(`${tx.date}T00:00:00`);
          const key = d.toLocaleDateString('en-US', { month: 'short' });
          const order = d.getFullYear() * 12 + d.getMonth();
          if (!byMonth[key]) byMonth[key] = { month: key, saved: 0, order };
          byMonth[key].saved += tx.type === 'income' ? Number(tx.amount) : -Number(tx.amount);
        });
        const data = Object.values(byMonth)
          .sort((a, b) => a.order - b.order)
          .slice(-6)
          .map(({ month, saved }) => ({ month, saved: Math.max(0, Math.round(saved)) }));
        setChartData(data);
      } catch {
        setGoals([]);
        setBalance(0);
      }
    }
    load();
  }, []);

  const visibleGoals = goals;
  const totalSaved = visibleGoals.reduce((sum, goal) => sum + Number(goal.current_amount || 0), 0);
  const totalTarget = visibleGoals.reduce((sum, goal) => sum + Number(goal.target_amount || 0), 0);
  const overallProgress = totalTarget ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const isFr = lang === 'fr';
  const planCopy = {
    title: isFr ? 'Suggestions hebdo' : 'Weekly suggestions',
    subtitle: isFr ? 'Combien epargner par objectif' : 'How much to save per goal',
    remaining: isFr ? 'restant' : 'remaining',
    perWeek: isFr ? 'par semaine' : 'per week',
    completed: isFr ? 'Objectif atteint' : 'Goal reached',
    dueSoon: isFr ? 'A surveiller' : 'Watch closely',
    onTrack: isFr ? 'Sur la bonne voie' : 'On track',
    weeklyEffort: isFr ? 'Effort hebdo total' : 'Total weekly effort',
    available: isFr ? 'Disponible' : 'Available',
    noPlan: isFr ? 'Tous les objectifs sont termines. Creez un nouveau jalon pour continuer.' : 'All goals are complete. Create a new milestone to keep going.',
  };

  const savingsPlan = useMemo(() => {
    const now = new Date();
    const rows = visibleGoals.map((goal) => {
      const target = Number(goal.target_amount || 0);
      const current = Number(goal.current_amount || 0);
      const remaining = Math.max(0, target - current);
      const deadline = goal.deadline ? new Date(`${goal.deadline.slice(0, 10)}T00:00:00`) : now;
      const days = Math.max(1, Math.ceil((deadline - now) / 86400000));
      const weeks = Math.max(1, days / 7);
      const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
      const completed = remaining <= 0 || progress >= 100;
      return {
        ...goal,
        current,
        target,
        remaining,
        days,
        deadline,
        progress,
        completed,
        weekly: completed ? 0 : remaining / weeks,
        status: completed ? planCopy.completed : days <= 45 ? planCopy.dueSoon : planCopy.onTrack,
      };
    }).sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.deadline - b.deadline;
    });

    return rows.filter((goal) => !goal.completed).slice(0, 4);
  }, [visibleGoals, planCopy.completed, planCopy.dueSoon, planCopy.onTrack]);

  const weeklyEffort = savingsPlan.reduce((sum, goal) => sum + Number(goal.weekly || 0), 0);

  const recommendations = useMemo(() => {
    const active = visibleGoals.filter(g => Number(g.current_amount || 0) < Number(g.target_amount || 1));
    const completed = visibleGoals.filter(g => Number(g.current_amount || 0) >= Number(g.target_amount || 1));
    const recs = [];

    const byDeadline = [...active].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    if (byDeadline.length > 0) {
      const g = byDeadline[0];
      const remaining = Math.max(0, Number(g.target_amount) - Number(g.current_amount));
      const days = Math.max(7, Math.round((new Date(g.deadline) - new Date()) / 86400000));
      const perWeek = remaining / (days / 7);
      recs.push({
        icon: PiggyBank, color: 'var(--fc-green)',
        title: `Save ${fmt(perWeek)}/week`,
        text: `To reach "${g.title}" by ${new Date(g.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
      });
    }

    const byProgress = [...active].sort((a, b) =>
      (Number(a.current_amount) / Number(a.target_amount)) - (Number(b.current_amount) / Number(b.target_amount))
    );
    const lowestNotFirst = byProgress.find(g => g.id !== byDeadline[0]?.id) || byProgress[0];
    if (lowestNotFirst) {
      const pct = Math.round((Number(lowestNotFirst.current_amount) / Number(lowestNotFirst.target_amount)) * 100);
      recs.push({
        icon: ShieldCheck, color: 'var(--fc-purple)',
        title: `Prioritize "${lowestNotFirst.title}"`,
        text: `Only ${pct}% complete — needs attention`,
      });
    }

    if (completed.length > 0) {
      recs.push({
        icon: CalendarDays, color: 'var(--fc-blue)',
        title: `"${completed[0].title}" completed!`,
        text: 'Great job! Consider starting a new goal.',
      });
    }

    if (recs.length === 0) {
      recs.push({ icon: PiggyBank, color: 'var(--fc-green)', title: 'Create your first goal', text: 'Start tracking your savings milestones' });
    }

    return recs.slice(0, 3);
  }, [visibleGoals, fmt]);

  async function reload() {
    const res = await getGoals();
    setGoals(res.data.data);
  }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createGoal(form);
      await reload();
      setOpen(false);
      setForm({ title: '', target_amount: '', deadline: '' });
    } finally {
      setSaving(false);
    }
  }

  async function submitEdit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateGoal(editGoal.id, { title: editGoal.title, target_amount: editGoal.target_amount, deadline: editGoal.deadline });
      await reload();
      setEditGoal(null);
    } finally {
      setSaving(false);
    }
  }

  async function doDelete() {
    setSaving(true);
    try {
      await deleteGoal(deleteTarget.id);
      await reload();
      setDeleteTarget(null);
    } finally {
      setSaving(false);
    }
  }

  async function doContribute(e) {
    e.preventDefault();
    if (!contributeAmount || Number(contributeAmount) <= 0) return;
    setSaving(true);
    try {
      await contributeToGoal(contributeTarget.id, Number(contributeAmount));
      await reload();
      setContributeTarget(null);
      setContributeAmount('');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Page>
      <PageHeader
        title={t('goals.title')}
        subtitle={t('goals.subtitle')}
        actions={<Button onClick={() => setOpen(true)}><Plus size={16} />{t('goals.create')}</Button>}
      />

      <div className="fc-grid fc-grid-4">
        <MetricCard title={t('goals.totalSaved')} value={fmt(totalSaved)} note={`${t('goals.availableBalance')} ${fmt(balance)}`} icon={PiggyBank} tone="green" />
        <MetricCard title={t('goals.totalGoals')} value={visibleGoals.length} note={t('goals.activeSavingsGoals')} icon={CalendarDays} tone="blue" />
        <MetricCard title={t('goals.totalTarget')} value={fmt(totalTarget)} note={t('goals.combinedTarget')} icon={ShieldCheck} tone="purple" />
        <MetricCard title={t('goals.overallProgress')} value={`${overallProgress}%`} note={t('goals.acrossAllGoals')} icon={PiggyBank} tone="orange" />
      </div>

      <div className="fc-grid fc-main-grid" style={{ alignItems: 'start' }}>
        <div className="fc-grid fc-grid-2 fc-goals-grid" style={{ alignSelf: 'start' }}>
          {visibleGoals.length === 0 && (
            <div style={{ gridColumn: '1/-1', padding: '48px 0', textAlign: 'center', color: 'var(--fc-muted)', fontSize: 14 }}>
              <PiggyBank size={36} strokeWidth={1.4} style={{ marginBottom: 8 }} />
              <div>{t('goals.noGoals') || 'No goals yet. Create your first saving goal.'}</div>
            </div>
          )}
          {visibleGoals.map((goal) => {
            const Icon = goal.icon || PiggyBank;
            const progress = Number(goal.progress ?? ((goal.current_amount / goal.target_amount) * 100));
            const pct = Math.min(Math.round(progress), 100);
            return (
              <Card key={goal.id} style={{ alignSelf: 'start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className="fc-item-icon" style={{ color: 'var(--fc-blue)' }}><Icon size={18} /></span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="fc-badge fc-badge-blue">{pct}%</span>
                    <button className="fc-icon-button" aria-label="Contribute" onClick={() => { setContributeTarget(goal); setContributeAmount(''); }}><Wallet size={13} /></button>
                    <button className="fc-icon-button" aria-label="Edit" onClick={() => setEditGoal({ ...goal, target_amount: goal.target_amount, deadline: goal.deadline?.slice(0, 10) })}><Pencil size={13} /></button>
                    <button className="fc-icon-button" aria-label="Delete" onClick={() => setDeleteTarget(goal)}><Trash2 size={13} /></button>
                  </div>
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>{goal.title}</h3>
                <p style={{ margin: '0 0 10px', color: 'var(--fc-muted)', fontSize: 12 }}>{fmt(goal.current_amount)} {t('goals.savedOf')} {fmt(goal.target_amount)}</p>
                <Progress value={progress} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, color: 'var(--fc-muted)', fontSize: 11 }}>
                  <span>{t('goals.estimatedCompletion')}</span>
                  <strong style={{ color: 'var(--fc-text)', fontSize: 11 }}>{new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</strong>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="fc-grid" style={{ alignSelf: 'start' }}>
          <Card>
            <CardHead title={t('goals.savingsSummary')} subtitle={t('goals.monthlySavingsRhythm')} />
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--fc-muted)', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--fc-muted)', fontSize: 11 }} />
                <Tooltip cursor={{ fill: 'transparent' }} content={<GoalTooltip goals={visibleGoals} fmt={fmt} />} />
                <Bar dataKey="saved" fill="var(--fc-blue)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardHead title={t('goals.aiRecommendation')} />
            <div className="fc-list">
              {recommendations.map(({ icon: Icon, color, title, text }) => (
                <div className="fc-list-item" key={title}>
                  <span className="fc-item-icon" style={{ color }}><Icon size={18} /></span>
                  <div><strong>{title}</strong><span>{text}</span></div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="fc-goal-plan-card">
            <CardHead title={planCopy.title} subtitle={planCopy.subtitle} />
            {savingsPlan.length ? (
              <div className="fc-goal-plan-list">
                {savingsPlan.map((goal) => (
                  <div className="fc-goal-plan-item" key={goal.id || goal.title}>
                    <div className="fc-goal-plan-top">
                      <span className={`fc-goal-plan-dot ${goal.completed ? 'done' : goal.days <= 45 ? 'soon' : 'track'}`} />
                      <div className="fc-goal-plan-main">
                        <strong>{goal.title}</strong>
                        <span>{fmt(goal.remaining)} {planCopy.remaining}</span>
                      </div>
                      <strong className="fc-goal-plan-weekly">{fmt(goal.weekly)}/{planCopy.perWeek}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="fc-muted-note">{planCopy.noPlan}</p>
            )}
            <div className="fc-goal-plan-summary">
              <div>
                <span>{planCopy.weeklyEffort}</span>
                <strong>{fmt(weeklyEffort)}</strong>
              </div>
              <div>
                <span>{planCopy.available}</span>
                <strong>{fmt(balance)}</strong>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Modal open={open} title={t('goals.createTitle')} onClose={() => setOpen(false)}>
        <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
          <Field label={t('goals.goalName')}><Input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} required /></Field>
          <Field label={t('goals.targetAmount')}><Input type="number" value={form.target_amount} onChange={(e) => setForm((prev) => ({ ...prev, target_amount: e.target.value }))} required /></Field>
          <Field label={t('goals.deadlineLabel')}><Input type="date" value={form.deadline} onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))} required /></Field>
          <Button disabled={saving}>{saving ? t('goals.creating') : t('goals.create')}</Button>
        </form>
      </Modal>

      <Modal open={!!editGoal} title={t('goals.editTitle')} onClose={() => setEditGoal(null)}>
        {editGoal && (
          <form onSubmit={submitEdit} style={{ display: 'grid', gap: 14 }}>
            <Field label={t('goals.goalName')}><Input value={editGoal.title} onChange={(e) => setEditGoal((prev) => ({ ...prev, title: e.target.value }))} required /></Field>
            <Field label={t('goals.targetAmount')}><Input type="number" value={editGoal.target_amount} onChange={(e) => setEditGoal((prev) => ({ ...prev, target_amount: e.target.value }))} required /></Field>
            <Field label={t('goals.deadlineLabel')}><Input type="date" value={editGoal.deadline} onChange={(e) => setEditGoal((prev) => ({ ...prev, deadline: e.target.value }))} required /></Field>
            <Button disabled={saving}>{saving ? t('goals.saving') : t('goals.saveChanges')}</Button>
          </form>
        )}
      </Modal>

      <Modal open={!!contributeTarget} title={t('goals.fundModalTitle')} onClose={() => setContributeTarget(null)}>
        {contributeTarget && (
          <form onSubmit={doContribute} style={{ display: 'grid', gap: 14 }}>
            <p style={{ margin: 0, color: 'var(--fc-muted)', fontSize: 13 }}>
              {t('goals.savedOf').replace('saved of', 'Adding to')} <strong style={{ color: 'var(--fc-text)' }}>{contributeTarget.title}</strong> — {fmt(contributeTarget.current_amount)} / {fmt(contributeTarget.target_amount)}
            </p>
            <Field label={t('goals.amountToAdd')}><Input type="number" min="0.01" step="0.01" value={contributeAmount} onChange={(e) => setContributeAmount(e.target.value)} required autoFocus /></Field>
            <Button disabled={saving}>{saving ? t('goals.adding') : t('goals.addContribution')}</Button>
          </form>
        )}
      </Modal>

      <Modal open={!!deleteTarget} title={t('goals.deleteTitle')} onClose={() => setDeleteTarget(null)}>
        {deleteTarget && (
          <div style={{ display: 'grid', gap: 18 }}>
            <p style={{ margin: 0, color: 'var(--fc-muted)', lineHeight: 1.6 }}>
              {t('goals.deleteGoalText', { title: deleteTarget.title })}
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="fc-button-soft" style={{ flex: 1 }} onClick={() => setDeleteTarget(null)}>{t('goals.cancel')}</button>
              <button className="fc-button-danger" style={{ flex: 1 }} disabled={saving} onClick={doDelete}>{saving ? t('goals.deleting') : t('goals.delete')}</button>
            </div>
          </div>
        )}
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

function GoalTooltip({ active, payload, goals, fmt }) {
  if (!active || !payload?.length) return null;
  const { month, saved } = payload[0].payload;
  return (
    <div style={{ ...tooltipStyle, padding: '12px 14px', minWidth: 230 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <strong style={{ fontSize: 13 }}>{month}</strong>
        <span style={{ fontSize: 13, color: 'var(--fc-blue)', fontWeight: 700 }}>{fmt(saved)}</span>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {goals.map((g) => {
          const pct = Math.min(100, Math.round((Number(g.current_amount || 0) / Number(g.target_amount || 1)) * 100));
          return (
            <div key={g.id || g.title}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: 'var(--fc-text)' }}>{g.title}</span>
                <span style={{ color: 'var(--fc-blue)', fontWeight: 700 }}>{pct}%</span>
              </div>
              <div style={{ height: 4, borderRadius: 2, background: 'var(--fc-border)' }}>
                <div style={{ height: '100%', width: `${pct}%`, borderRadius: 2, background: 'var(--fc-blue)', transition: 'width 0.2s' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
