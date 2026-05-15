const { SavingGoal } = require('../models');

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

module.exports = { createGoal, getGoals, updateGoal, deleteGoal };
