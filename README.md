# Roommate Resolver

SJSU Student Housing Conflict Mediation — powered by Claude AI + Supabase.

## Architecture

```
backend/   Python FastAPI  →  main.py
database/  Supabase (conflict_reports table)
frontend/  React + Vite    →  frontend/
```

## Supabase table

Make sure your `conflict_reports` table has a `user_id` column (text/uuid). Run this in the Supabase SQL editor if needed:

```sql
alter table conflict_reports add column if not exists user_id uuid;
```

## Backend setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Copy env and fill in your keys
cp .env.example .env

uvicorn main:app --reload
# Runs on http://localhost:8000
```

## Frontend setup

> Requires [Node.js](https://nodejs.org) 18+

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

The `frontend/.env` is pre-filled with the Supabase anon key. Never put `ANTHROPIC_API_KEY` in the frontend.

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Sign in / sign up with Supabase Auth |
| `/` | Dashboard — all complaints with expand toggle |
| `/submit` | Submit a new complaint (Claude mediates, result saved) |
| `/ra-view` | Complaints escalated to the RA |

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/complaints` | Submit complaint (requires auth) |
| `GET` | `/complaints` | List all complaints |
| `GET` | `/complaints/escalated` | List RA-escalated complaints |
