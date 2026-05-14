const { Op } = require('sequelize');
const { Transaction, Recommendation } = require('../models');
const { generateRecommendations } = require('../utils/recommendationEngine');

async function getRecommendations(req, res) {
  try {
    const userId = req.user.id;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const firstDay = `${year}-${month}-01`;
    const lastDay = new Date(year, now.getMonth() + 1, 0).toISOString().slice(0, 10);

    // Last month range for transport comparison
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
        where: {
          user_id: userId,
          category_id: 2,
          type: 'expense',
          date: { [Op.between]: [lmFirst, lmLast] },
        },
        raw: true,
      }),
    ]);

    const lastMonthTransportTotal = lastMonthTransport.reduce(
      (s, t) => s + parseFloat(t.amount), 0
    );

    const recs = generateRecommendations(currentTxns, lastMonthTransportTotal);

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
