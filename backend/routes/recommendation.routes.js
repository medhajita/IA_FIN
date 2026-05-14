const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.middleware');
const { getRecommendations } = require('../controllers/recommendation.controller');

router.get('/', verifyToken, getRecommendations);

module.exports = router;
