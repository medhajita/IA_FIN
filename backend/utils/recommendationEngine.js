const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function generateRecommendations(transactions, lastMonthTransportTotal = 0) {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const income = transactions.filter((t) => t.type === 'income');

  const totalExpenses = expenses.reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalIncome = income.reduce((s, t) => s + parseFloat(t.amount), 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  const alimentationTotal = expenses
    .filter((t) => t.category_id === 1)
    .reduce((s, t) => s + parseFloat(t.amount), 0);

  const subscriptions = transactions.filter((t) => t.category_id === 3);
  const subscriptionTotal = subscriptions.reduce((s, t) => s + parseFloat(t.amount), 0);

  const transportTotal = expenses
    .filter((t) => t.category_id === 2)
    .reduce((s, t) => s + parseFloat(t.amount), 0);

  const recs = [];

  // Rule 1 — High food spending
  if (totalExpenses > 0 && alimentationTotal / totalExpenses > 0.3) {
    const pct = Math.round((alimentationTotal / totalExpenses) * 100);
    const weeklyLimit = Math.round(alimentationTotal / 4);
    recs.push({
      message: `Vos dépenses alimentaires représentent ${pct}% de votre budget. Essayez de fixer une limite hebdomadaire de ${weeklyLimit}€ pour les courses et restaurants.`,
      priority: 'high',
    });
  }

  // Rule 2 — Too many subscriptions
  if (subscriptions.length > 3) {
    const avgCost = Math.round(subscriptionTotal / subscriptions.length);
    recs.push({
      message: `Vous avez ${subscriptions.length} abonnements actifs ce mois-ci. Vérifiez lesquels vous utilisez vraiment — annuler un seul peut vous économiser ${avgCost}€/mois.`,
      priority: 'medium',
    });
  }

  // Rule 3 — Low savings rate
  if (totalIncome > 0 && savingsRate < 10) {
    const pct = Math.round(savingsRate * 10) / 10;
    recs.push({
      message: `Votre taux d'épargne est de ${pct}% ce mois-ci. Pour améliorer votre situation, essayez de mettre de côté au moins 10% de vos revenus.`,
      priority: 'high',
    });
  }

  // Rule 4 — Rising transport costs
  if (lastMonthTransportTotal > 0 && transportTotal > lastMonthTransportTotal * 1.2) {
    const pct = Math.round(((transportTotal - lastMonthTransportTotal) / lastMonthTransportTotal) * 100);
    recs.push({
      message: `Vos dépenses de transport ont augmenté de ${pct}% ce mois-ci. Comparez vos trajets récurrents ou envisagez des alternatives.`,
      priority: 'medium',
    });
  }

  // Rule 5 — Negative balance
  if (balance < 0) {
    recs.push({
      message: `Votre solde est négatif ce mois-ci (${Math.abs(balance).toFixed(2)}€). Priorisez les dépenses essentielles (logement, alimentation, santé) et reportez les achats non nécessaires.`,
      priority: 'high',
    });
  }

  // Rule 6 — Good savings encouragement
  if (totalIncome > 0 && savingsRate > 20) {
    const pct = Math.round(savingsRate);
    recs.push({
      message: `Excellent ! Vous épargnez ${pct}% de vos revenus ce mois-ci. Continuez ainsi !`,
      priority: 'low',
    });
  }

  // Rule 7 — Moderate savings, push toward 20%
  if (totalIncome > 0 && savingsRate >= 10 && savingsRate < 20) {
    const pct = Math.round(savingsRate);
    recs.push({
      message: `Votre taux d'épargne est de ${pct}% ce mois-ci. Excellent début ! Essayez d'atteindre 20% en réduisant une dépense non essentielle.`,
      priority: 'medium',
    });
  }

  // Fallback — ensure at least 3 recommendations
  if (recs.length < 3 && totalIncome > 0) {
    recs.push({
      message: `Passez en revue vos dépenses régulièrement pour identifier les économies potentielles. Chaque euro mis de côté aujourd'hui compte pour demain.`,
      priority: 'low',
    });
  }

  return recs
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    .slice(0, 4);
}

module.exports = { generateRecommendations };
