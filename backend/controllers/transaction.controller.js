const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { Transaction, Category } = require('../models');
const { parseCSV } = require('../utils/csvParser');

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
        await Transaction.create({
          user_id: req.user.id,
          date: row.date,
          description: row.description,
          amount: row.amount,
          type: row.type,
          category_id: null,
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

module.exports = { uploadCSV, getTransactions, updateTransactionCategory };
