const { generateRecommendations } = require('../utils/recommendationEngine');

const makeTx = (type, amount, category_id) => ({ type, amount, category_id });

describe('generateRecommendations', () => {
  it('triggers high food spending rule (>30% of expenses)', () => {
    const txs = [
      makeTx('income', 2000, null),
      makeTx('expense', 400, 1), // alimentation
      makeTx('expense', 100, 2), // other
    ];
    const recs = generateRecommendations(txs);
    expect(recs.some((r) => r.message.includes('alimentaires'))).toBe(true);
    expect(recs.some((r) => r.priority === 'high')).toBe(true);
  });

  it('triggers negative balance rule', () => {
    const txs = [
      makeTx('income', 500, null),
      makeTx('expense', 800, 6),
      makeTx('expense', 300, 2),
    ];
    const recs = generateRecommendations(txs);
    expect(recs.some((r) => r.message.includes('solde est négatif'))).toBe(true);
  });

  it('triggers positive savings encouragement (>20% savings rate)', () => {
    const txs = [
      makeTx('income', 3000, null),
      makeTx('expense', 500, 6),
    ];
    const recs = generateRecommendations(txs);
    expect(recs.some((r) => r.message.includes('Excellent'))).toBe(true);
    expect(recs.some((r) => r.priority === 'low')).toBe(true);
  });

  it('triggers low savings rate rule (<10%)', () => {
    const txs = [
      makeTx('income', 1000, null),
      makeTx('expense', 950, 6),
    ];
    const recs = generateRecommendations(txs);
    expect(recs.some((r) => r.message.includes("taux d'épargne"))).toBe(true);
  });

  it('triggers subscription rule (>3 subscriptions)', () => {
    const txs = [
      makeTx('income', 2000, null),
      makeTx('expense', 10, 3),
      makeTx('expense', 10, 3),
      makeTx('expense', 10, 3),
      makeTx('expense', 10, 3),
    ];
    const recs = generateRecommendations(txs);
    expect(recs.some((r) => r.message.includes('abonnements'))).toBe(true);
  });

  it('returns at most 4 recommendations', () => {
    const txs = [
      makeTx('income', 500, null),
      makeTx('expense', 300, 1),
      makeTx('expense', 200, 2),
      makeTx('expense', 10, 3),
      makeTx('expense', 10, 3),
      makeTx('expense', 10, 3),
      makeTx('expense', 10, 3),
    ];
    const recs = generateRecommendations(txs);
    expect(recs.length).toBeLessThanOrEqual(4);
  });

  it('high priority recs come before low priority', () => {
    const txs = [
      makeTx('income', 3000, null),
      makeTx('expense', 500, 1),
      makeTx('expense', 100, 2),
    ];
    const recs = generateRecommendations(txs);
    const priorities = recs.map((r) => r.priority);
    const order = { high: 0, medium: 1, low: 2 };
    for (let i = 1; i < priorities.length; i++) {
      expect(order[priorities[i]]).toBeGreaterThanOrEqual(order[priorities[i - 1]]);
    }
  });
});
