const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const axios = require('axios');
const { Transaction, Category } = require('../models');
const { parseCSV } = require('../utils/csvParser');
const { categorizeByRules } = require('../utils/categorizer');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

const CATEGORY_NAME_TO_ID = {
  'alimentation': 1,
  'transport': 2,
  'abonnements': 3,
  'loisirs': 4,
  'santé': 5,
  'logement': 6,
};

async function getCategoryIdFromML(description) {
  try {
    const { data } = await axios.post(`${ML_SERVICE_URL}/predict`, { description }, { timeout: 3000 });
    const name = (data.category || '').toLowerCase();
    return CATEGORY_NAME_TO_ID[name] || null;
  } catch {
    return null;
  }
}

async function resolveCategory(description, type) {
  if (type === 'income') return null;
  const ruleId = categorizeByRules(description);
  if (ruleId !== null) return ruleId;
  return getCategoryIdFromML(description);
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
        const category_id = await resolveCategory(row.description, row.type);
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
      const category_id = await resolveCategory(txn.description, txn.type);
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

module.exports = { uploadCSV, getTransactions, updateTransactionCategory, recategorize };
