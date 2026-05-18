const { SavingGoal, Transaction } = require('../models');

const createGoal = async (req, res) => {
  try {
    const { title, target_amount, deadline } = req.body;
    if (!title || !target_amount || !deadline) {
      return res.status(400).json({ error: 'title, target_amount and deadline are required' });
    }
    if (parseFloat(target_amount) <= 0) {
      return res.status(400).json({ error: 'target_amount must be greater than 0' });
    }
    if (new Date(deadline) <= new Date()) {
      return res.status(400).json({ error: 'deadline must be in the future' });
    }
    const goal = await SavingGoal.create({
      user_id: req.user.id,
      title,
      target_amount,
      deadline,
    });
    return res.status(201).json({ data: goal, message: 'Goal created' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getGoals = async (req, res) => {
  try {
    const goals = await SavingGoal.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });
    const today = new Date();
    const data = goals.map((g) => {
      const goal = g.toJSON();
      goal.progress = goal.target_amount > 0
        ? Math.min(100, (parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100)
        : 0;
      goal.isOverdue = goal.deadline && new Date(goal.deadline) < today
        && parseFloat(goal.current_amount) < parseFloat(goal.target_amount);
      return goal;
    });
    return res.json({ data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const updateGoal = async (req, res) => {
  try {
    const goal = await SavingGoal.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    const { current_amount, title, target_amount, deadline } = req.body;
    await goal.update({
      ...(current_amount !== undefined && { current_amount }),
      ...(title && { title }),
      ...(target_amount !== undefined && { target_amount }),
      ...(deadline && { deadline }),
    });
    return res.json({ data: goal, message: 'Goal updated' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const goal = await SavingGoal.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    await goal.destroy();
    return res.json({ message: 'Goal deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * POST /goals/:id/contribute
 * Adds funds to a goal and creates a matching expense transaction so the
 * main balance decreases automatically.
 */
const contributeToGoal = async (req, res) => {
  try {
    const userId  = req.user.id;
    const amount  = parseFloat(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const goal = await SavingGoal.findOne({ where: { id: req.params.id, user_id: userId } });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    if (parseFloat(goal.current_amount) >= parseFloat(goal.target_amount)) {
      return res.status(400).json({ error: 'Goal is already achieved' });
    }

    // Compute all-time balance (no month filter)
    const transactions = await Transaction.findAll({ where: { user_id: userId } });
    let totalIncome = 0, totalExpenses = 0;
    for (const t of transactions) {
      const a = parseFloat(t.amount);
      if (t.type === 'income') totalIncome += a;
      else totalExpenses += a;
    }
    const balance = parseFloat((totalIncome - totalExpenses).toFixed(2));

    if (amount > balance) {
      return res.status(400).json({
        error: `Solde insuffisant. Solde disponible : ${balance.toFixed(2)} €`,
        availableBalance: balance,
      });
    }

    const today = new Date().toISOString().slice(0, 10);
    await Transaction.create({
      user_id:     userId,
      date:        today,
      description: `Épargne - ${goal.title}`,
      amount,
      type:        'expense',
      category_id: 10,  // Épargne
    });

    // Cap contribution at remaining amount needed
    const remaining   = parseFloat(goal.target_amount) - parseFloat(goal.current_amount);
    const contributed = Math.min(amount, remaining);
    const newAmount   = parseFloat(goal.current_amount) + contributed;

    await goal.update({ current_amount: newAmount });

    const progress = parseFloat(goal.target_amount) > 0
      ? Math.min(100, (newAmount / parseFloat(goal.target_amount)) * 100)
      : 0;

    return res.status(200).json({
      data: {
        goal:         { ...goal.toJSON(), current_amount: newAmount, progress },
        newBalance:   parseFloat((balance - amount).toFixed(2)),
        contributed:  parseFloat(contributed.toFixed(2)),
      },
      message: 'Contribution ajoutée avec succès',
    });
  } catch (err) {
    console.error('[contributeToGoal]', err.message, err.stack);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

module.exports = { createGoal, getGoals, updateGoal, deleteGoal, contributeToGoal };
