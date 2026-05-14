const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.middleware');
const { getSummary, getByCategory, getMonthlyEvolution } = require('../controllers/dashboard.controller');

router.get('/summary', verifyToken, getSummary);
router.get('/by-category', verifyToken, getByCategory);
router.get('/monthly-evolution', verifyToken, getMonthlyEvolution);

module.exports = router;
