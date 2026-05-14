# AI Financial Coach

Personal finance web app — track spending, get AI-powered recommendations.

## Tech Stack

| Layer | Tech | Port |
|-------|------|------|
| Frontend | React.js + Vite + Tailwind CSS v3 | 3000 |
| Backend | Node.js + Express.js + Sequelize | 5000 |
| ML Service | Python + Flask + scikit-learn | 5001 |
| Database | Supabase PostgreSQL (remote) | — |

## Setup

### 1. Clone & get .env
```bash
git clone <repo-url>
# Ask Wassim for backend/.env — never commit it
```

### 2. Backend
```bash
cd backend
npm install
node server.js
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. ML Service
```bash
cd ml-service
pip install -r requirements.txt
python app.py
```

### 5. Docker (optional)
```bash
docker-compose up --build
```

> Database is hosted on Supabase — no local PostgreSQL needed.
