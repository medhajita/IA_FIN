const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/auth.middleware');
const { askQuestion, getChatHistory } = require('../controllers/chatbot.controller');

router.post('/ask', verifyToken, askQuestion);
router.get('/history', verifyToken, getChatHistory);

module.exports = router;
