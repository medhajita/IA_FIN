const { Op, fn, col } = require('sequelize');
const { Transaction, Category, sequelize } = require('../models');

async function getSummary(req, res) {
  try {
    const where = { user_id: req.user.id };
    let period = null;

    if (req.query.month) {
      period = req.query.month;
    } else {
      const latest = await Transaction.findOne({
        where: { user_id: req.user.id },
        order: [['date', 'DESC']],
        attributes: ['date'],
        raw: true,
      });
      if (latest) period = latest.date.slice(0, 7);
    }

    if (period) {
      const [year, month] = period.split('-');
      where.date = {
        [Op.gte]: `${year}-${month}-01`,
        [Op.lt]: new Date(year, month, 1).toISOString().slice(0, 10),
      };
    }

    const [transactions, allTransactions] = await Promise.all([
      Transaction.findAll({ where }),
      Transaction.findAll({ where: { user_id: req.user.id } }),
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    for (const t of transactions) {
      const amount = parseFloat(t.amount);
      if (t.type === 'income') totalIncome += amount;
      else totalExpenses += amount;
    }

    let globalIncome = 0;
    let globalExpenses = 0;
    for (const t of allTransactions) {
      const amount = parseFloat(t.amount);
      if (t.type === 'income') globalIncome += amount;
      else globalExpenses += amount;
    }

    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0
      ? parseFloat(((totalIncome - totalExpenses) / totalIncome) * 100).toFixed(2)
      : 0;

    const globalBalance = globalIncome - globalExpenses;
    const globalSavingsRate = globalIncome > 0
      ? parseFloat(((globalIncome - globalExpenses) / globalIncome) * 100).toFixed(2)
      : 0;

    return res.status(200).json({
      data: {
        totalIncome: parseFloat(totalIncome.toFixed(2)),
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        balance: parseFloat(balance.toFixed(2)),
        savingsRate: parseFloat(savingsRate),
        transactionCount: transactions.length,
        period,
        global: {
          totalIncome: parseFloat(globalIncome.toFixed(2)),
          totalExpenses: parseFloat(globalExpenses.toFixed(2)),
          balance: parseFloat(globalBalance.toFixed(2)),
          savingsRate: parseFloat(globalSavingsRate),
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function getByCategory(req, res) {
  try {
    const where = { user_id: req.user.id, type: 'expense' };

    if (req.query.from && req.query.to) {
      where.date = {
        [Op.gte]: `${req.query.from}-01`,
        [Op.lte]: `${req.query.to}-31`,
      };
    } else if (req.query.month) {
      const [year, month] = req.query.month.split('-');
      where.date = {
        [Op.gte]: `${year}-${month}-01`,
        [Op.lt]: new Date(year, month, 1).toISOString().slice(0, 10),
      };
    }

    const [definedCategories, rows] = await Promise.all([
      Category.findAll({
        where: { type: 'expense' },
        attributes: ['id', 'name', 'color', 'type'],
        raw: true,
      }),
      Transaction.findAll({
      where,
      attributes: [
        'category_id',
        [fn('SUM', col('amount')), 'total'],
        [fn('COUNT', col('transactions.id')), 'count'],
      ],
      group: ['category_id'],
      raw: true,
      }),
    ]);

    const totalExpenses = rows.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);
    const totalsByCategory = new Map(rows.map((r) => [r.category_id, {
      total: parseFloat(parseFloat(r.total || 0).toFixed(2)),
      count: parseInt(r.count || 0),
    }]));

    const result = definedCategories.map((category) => {
      const aggregate = totalsByCategory.get(category.id) || { total: 0, count: 0 };
      return {
        categoryId: category.id,
        categoryName: category.name,
        color: category.color || '#6b7280',
        type: category.type,
        total: aggregate.total,
        count: aggregate.count,
        percentage: totalExpenses > 0
          ? parseFloat(((aggregate.total / totalExpenses) * 100).toFixed(2))
          : 0,
      };
    });

    if (totalsByCategory.has(null)) {
      const aggregate = totalsByCategory.get(null);
      result.push({
        categoryId: null,
        categoryName: 'Uncategorized',
        color: '#6b7280',
        type: 'expense',
        total: aggregate.total,
        count: aggregate.count,
        percentage: totalExpenses > 0
          ? parseFloat(((aggregate.total / totalExpenses) * 100).toFixed(2))
          : 0,
      });
    }

    result.sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return a.categoryName.localeCompare(b.categoryName);
    });

    return res.status(200).json({
      data: {
        categories: result,
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        source: 'database',
      },
    });
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
