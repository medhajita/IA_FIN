const { processQuestion } = require('../utils/chatbotEngine');

const chatHistory = {};

const askQuestion = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const uid = req.user.id;
    if (!chatHistory[uid]) chatHistory[uid] = [];

    const answer = await processQuestion(question, uid, chatHistory[uid]);

    const timestamp = new Date().toISOString();
    chatHistory[uid].push(
      { role: 'user', text: question, timestamp },
      { role: 'bot', text: answer, timestamp }
    );
    if (chatHistory[uid].length > 40) {
      chatHistory[uid] = chatHistory[uid].slice(-40);
    }

    return res.json({ answer, timestamp });
  } catch (err) {
    console.error('[chatbot] Error:', err?.message);
    const noKey = err?.message?.startsWith('NO_KEY');
    return res.status(500).json({
      error: noKey
        ? 'No AI key configured. Add HF_TOKEN, GROQ_API_KEY, or DEEPSEEK_API_KEY to .env'
        : err.message,
    });
  }
};

const getChatHistory = (req, res) => {
  const history = chatHistory[req.user.id] || [];
  return res.json({ data: history.slice(-20) });
};

module.exports = { askQuestion, getChatHistory };
