const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { User, Transaction } = require('../models');
const { parseCSV } = require('../utils/csvParser');
const { categorizeByRules } = require('../utils/categorizer');

const DEMO_EMAIL = 'demo@finance.ai';
const DEMO_PASSWORD = 'Demo1234!';
const DEMO_CSV = path.join(__dirname, '../../frontend/public/demo-transactions.csv');

const CATEGORY_NAME_TO_ID = {
  alimentation: 1, transport: 2, abonnements: 3,
  loisirs: 4, santé: 5, logement: 6, salaire: 8, 'autre revenu': 9,
};

router.post('/seed', async (req, res) => {
  try {
    let user = await User.findOne({ where: { email: DEMO_EMAIL } });

    if (!user) {
      const password_hash = await bcrypt.hash(DEMO_PASSWORD, 10);
      user = await User.create({ name: 'Demo User', email: DEMO_EMAIL, password_hash });
    } else {
      await Transaction.destroy({ where: { user_id: user.id } });
    }

    const rows = await parseCSV(DEMO_CSV);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');

    for (const row of rows) {
      const category_id = categorizeByRules(row.description);
      // Remap dates to current month so dashboard + recommendations work
      const day = row.date.slice(8, 10);
      const date = `${currentYear}-${currentMonth}-${day}`;
      await Transaction.create({
        user_id: user.id,
        date,
        description: row.description,
        amount: Math.abs(row.amount),
        type: row.type,
        category_id,
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      data: { token, user: { id: user.id, name: user.name, email: user.email } },
      message: 'Demo seeded successfully',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
