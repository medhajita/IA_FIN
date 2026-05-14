const request = require('supertest');
const app = require('../server');
const { User, Transaction } = require('../models');

const EMAIL = `test_dash_${Date.now()}@finance.test`;
let token, userId;

beforeAll(async () => {
  await request(app).post('/api/auth/register').send({ name: 'DashUser', email: EMAIL, password: 'Pass123!' });
  const res = await request(app).post('/api/auth/login').send({ email: EMAIL, password: 'Pass123!' });
  token = res.body.data.token;
  userId = res.body.data.user.id;
});

afterAll(async () => {
  await Transaction.destroy({ where: { user_id: userId } });
  await User.destroy({ where: { email: EMAIL } });
});

describe('GET /api/dashboard/summary', () => {
  it('returns zeros for user with no transactions', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalIncome).toBe(0);
    expect(res.body.data.totalExpenses).toBe(0);
    expect(res.body.data.balance).toBe(0);
    expect(res.body.data.transactionCount).toBe(0);
  });

  it('returns correct calculations', async () => {
    await Transaction.bulkCreate([
      { user_id: userId, date: '2025-10-01', description: 'Salaire', amount: 2000, type: 'income' },
      { user_id: userId, date: '2025-10-05', description: 'Loyer', amount: 800, type: 'expense' },
    ]);
    const res = await request(app)
      .get('/api/dashboard/summary?month=2025-10')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalIncome).toBe(2000);
    expect(res.body.data.totalExpenses).toBe(800);
    expect(res.body.data.balance).toBe(1200);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/dashboard/summary');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/dashboard/by-category', () => {
  it('returns category grouping with percentages', async () => {
    const res = await request(app)
      .get('/api/dashboard/by-category?month=2025-10')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.categories).toBeDefined();
    if (res.body.data.categories.length > 0) {
      expect(res.body.data.categories[0].percentage).toBeDefined();
    }
  });

  it('percentages sum to ~100', async () => {
    const res = await request(app)
      .get('/api/dashboard/by-category?month=2025-10')
      .set('Authorization', `Bearer ${token}`);
    const sum = res.body.data.categories.reduce((s, c) => s + c.percentage, 0);
    if (res.body.data.categories.length > 0) {
      expect(Math.round(sum)).toBe(100);
    }
  });
});

describe('GET /api/dashboard/monthly-evolution', () => {
  it('returns monthly data array', async () => {
    const res = await request(app)
      .get('/api/dashboard/monthly-evolution')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.evolution)).toBe(true);
  });

  it('each entry has month, income, expenses, balance', async () => {
    const res = await request(app)
      .get('/api/dashboard/monthly-evolution')
      .set('Authorization', `Bearer ${token}`);
    res.body.data.evolution.forEach((e) => {
      expect(e.month).toBeDefined();
      expect(e.income).toBeDefined();
      expect(e.expenses).toBeDefined();
      expect(e.balance).toBeDefined();
    });
  });
});
