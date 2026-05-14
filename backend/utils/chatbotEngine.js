const { Transaction, Category } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

const fmt = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

async function processQuestion(question, userId) {
  const q = question.toLowerCase();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const transactions = await Transaction.findAll({
    where: {
      user_id: userId,
      date: { [Op.between]: [startOfMonth, endOfMonth] },
    },
    include: [{ model: Category, attributes: ['name', 'id'] }],
  });

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + parseFloat(t.amount), 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + parseFloat(t.amount), 0);

  const balance = income - expenses;
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  if (q.includes('combien') && q.includes('dépens')) {
    return `Ce mois-ci, vous avez dépensé ${fmt(expenses)} au total.`;
  }

  if (q.includes('combien') && (q.includes('gagné') || q.includes('revenu'))) {
    return `Ce mois-ci, vos revenus s'élèvent à ${fmt(income)}.`;
  }

  if (q.includes('solde') || q.includes('reste')) {
    return `Votre solde ce mois-ci est de ${fmt(balance)}.`;
  }

  if (q.includes('épargne') || q.includes('économis') || q.includes('taux')) {
    return `Votre taux d'épargne ce mois-ci est de ${savingsRate.toFixed(1)}%.`;
  }

  if ((q.includes('catégorie') || q.includes('categorie')) && q.includes('plus')) {
    const byCategory = {};
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const name = t.category?.name || 'Autre';
        byCategory[name] = (byCategory[name] || 0) + parseFloat(t.amount);
      });
    const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    if (!top) return 'Aucune dépense enregistrée ce mois-ci.';
    return `Votre catégorie de dépense la plus élevée est "${top[0]}" avec ${fmt(top[1])} ce mois-ci.`;
  }

  if (q.includes('abonnement')) {
    const subs = transactions.filter((t) => t.category?.name === 'Abonnements');
    const total = subs.reduce((s, t) => s + parseFloat(t.amount), 0);
    return `Vous avez ${subs.length} transaction(s) d'abonnements ce mois-ci pour un total de ${fmt(total)}.`;
  }

  if (q.includes('alimentation') || q.includes('courses')) {
    const food = transactions.filter((t) => t.category?.name === 'Alimentation');
    const total = food.reduce((s, t) => s + parseFloat(t.amount), 0);
    return `Vous avez dépensé ${fmt(total)} en alimentation ce mois-ci.`;
  }

  if (q.includes('transport')) {
    const tr = transactions.filter((t) => t.category?.name === 'Transport');
    const total = tr.reduce((s, t) => s + parseFloat(t.amount), 0);
    return `Vous avez dépensé ${fmt(total)} en transport ce mois-ci.`;
  }

  if (q.includes('transactions') && q.includes('combien')) {
    return `Vous avez ${transactions.length} transaction(s) ce mois-ci.`;
  }

  return `Je n'ai pas compris votre question. Vous pouvez me demander : combien j'ai dépensé, quel est mon solde, quelle est ma catégorie la plus dépensière, mon taux d'épargne...`;
}

module.exports = { processQuestion };
