# DataM – Frontend

Frontend for **DataM**, a role-based data management system for Mentor Mother records, client registrations, MCH reports, and weekly plans.

## Tech Stack

- **React 19** + **Vite 7**
- **Tailwind CSS**
- **React Router**
- **Zustand** (auth state)
- **Axios** (API)
- **Lucide React** (icons)

## Prerequisites

- Node.js 18+
- Backend API running at `http://localhost:8000` (see root `README.md` or `backend/` for setup)

## Quick Start

```bash
npm install
npm run dev
```

App runs at [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000/api/v1` | Backend API base URL |

## Features

- **Login** – JWT auth
- **Dashboard** – Admin stats (users, clients, reports, plans)
- **Data Records** – Client registrations, MCH reports, weekly plans
- **User Management** (Admin) – Add, edit, disable, delete users
- **Audit Logs** (Admin) – System activity log
- Responsive layout for mobile and tablet
