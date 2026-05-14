const { processQuestion } = require('../utils/chatbotEngine');

const chatHistory = {};

const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }
    const answer = await processQuestion(question, req.user.id);
    const timestamp = new Date().toISOString();

    if (!chatHistory[req.user.id]) chatHistory[req.user.id] = [];
    chatHistory[req.user.id].push(
      { role: 'user', text: question, timestamp },
      { role: 'bot', text: answer, timestamp }
    );
    if (chatHistory[req.user.id].length > 40) {
      chatHistory[req.user.id] = chatHistory[req.user.id].slice(-40);
    }

    return res.json({ answer, timestamp });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getChatHistory = (req, res) => {
  const history = chatHistory[req.user.id] || [];
  return res.json({ data: history.slice(-20) });
};

module.exports = { askQuestion, getChatHistory };
