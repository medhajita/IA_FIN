const { Op } = require('sequelize');
const { Transaction, Recommendation } = require('../models');
const { chatCompletion } = require('../utils/aiClient');

const fmt = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

async function generateAIRecommendations(currentTxns, lastMonthTransportTotal) {
  const income = currentTxns.filter((t) => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0);
  const expenses = currentTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);
  const balance = income - expenses;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : '0.0';

  const byCategory = {};
  currentTxns.filter((t) => t.type === 'expense').forEach((t) => {
    const cid = t.category_id || 'unknown';
    byCategory[cid] = (byCategory[cid] || 0) + parseFloat(t.amount);
  });
  const catLines = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([cid, total]) => `- category_id=${cid}: ${fmt(total)}`)
    .join('\n');

  const summary = `MONTHLY DATA
Income: ${fmt(income)}
Expenses: ${fmt(expenses)}
Balance: ${fmt(balance)}
Savings rate: ${savingsRate}%
Last month transport spend: ${fmt(lastMonthTransportTotal)}
Top expense categories this month:
${catLines || '(none)'}`;

  const systemPrompt = `You are a French financial coach. Generate exactly 3 actionable, personalised recommendations based on the user's real data. Output strictly a JSON array. Each item has "message" (1-2 sentences in French, warm, specific to the numbers) and "priority" (one of: "high", "medium", "low"). No markdown, no commentary, only valid JSON.`;

  const userPrompt = `${summary}

Respond with exactly this format and nothing else:
[
  {"message": "...", "priority": "high|medium|low"},
  {"message": "...", "priority": "high|medium|low"},
  {"message": "...", "priority": "high|medium|low"}
]`;

  const raw = await chatCompletion(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { maxTokens: 600, temperature: 0.5 }
  );

  const cleaned = raw.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('AI response not parseable as JSON array');
  const parsed = JSON.parse(match[0]);
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('AI returned empty recommendations');

  return parsed
    .filter((r) => r && typeof r.message === 'string' && r.message.trim().length > 0)
    .map((r) => ({
      message: r.message.trim(),
      priority: ['high', 'medium', 'low'].includes(r.priority) ? r.priority : 'medium',
    }));
}

async function getRecommendations(req, res) {
  try {
    const userId = req.user.id;

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
    const month = String(monthIdx + 1).padStart(2, '0');
    const firstDay = `${year}-${month}-01`;
    const lastDay = new Date(year, monthIdx + 1, 0).toISOString().slice(0, 10);

    const lastMonthDate = new Date(year, monthIdx - 1, 1);
    const lmYear = lastMonthDate.getFullYear();
    const lmMonth = String(lastMonthDate.getMonth() + 1).padStart(2, '0');
    const lmFirst = `${lmYear}-${lmMonth}-01`;
    const lmLast = new Date(lmYear, lastMonthDate.getMonth() + 1, 0).toISOString().slice(0, 10);

    const [currentTxns, lastMonthTransport] = await Promise.all([
      Transaction.findAll({
        where: { user_id: userId, date: { [Op.between]: [firstDay, lastDay] } },
        raw: true,
      }),
      Transaction.findAll({
        where: { user_id: userId, category_id: 2, type: 'expense', date: { [Op.between]: [lmFirst, lmLast] } },
        raw: true,
      }),
    ]);

    if (currentTxns.length === 0) {
      return res.status(200).json({ data: { recommendations: [] } });
    }

    const lastMonthTransportTotal = lastMonthTransport.reduce((s, t) => s + parseFloat(t.amount), 0);

    let recs;
    try {
      recs = await generateAIRecommendations(currentTxns, lastMonthTransportTotal);
    } catch (aiErr) {
      console.error('[recommendations:ai-failed]', aiErr?.message);
      return res.status(503).json({
        error: 'AI service unavailable. Recommendations could not be generated. Please try again shortly.',
      });
    }

    await Recommendation.destroy({ where: { user_id: userId } });
    if (recs.length > 0) {
      await Recommendation.bulkCreate(
        recs.map((r) => ({ user_id: userId, message: r.message, priority: r.priority }))
      );
    }

    return res.status(200).json({ data: { recommendations: recs } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { getRecommendations };
