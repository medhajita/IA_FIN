const { Op } = require('sequelize');
const { Transaction, Recommendation } = require('../models');
const { generateRecommendations } = require('../utils/recommendationEngine');
const { chatCompletion } = require('../utils/hfClient');

const fmt = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

async function enrichWithAI(recs, financialSummary) {
  if (recs.length === 0) return recs;
  try {
    const items = recs
      .map((r, i) => `ITEM_${i + 1} [${r.priority}]: ${r.message}`)
      .join('\n');

    const systemPrompt = `You are a helpful French financial advisor. You MUST respond ONLY in French. Never use Chinese, English, or any other language. Output ONLY valid JSON, no other text.`;

    const userPrompt = `Rewrite each financial recommendation below in warm, natural French (1-2 sentences each). Keep the same priority values exactly.

Financial summary: ${financialSummary}

Recommendations to rewrite:
${items}

Respond with ONLY a JSON array with exactly ${recs.length} objects. Example format:
[{"message":"Votre texte ici.","priority":"high"}]

JSON:`;

    const raw = await chatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { maxTokens: 600, temperature: 0.4 }
    );

    const jsonMatch = raw.replace(/```[a-z]*\n?/g, '').match(/\[[\s\S]*\]/);
    if (!jsonMatch) return recs;
    const enriched = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(enriched) || enriched.length === 0) return recs;

    // Merge: use AI message where valid French, fall back to template otherwise
    return recs.map((orig, i) => {
      const ai = enriched[i];
      const msg = ai?.message && !/[一-鿿]/.test(ai.message) ? ai.message : orig.message;
      return { message: msg, priority: orig.priority };
    });
  } catch (err) {
    console.error('[enrichWithAI error]', err.message);
    return recs;
  }
}

async function getRecommendations(req, res) {
  try {
    const userId = req.user.id;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const firstDay = `${year}-${month}-01`;
    const lastDay = new Date(year, now.getMonth() + 1, 0).toISOString().slice(0, 10);

    const lastMonthDate = new Date(year, now.getMonth() - 1, 1);
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

    const lastMonthTransportTotal = lastMonthTransport.reduce((s, t) => s + parseFloat(t.amount), 0);
    const ruleRecs = generateRecommendations(currentTxns, lastMonthTransportTotal);

    // Build financial summary for AI context
    const income = currentTxns.filter((t) => t.type === 'income').reduce((s, t) => s + parseFloat(t.amount), 0);
    const expenses = currentTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + parseFloat(t.amount), 0);
    const savingsRate = income > 0 ? (((income - expenses) / income) * 100).toFixed(1) : 0;
    const financialSummary = `Revenus: ${fmt(income)} | Dépenses: ${fmt(expenses)} | Solde: ${fmt(income - expenses)} | Taux d'épargne: ${savingsRate}%`;

    const recs = await enrichWithAI(ruleRecs, financialSummary);

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
