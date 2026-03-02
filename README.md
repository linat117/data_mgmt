# DataM

Role-based data management system for Mentor Mother programs. Manages client registrations, MCH reports, and weekly plans.

## Project Structure

```
DataM/
├── backend/          # Django REST API
├── frontend/         # React + Vite app
└── README.md
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL or [Neon](https://neon.tech) (serverless Postgres)

## Quick Start

### 1. Backend

```bash
cd backend
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter psycopg2-binary
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

For Neon: see `backend/NEON.md`.

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend runs at [http://localhost:8000](http://localhost:8000).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at [http://localhost:5173](http://localhost:5173).

## Roles

- **Admin** – Dashboard stats, user management, audit logs, all data records
- **Data Expert** – Data records only (clients, MCH reports, weekly plans)

## Documentation

- `frontend/README.md` – Frontend setup and scripts
- `backend/NEON.md` – Using Neon (Postgres) as database
