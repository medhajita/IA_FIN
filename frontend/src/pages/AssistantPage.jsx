import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  CircleDollarSign,
  LayoutList,
  LineChart,
  Mic,
  Paperclip,
  PiggyBank,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { askQuestion } from '../services/chatbotService';
import { getByCategory, getSummary } from '../services/dashboardService';
import { getGoals } from '../services/goalService';
import { Badge, Button, Card, CardHead, Page, PageHeader, Progress } from '../components/fincoach/FinCoachUI';
import { useFmt } from '../context/CurrencyContext';
import { useI18n } from '../context/I18nContext';

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function goalProgress(goal) {
  const current = Number(goal?.current_amount || goal?.saved_amount || 0);
  const target = Number(goal?.target_amount || 0);
  return target > 0 ? Math.round((current / target) * 100) : 0;
}

export default function AssistantPage() {
  const fmt = useFmt();
  const { lang, t } = useI18n();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState({
    summary: { totalIncome: 0, totalExpenses: 0, balance: 0, savingsRate: 0, transactionCount: 0 },
    categories: [],
    goals: [],
  });
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages([
      { role: 'bot', text: t('assistant.botWelcome1') },
      { role: 'bot', text: t('assistant.botWelcome2') },
    ]);
  }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let alive = true;
    Promise.all([getSummary(), getByCategory(), getGoals()])
      .then(([sumRes, catRes, goalsRes]) => {
        if (!alive) return;
        setContext({
          summary: sumRes.data?.data || {},
          categories: catRes.data?.data?.categories || [],
          goals: goalsRes.data?.data || [],
        });
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const situation = useMemo(() => {
    const income = Number(context.summary.totalIncome || 0);
    const expenses = Number(context.summary.totalExpenses || 0);
    const balance = Number(context.summary.balance || income - expenses);
    const savingsRate = Number(context.summary.savingsRate || (income > 0 ? ((income - expenses) / income) * 100 : 0));
    const health = clamp(Math.round(42 + savingsRate * 1.35 + (balance > 0 ? 12 : -12)));
    const activeCategories = context.categories.filter((item) => Number(item.total || 0) > 0);
    const topCategory = activeCategories[0] || null;
    const mainGoal = [...context.goals].sort((a, b) => goalProgress(a) - goalProgress(b))[0] || null;
    const remainingGoal = mainGoal ? Math.max(0, Number(mainGoal.target_amount || 0) - Number(mainGoal.current_amount || 0)) : 0;
    const pressure = income > 0 ? clamp(Math.round((expenses / income) * 100)) : 0;

    return {
      income,
      expenses,
      balance,
      savingsRate,
      health,
      pressure,
      activeCategories,
      topCategory,
      mainGoal,
      remainingGoal,
      transactionCount: Number(context.summary.transactionCount || 0),
    };
  }, [context]);

  const quickActions = useMemo(() => [
    {
      label: t('assistant.analyzeSpending'),
      icon: LineChart,
      prompt: `Analyze my current spending. Income is ${fmt(situation.income)}, expenses are ${fmt(situation.expenses)}, and my top category is ${situation.topCategory?.categoryName || 'unknown'}.`,
    },
    {
      label: t('assistant.explainTransactions'),
      icon: CircleDollarSign,
      prompt: `Explain the financial situation from my ${situation.transactionCount} transactions and the category pressure.`,
    },
    {
      label: t('assistant.createSavingPlan'),
      icon: PiggyBank,
      prompt: `Create a saving plan. My balance is ${fmt(situation.balance)} and my main goal is ${situation.mainGoal?.title || 'not selected yet'}.`,
    },
    {
      label: t('assistant.reduceRisk'),
      icon: ShieldCheck,
      prompt: `What financial risk should I reduce first? My expense pressure is ${situation.pressure}% of income.`,
    },
    {
      label: t('assistant.topCategories'),
      icon: LayoutList,
      prompt: `What are my biggest spending categories this month? Break them down with amounts and percentages.`,
    },
    {
      label: t('assistant.whatChanged'),
      icon: Zap,
      prompt: `What changed this month in my finances? Income is ${fmt(situation.income)}, expenses are ${fmt(situation.expenses)}, savings rate is ${situation.savingsRate.toFixed(1)}%.`,
    },
    {
      label: t('assistant.improveBalance'),
      icon: TrendingUp,
      prompt: `How can I improve my monthly balance? Currently ${fmt(situation.balance)} with ${situation.pressure}% expense pressure on income.`,
    },
    {
      label: t('assistant.goalProgress'),
      icon: Target,
      prompt: `How is my goal "${situation.mainGoal?.title || 'main goal'}" going? I still need ${fmt(situation.remainingGoal)} to reach it.`,
    },
    {
      label: t('assistant.budgetHealth'),
      icon: Wallet,
      prompt: `Give me a full budget health check. Income ${fmt(situation.income)}, expenses ${fmt(situation.expenses)}, savings rate ${situation.savingsRate.toFixed(1)}%, ${situation.activeCategories.length} active categories.`,
    },
  ], [situation, fmt, t]);

  const insightCards = useMemo(() => {
    const topCategoryName = situation.topCategory?.categoryName || t('assistant.topCategory');
    const topCategoryShare = Number(situation.topCategory?.percentage || 0);
    const goalTitle = situation.mainGoal?.title || t('goals.createFirst');
    return [
      {
        title: situation.balance >= 0 ? t('assistant.positiveCashflow') : t('assistant.cashflowPressure'),
        text: situation.balance >= 0
          ? t('assistant.positiveCashflowText', { amount: fmt(situation.balance) })
          : t('assistant.negativeCashflowText', { amount: fmt(Math.abs(situation.balance)) }),
        tone: situation.balance >= 0 ? 'green' : 'red',
        icon: situation.balance >= 0 ? ArrowUpRight : ArrowDownRight,
      },
      {
        title: t('assistant.topCategory'),
        text: t('assistant.topCatText', { category: topCategoryName, pct: topCategoryShare.toFixed(2) }),
        tone: topCategoryShare > 40 ? 'orange' : 'blue',
        icon: TrendingDown,
      },
      {
        title: t('assistant.goalFocus'),
        text: situation.mainGoal ? t('assistant.goalNeedsText', { goal: goalTitle, amount: fmt(situation.remainingGoal) }) : t('assistant.noActiveGoalText'),
        tone: 'purple',
        icon: Target,
      },
    ];
  }, [situation, fmt, t]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text = input) {
    const value = text.trim();
    if (!value || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: value }]);
    setLoading(true);
    try {
      const res = await askQuestion(value, lang);
      setMessages((prev) => [...prev, { role: 'bot', text: res.data.answer }]);
    } catch (err) {
      const msg = err?.response?.data?.error || t('assistant.botError');
      setMessages((prev) => [...prev, { role: 'bot', text: msg }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page style={{ flex: 1, minHeight: 0 }}>
      <PageHeader title={t('assistant.title')} />

      <div className="fc-assistant-layout">
        <Card className="fc-assistant-side">
          <div className="fc-ai-command-card">
            <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(118,87,255,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fc-purple)', flexShrink: 0 }}><Sparkles size={20} /></span>
            <div>
              <strong>{t('assistant.commandCenter')}</strong>
              <span>{t('assistant.transactionsConnected', { count: situation.transactionCount })}</span>
            </div>
          </div>

          <CardHead title={t('assistant.smartActions')} subtitle={t('assistant.generatedFromData')} />
          <div className="fc-ai-action-list">
            {quickActions.map(({ label, icon: Icon, prompt }) => (
              <button key={label} type="button" onClick={() => send(prompt)} className="fc-ai-action">
                <span><Icon size={17} /></span>
                <strong>{label}</strong>
              </button>
            ))}
          </div>
        </Card>

        <Card className="fc-chat-panel fc-chat-panel-premium">
          <div className="fc-chat-head">
            <div>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(47,107,255,0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fc-blue)', flexShrink: 0 }}><Bot size={20} /></span>
              <div>
                <h2>FinCoach IA</h2>
                <p>{t('assistant.pageSubtitle')}</p>
              </div>
            </div>
          </div>

          <div className="fc-chat-situation-row">
            <div><span>{t('assistant.balanceLabel')}</span><strong>{fmt(situation.balance)}</strong></div>
            <div><span>{t('assistant.savingsLabel')}</span><strong>{situation.savingsRate.toFixed(1)}%</strong></div>
            <div><span>{t('assistant.pressureLabel')}</span><strong>{situation.pressure}%</strong></div>
          </div>

          <div className="fc-chat-body">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`fc-message fc-message-${message.role}`}>
                {message.text}
              </div>
            ))}
            {loading && (
              <div className="fc-typing">
                <Bot size={16} />
                {t('assistant.typing')}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="fc-suggestion-row">
            {[
              t('assistant.suggestQ1'),
              t('assistant.suggestQ2'),
              t('assistant.suggestQ3'),
              lang === 'fr' ? "Creer un plan d'epargne" : 'Create a saving plan',
            ].map((question) => (
              <button key={question} type="button" onClick={() => send(question)}>{question}</button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="fc-chat-input-row">
            <button type="button" className="fc-icon-button" aria-label="Upload"><Paperclip size={18} /></button>
            <button type="button" className="fc-icon-button" aria-label="Voice"><Mic size={18} /></button>
            <input className="fc-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t('assistant.placeholder')} />
            <Button aria-label="Send"><Send size={16} /></Button>
          </form>
        </Card>

        <div className="fc-ai-right-rail">
          <Card>
            <CardHead title={t('assistant.situationDashboard')} subtitle={t('assistant.liveFromData')} />
            <div className="fc-list">
              {[
                { label: t('assistant.monthlyIncome'), value: fmt(situation.income), icon: TrendingUp, color: 'var(--fc-green)' },
                { label: t('assistant.monthlyExpenses'), value: fmt(situation.expenses), icon: TrendingDown, color: 'var(--fc-red)' },
                { label: t('assistant.currentBalance'), value: fmt(situation.balance), icon: Wallet, color: situation.balance >= 0 ? 'var(--fc-blue)' : 'var(--fc-red)' },
                { label: t('assistant.mainGoal'), value: situation.mainGoal?.title || t('assistant.noGoalYet'), icon: Target, color: 'var(--fc-purple)' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div className="fc-list-item" key={label}>
                  <span className="fc-item-icon" style={{ color }}><Icon size={18} /></span>
                  <div><strong>{value}</strong><span>{label}</span></div>
                </div>
              ))}
            </div>
            <div className="fc-health-panel">
              <div className="fc-mini-row"><span>{t('assistant.financialHealth')}</span><strong>{situation.health}/100</strong></div>
              <Progress value={situation.health} />
            </div>
          </Card>

          <Card>
            <CardHead title={t('assistant.situationSignals')} />
            <div className="fc-list">
              {insightCards.map(({ title, text, tone, icon: Icon }) => (
                <div className="fc-list-item" key={title}>
                  <span className="fc-item-icon" style={{ color: `var(--fc-${tone})` }}><Icon size={18} /></span>
                  <div><strong>{title}</strong><span>{text}</span></div>
                  <Badge tone={tone}>{t('assistant.live')}</Badge>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </Page>
  );
}
