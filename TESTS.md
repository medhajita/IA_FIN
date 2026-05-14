# Test Results — AI Financial Coach

## Backend (Jest + Supertest)
```
Test Suites: 4 passed
Tests:       32 passed
```

### auth.test.js
- POST /api/auth/register: success, duplicate email, missing fields
- POST /api/auth/login: success, wrong password, unknown email
- GET /api/auth/profile: valid token, no token, invalid token

### transaction.test.js
- POST /api/transactions/upload: valid CSV, invalid format, missing file
- GET /api/transactions: user isolation, type filter, 401 without token
- PATCH /api/transactions/:id/category: valid update, wrong user (403/404), invalid id

### dashboard.test.js
- GET /api/dashboard/summary: zeros for empty data, correct calculations
- GET /api/dashboard/by-category: grouping, percentages sum to 100
- GET /api/dashboard/monthly-evolution: array shape, all fields present

### recommendation.test.js
- High food spending (>30%) → high priority rec
- Negative balance → high priority rec
- Good savings rate (>20%) → low priority encouragement
- Low savings rate (<10%) → high priority rec
- Too many subscriptions (>3) → medium priority rec
- Returns max 4 recommendations
- High priority before low priority

## Frontend (Vitest + React Testing Library)
```
Test Files: 2 passed
Tests:      6 passed
```

### LoginPage.test.jsx
- Renders email and password fields
- Shows error on empty submit
- Shows error on wrong credentials (mocked API)

### Dashboard.test.jsx
- Shows loading spinner while fetching
- Renders KPI cards with correct values
- Shows empty state ("No data yet") when no transactions

## Run Tests
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```
