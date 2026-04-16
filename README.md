# EECS 4413 Project

(NOTE FOR TA: The deployed backend cold starts so if the app via the link doesn't work at first, it will work in <50 seconds after cold starting)

Full-stack e-commerce web application built with React, FastAPI, and PostgreSQL.

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Deployment

- Frontend deployed on Vercel (https://4413-shem-popeyes-louisiana.vercel.app/)
- Backend deployed on Render (https://four413-shem-popeyes-louisiana.onrender.com/)
- Database deployed on Supabase

### Admin Credentials

- admin@demo.com
- demo
