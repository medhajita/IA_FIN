const { Transaction, Category, SavingGoal } = require('../models');
const { Op } = require('sequelize');
const { chatCompletion } = require('./aiClient');

const money = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);

async function buildContext(userId) {
  const latest = await Transaction.findOne({
    where: { user_id: userId },
    order: [['date', 'DESC']],
    attributes: ['date'],
    raw: true,
  });

  let year, monthIdx;
  if (latest) {
    const [y, m] = latest.date.slice(0, 7).split('-').map(Number);
    year = y;
    monthIdx = m - 1;
  } else {
    const now = new Date();
    year = now.getFullYear();
    monthIdx = now.getMonth();
  }
  const monthStr = String(monthIdx + 1).padStart(2, '0');
  const firstDay = `${year}-${monthStr}-01`;
  const lastDay = new Date(year, monthIdx + 1, 0).toISOString().slice(0, 10);

  const [monthTxns, allTxns, goals] = await Promise.all([
    Transaction.findAll({
      where: { user_id: userId, date: { [Op.between]: [firstDay, lastDay] } },
      include: [{ model: Category, attributes: ['name'] }],
      order: [['date', 'DESC']],
    }),
    Transaction.findAll({
      where: { user_id: userId },
      include: [{ model: Category, attributes: ['name'] }],
    }),
    SavingGoal.findAll({ where: { user_id: userId } }),
  ]);

  const sumByType = (rows, type) =>
    rows.filter((t) => t.type === type).reduce((s, t) => s + Number(t.amount), 0);

  const monthIncome = sumByType(monthTxns, 'income');
  const monthExpenses = sumByType(monthTxns, 'expense');
  const monthBalance = monthIncome - monthExpenses;
  const monthSavingsRate = monthIncome > 0 ? ((monthBalance / monthIncome) * 100).toFixed(1) : '0.0';

  const totalIncome = sumByType(allTxns, 'income');
  const totalExpenses = sumByType(allTxns, 'expense');
  const totalBalance = totalIncome - totalExpenses;

  const byCategory = {};
  monthTxns.filter((t) => t.type === 'expense').forEach((t) => {
    const name = t.category?.name || 'Other';
    byCategory[name] = (byCategory[name] || 0) + Number(t.amount);
  });
  const categoryLines = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([name, total], i) => {
      const pct = monthExpenses > 0 ? ((total / monthExpenses) * 100).toFixed(1) : '0.0';
      return `  ${i + 1}. ${name}: ${money(total)} (${pct}% of monthly expenses)`;
    })
    .join('\n');

  const recentLines = monthTxns.slice(0, 15).map((t) => {
    const sign = t.type === 'income' ? '+' : '-';
    const dateStr = new Date(t.date).toISOString().slice(0, 10);
    return `  • ${dateStr} | ${sign}${money(t.amount)} | ${t.category?.name || 'Other'}${t.description ? ` | "${t.description}"` : ''}`;
  }).join('\n');

  const goalLines = goals.map((g) => {
    const pct = Number(g.target_amount) > 0
      ? ((Number(g.current_amount) / Number(g.target_amount)) * 100).toFixed(1)
      : '0.0';
    const remaining = Math.max(0, Number(g.target_amount) - Number(g.current_amount));
    return `  • "${g.title}": saved ${money(g.current_amount)} / target ${money(g.target_amount)} (${pct}% done, ${money(remaining)} remaining)${g.deadline ? ` | deadline: ${g.deadline}` : ''}`;
  }).join('\n');

  const context = [
    '=== USER FINANCIAL DATA (real, current) ===',
    '',
    '--- CURRENT MONTH ---',
    `Period: ${firstDay} to ${lastDay}`,
    `Income this month: ${money(monthIncome)} (${monthTxns.filter((t) => t.type === 'income').length} transactions)`,
    `Expenses this month: ${money(monthExpenses)} (${monthTxns.filter((t) => t.type === 'expense').length} transactions)`,
    `Balance this month (income − expenses): ${money(monthBalance)}`,
    `Savings rate this month: ${monthSavingsRate}%`,
    '',
    '--- ALL-TIME TOTALS ---',
    `Total income (all transactions): ${money(totalIncome)}`,
    `Total expenses (all transactions): ${money(totalExpenses)}`,
    `Net balance overall: ${money(totalBalance)}`,
    '',
    '--- EXPENSES BY CATEGORY (current month) ---',
    categoryLines || '  (no expenses this month)',
    '',
    '--- RECENT TRANSACTIONS (current month, latest 15) ---',
    recentLines || '  (no transactions this month)',
    '',
    '--- SAVING GOALS ---',
    goalLines || '  (no goals set)',
  ].join('\n');

  return {
    monthIncome,
    monthExpenses,
    monthBalance,
    monthSavingsRate,
    totalBalance,
    transactionCount: monthTxns.length,
    context,
  };
}

async function processQuestion(question, userId, history = []) {
  const { context } = await buildContext(userId);

  const prior = history.slice(-8).map((m) => ({
    role: m.role === 'bot' ? 'assistant' : 'user',
    content: m.text,
  }));

  const messages = [
    {
      role: 'system',
      content: `You are FinCoach IA, a smart personal financial assistant.
You have access to the user's REAL financial data shown below. Always answer using these exact numbers — never invent or round arbitrarily.

LANGUAGE RULE:
Detect the language of the user's MOST RECENT message and respond in that same language.
- If the user writes in French → respond in French.
- If the user writes in English → respond in English.
- Match the user's language exactly, even if previous turns were in a different language.

VOCABULARY HINTS:
- "balance", "solde", "mon solde", "ma balance" → refer to the Balance this month (income − expenses) from the data below.
- "épargne", "savings", "taux d'épargne" → refer to the savings rate or total saved.
- "dépenses", "expenses", "spending" → refer to expenses this month.

RULES:
- Be concise and practical (3-5 sentences max). No disclaimers.
- Use the actual amounts from the data below. If a value is 0 or negative, say so plainly.
- If asked about a topic outside personal finance, briefly redirect to financial topics.
- Plain natural sentences only. No markdown headers, no bullet points.

${context}`,
    },
    ...prior,
    { role: 'user', content: question },
  ];

  const reply = await chatCompletion(messages, { maxTokens: 400, temperature: 0.5 });
  return reply.replace(/```[a-z]*\n?/g, '').trim();
}

module.exports = { processQuestion };
