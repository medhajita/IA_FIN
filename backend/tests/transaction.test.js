const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../server');
const { User, Transaction } = require('../models');

const EMAIL = `test_tx_${Date.now()}@finance.test`;
const EMAIL2 = `test_tx2_${Date.now()}@finance.test`;
let token, token2, userId, userId2, txId;

const CSV_PATH = path.join(__dirname, 'fixtures', 'test.csv');

beforeAll(async () => {
  // Create fixtures dir + test CSV
  fs.mkdirSync(path.join(__dirname, 'fixtures'), { recursive: true });
  fs.writeFileSync(CSV_PATH, 'date,description,amount,type\n2025-10-01,Carrefour,-50.00,expense\n2025-10-02,Salaire,2000.00,income\n');

  // Create two test users
  const r1 = await request(app).post('/api/auth/register').send({ name: 'TxUser1', email: EMAIL, password: 'Pass123!' });
  const r2 = await request(app).post('/api/auth/register').send({ name: 'TxUser2', email: EMAIL2, password: 'Pass123!' });

  const l1 = await request(app).post('/api/auth/login').send({ email: EMAIL, password: 'Pass123!' });
  const l2 = await request(app).post('/api/auth/login').send({ email: EMAIL2, password: 'Pass123!' });

  token = l1.body.data.token;
  token2 = l2.body.data.token;
  userId = l1.body.data.user.id;
  userId2 = l2.body.data.user.id;
});

afterAll(async () => {
  await Transaction.destroy({ where: { user_id: [userId, userId2] } });
  await User.destroy({ where: { email: [EMAIL, EMAIL2] } });
  fs.rmSync(path.join(__dirname, 'fixtures'), { recursive: true, force: true });
});

describe('POST /api/transactions/upload', () => {
  it('imports valid CSV', async () => {
    const res = await request(app)
      .post('/api/transactions/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', CSV_PATH);
    expect(res.status).toBe(200);
    expect(res.body.data.imported).toBeGreaterThan(0);
  });

  it('rejects non-CSV file', async () => {
    const txtPath = path.join(__dirname, 'fixtures', 'test.txt');
    fs.writeFileSync(txtPath, 'not a csv');
    const res = await request(app)
      .post('/api/transactions/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', txtPath);
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rejects missing file', async () => {
    const res = await request(app)
      .post('/api/transactions/upload')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('GET /api/transactions', () => {
  it('returns only current user transactions', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const ids = res.body.data.transactions.map((t) => t.user_id);
    ids.forEach((id) => expect(id).toBe(userId));
    if (res.body.data.transactions.length > 0) txId = res.body.data.transactions[0].id;
  });

  it('filters by type', async () => {
    const res = await request(app)
      .get('/api/transactions?type=income')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    res.body.data.transactions.forEach((t) => expect(t.type).toBe('income'));
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/transactions/:id/category', () => {
  it('updates category for own transaction', async () => {
    if (!txId) return;
    const res = await request(app)
      .patch(`/api/transactions/${txId}/category`)
      .set('Authorization', `Bearer ${token}`)
      .send({ category_id: 1 });
    expect(res.status).toBe(200);
  });

  it('returns 403 for another user transaction', async () => {
    if (!txId) return;
    const res = await request(app)
      .patch(`/api/transactions/${txId}/category`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ category_id: 1 });
    expect([403, 404]).toContain(res.status);
  });

  it('returns 404 for invalid transaction id', async () => {
    const res = await request(app)
      .patch('/api/transactions/00000000-0000-0000-0000-000000000000/category')
      .set('Authorization', `Bearer ${token}`)
      .send({ category_id: 1 });
    expect([403, 404]).toContain(res.status);
  });
});
