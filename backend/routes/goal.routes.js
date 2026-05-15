const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.middleware');
const { createGoal, getGoals, updateGoal, deleteGoal, contributeToGoal } = require('../controllers/goal.controller');

router.post('/',               verifyToken, createGoal);
router.get('/',                verifyToken, getGoals);
router.patch('/:id',           verifyToken, updateGoal);
router.delete('/:id',          verifyToken, deleteGoal);
router.post('/:id/contribute', verifyToken, contributeToGoal);

module.exports = router;
