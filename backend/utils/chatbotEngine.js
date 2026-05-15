const { Transaction, Category } = require('../models');
const { Op } = require('sequelize');
const { chatCompletion } = require('./hfClient');

const fmt = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

async function buildFinancialContext(userId) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const transactions = await Transaction.findAll({
    where: { user_id: userId, date: { [Op.between]: [start, end] } },
    include: [{ model: Category, attributes: ['name'] }],
  });

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + parseFloat(t.amount), 0);
  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + parseFloat(t.amount), 0);
  const balance = income - expenses;
  const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;

  const byCategory = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const name = t.category?.name || 'Autre';
      byCategory[name] = (byCategory[name] || 0) + parseFloat(t.amount);
    });

  const categoryLines = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([name, total]) => `  - ${name}: ${fmt(total)}`)
    .join('\n');

  return { transactions, income, expenses, balance, savingsRate, categoryLines };
}

async function processQuestion(question, userId) {
  const { income, expenses, balance, savingsRate, categoryLines, transactions } =
    await buildFinancialContext(userId);

  const context = `Données financières du mois en cours :
- Revenus : ${fmt(income)}
- Dépenses totales : ${fmt(expenses)}
- Solde : ${fmt(balance)}
- Taux d'épargne : ${savingsRate}%
- Nombre de transactions : ${transactions.length}${categoryLines ? `\nDépenses par catégorie :\n${categoryLines}` : ''}`;

  try {
    const reply = await chatCompletion([
      {
        role: 'system',
        content: `Tu es un assistant financier personnel bienveillant et expert. Tu réponds UNIQUEMENT en français. Tu utilises les données financières ci-dessous pour répondre avec précision. Tes réponses sont courtes (2-3 phrases max), directes et pratiques. Tu ne donnes jamais de conseils d'investissement risqués ni de recommandations spéculatives.

${context}`,
      },
      { role: 'user', content: question },
    ], { maxTokens: 300, temperature: 0.5 });
    return reply.replace(/```[a-z]*\n?/g, '').trim();
  } catch {
    return fallback(question, { income, expenses, balance, savingsRate, transactions });
  }
}

function fallback(question, { income, expenses, balance, savingsRate, transactions }) {
  const q = question.toLowerCase();

  if (q.includes('dépens')) return `Ce mois-ci, vous avez dépensé ${fmt(expenses)} au total.`;
  if (q.includes('gagné') || q.includes('revenu')) return `Vos revenus ce mois-ci s'élèvent à ${fmt(income)}.`;
  if (q.includes('solde') || q.includes('reste')) return `Votre solde ce mois-ci est de ${fmt(balance)}.`;
  if (q.includes('épargne') || q.includes('taux')) return `Votre taux d'épargne est de ${savingsRate}%.`;
  if (q.includes('transaction')) return `Vous avez ${transactions.length} transaction(s) ce mois-ci.`;

  return `Je n'ai pas pu contacter l'assistant IA. Vous pouvez me demander : combien j'ai dépensé, quel est mon solde, mon taux d'épargne...`;
}

module.exports = { processQuestion };
