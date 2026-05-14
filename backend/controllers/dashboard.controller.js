const { Op, fn, col, literal } = require('sequelize');
const { Transaction, Category, sequelize } = require('../models');

async function getSummary(req, res) {
  try {
    const where = { user_id: req.user.id };

    if (req.query.month) {
      const [year, month] = req.query.month.split('-');
      where.date = {
        [Op.gte]: `${year}-${month}-01`,
        [Op.lt]: new Date(year, month, 1).toISOString().slice(0, 10),
      };
    }

    const transactions = await Transaction.findAll({ where });

    let totalIncome = 0;
    let totalExpenses = 0;

    for (const t of transactions) {
      const amount = parseFloat(t.amount);
      if (t.type === 'income') totalIncome += amount;
      else totalExpenses += amount;
    }

    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0
      ? parseFloat(((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(2)
      : 0;

    return res.status(200).json({
      data: {
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        balance: parseFloat(balance.toFixed(2)),
        savingsRate: parseFloat(savingsRate),
        transactionCount: transactions.length,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getByCategory(req, res) {
  try {
    const where = { user_id: req.user.id, type: 'expense' };

    if (req.query.month) {
      const [year, month] = req.query.month.split('-');
      where.date = {
        [Op.gte]: `${year}-${month}-01`,
        [Op.lt]: new Date(year, month, 1).toISOString().slice(0, 10),
      };
    }

    const rows = await Transaction.findAll({
      where,
      attributes: [
        'category_id',
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('transactions.id')), 'count'],
      ],
      include: [{ model: Category, attributes: ['name', 'color'] }],
      group: ['category_id', 'category.id'],
      order: [[literal('"total"'), 'DESC']],
    });

    const totalExpenses = rows.reduce((sum, r) => sum + parseFloat(r.dataValues.total), 0);

    const result = rows.map((r) => ({
      categoryId: r.category_id,
      categoryName: r.category?.name || 'Uncategorized',
      color: r.category?.color || '#6b7280',
      total: parseFloat(parseFloat(r.dataValues.total).toFixed(2)),
      count: parseInt(r.dataValues.count),
      percentage: totalExpenses > 0
        ? parseFloat(((parseFloat(r.dataValues.total) / totalExpenses) * 100).toFixed(2))
        : 0,
    }));

    return res.status(200).json({ data: { categories: result, totalExpenses: parseFloat(totalExpenses.toFixed(2)) } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getMonthlyEvolution(req, res) {
  try {
    const rows = await sequelize.query(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
         SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS income,
         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses
       FROM transactions
       WHERE user_id = :userId
         AND date >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
       GROUP BY DATE_TRUNC('month', date)
       ORDER BY DATE_TRUNC('month', date) ASC`,
      {
        replacements: { userId: req.user.id },
        type: sequelize.constructor.QueryTypes.SELECT,
      }
    );

    const result = rows.map((r) => ({
      month: r.month,
      income: parseFloat(parseFloat(r.income).toFixed(2)),
      expenses: parseFloat(parseFloat(r.expenses).toFixed(2)),
      balance: parseFloat((parseFloat(r.income) - parseFloat(r.expenses)).toFixed(2)),
    }));

    return res.status(200).json({ data: { evolution: result } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { getSummary, getByCategory, getMonthlyEvolution };
