const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const transactionRoutes = require('./routes/transaction.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const goalRoutes = require('./routes/goal.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const demoRoutes = require('./routes/demo.routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend', db: 'supabase' });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/chatbot', chatbotRoutes);
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/demo', demoRoutes);
}

const { Category } = require('./models');

sequelize.authenticate()
  .then(async () => {
    console.log('Connected to Supabase PostgreSQL');
    await Category.findOrCreate({
      where: { id: 10 },
      defaults: { id: 10, name: 'Épargne', type: 'expense', color: '#7657ff' },
    });
  })
  .catch((err) => console.error('DB connection error:', err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
