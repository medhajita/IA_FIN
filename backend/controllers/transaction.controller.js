const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { Transaction, Category } = require('../models');
const { parseCSV } = require('../utils/csvParser');
const { categorizeByRules } = require('../utils/categorizer');
const { classifyWithAI } = require('../utils/aiCategorizer');

/**
 * Two-stage categorisation:
 * 1. Fast keyword rules (no API call)
 * 2. DeepSeek AI via HuggingFace (fallback to Autre dépense/revenu on failure)
 */
async function resolveCategory(description, amount, type) {
  const ruleId = categorizeByRules(description);
  if (ruleId !== null) return ruleId;
  return classifyWithAI(description, amount, type);
}

async function uploadCSV(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const errors = [];
  let imported = 0;

  try {
    const rows = await parseCSV(filePath);

    for (const row of rows) {
      try {
        const category_id = await resolveCategory(row.description, row.amount, row.type);
        await Transaction.create({
          user_id: req.user.id,
          date: row.date,
          description: row.description,
          amount: row.amount,
          type: row.type,
          category_id,
        });
        imported++;
      } catch (err) {
        errors.push({ row, error: err.message });
      }
    }

    return res.status(200).json({ data: { imported, errors }, message: `${imported} transactions imported` });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  } finally {
    fs.unlink(filePath, () => {});
  }
}

async function getTransactions(req, res) {
  try {
    const { category_id, type, startDate, endDate } = req.query;
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 500)
      : undefined;

    const where = { user_id: req.user.id };
    if (category_id) where.category_id = category_id;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = startDate;
      if (endDate) where.date[Op.lte] = endDate;
    }

    const transactions = await Transaction.findAll({
      where,
      include: [{ model: Category, attributes: ['id', 'name', 'color', 'type'] }],
      order: [['date', 'DESC']],
      ...(limit ? { limit } : {}),
    });

    return res.status(200).json({ data: { transactions } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function updateTransactionCategory(req, res) {
  try {
    const { id } = req.params;
    const { category_id } = req.body;

    const transaction = await Transaction.findOne({
      where: { id, user_id: req.user.id },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await transaction.update({ category_id: category_id || null });

    return res.status(200).json({ data: { transaction }, message: 'Category updated' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function recategorize(req, res) {
  try {
    const uncategorized = await Transaction.findAll({
      where: { user_id: req.user.id, category_id: null },
    });

    let updated = 0;
    for (const txn of uncategorized) {
      const category_id = await resolveCategory(txn.description, txn.amount, txn.type);
      if (category_id) {
        await txn.update({ category_id });
        updated++;
      }
    }

    return res.status(200).json({ data: { updated }, message: `${updated} transactions categorized` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function createTransaction(req, res) {
  try {
    const { date, description, amount, type, category_id } = req.body;
    if (!date || !description || !amount || !type) {
      return res.status(400).json({ error: 'date, description, amount and type are required' });
    }
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'type must be income or expense' });
    }
    const cat_id = category_id || (await resolveCategory(description, amount, type));
    const transaction = await Transaction.create({
      user_id: req.user.id,
      date,
      description,
      amount: parseFloat(amount),
      type,
      category_id: cat_id,
    });
    return res.status(201).json({ data: { transaction }, message: 'Transaction created' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const { date, description, amount, type, category_id } = req.body;
    const transaction = await Transaction.findOne({ where: { id, user_id: req.user.id } });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

    const updates = {};
    if (date)        updates.date        = date;
    if (description) updates.description = description;
    if (amount)      updates.amount      = parseFloat(amount);
    if (type)        updates.type        = type;
    if (category_id !== undefined) updates.category_id = category_id || null;

    await transaction.update(updates);
    return res.status(200).json({ data: { transaction }, message: 'Transaction updated' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOne({ where: { id, user_id: req.user.id } });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    await transaction.destroy();
    return res.status(200).json({ message: 'Transaction deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function seedDemo(req, res) {
  try {
    const userId = req.user.id;
    const existing = await Transaction.count({ where: { user_id: userId } });
    if (existing > 0) return res.json({ message: 'Already has data' });

    const demoCSV = path.join(__dirname, '../../frontend/public/demo-transactions.csv');
    if (!fs.existsSync(demoCSV)) return res.status(404).json({ error: 'Demo CSV not found' });

    const rows = await parseCSV(demoCSV);
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    for (const row of rows) {
      const category_id = categorizeByRules(row.description) ?? 7;
      const day = (row.date || '').slice(8, 10) || '01';
      await Transaction.create({
        user_id: userId,
        date: `${year}-${month}-${day}`,
        description: row.description,
        amount: Math.abs(row.amount),
        type: row.type,
        category_id,
      });
    }
    return res.json({ message: 'Demo data seeded', count: rows.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { uploadCSV, getTransactions, updateTransactionCategory, recategorize, createTransaction, updateTransaction, deleteTransaction, seedDemo };
