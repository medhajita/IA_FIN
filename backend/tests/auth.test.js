const request = require('supertest');
const app = require('../server');
const { User } = require('../models');

const TEST_EMAIL = `test_auth_${Date.now()}@finance.test`;
const TEST_USER = { name: 'Test User', email: TEST_EMAIL, password: 'TestPass123!' };

let authToken;

afterAll(async () => {
  await User.destroy({ where: { email: TEST_EMAIL } });
});

describe('POST /api/auth/register', () => {
  it('registers a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send(TEST_USER);
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(TEST_EMAIL);
  });

  it('rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(TEST_USER);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });

  it('rejects missing fields', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@x.com' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: TEST_USER.password });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    authToken = res.body.data.token;
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_EMAIL, password: 'WrongPass!' });
    expect(res.status).toBe(401);
  });

  it('rejects unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@nowhere.com', password: 'pass' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/profile', () => {
  it('returns profile with valid token', async () => {
    if (!authToken) {
      const r = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_USER.password });
      authToken = r.body.data.token;
    }
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(TEST_EMAIL);
  });

  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.status).toBe(401);
  });

  it('returns 401 with expired/invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });
});
