# Deploy DataM: Render + Vercel + Neon

Step-by-step guide to deploy DataM for free using Render (backend), Vercel (frontend), and Neon (database).

---

## Prerequisites

- GitHub account
- [Neon](https://neon.tech) account (database – you likely have this)
- [Render](https://render.com) account
- [Vercel](https://vercel.com) account
- Code pushed to a GitHub repository

---

## Part 1: Database (Neon)

1. Log in to [Neon](https://neon.tech).
2. Create or use your project.
3. Copy the **connection string** from the dashboard (Connection details).
   - Format: `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
4. Save it for Part 2 (Render).

---

## Part 2: Backend on Render

### 2.1 Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New** → **Web Service**.
3. Connect your GitHub repo.
4. Use these settings:

| Field | Value |
|-------|-------|
| **Name** | `datam-backend` (or similar) |
| **Region** | Choose nearest |
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT` |

5. Click **Advanced** and add environment variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon connection string |
| `SECRET_KEY` | Random string (e.g. from `python -c "import secrets; print(secrets.token_hex(32))"`) |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `your-app.onrender.com` (replace with your Render URL) |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` (add after Part 3) |

6. Click **Create Web Service**.

### 2.2 Run Migrations

After the first deploy:

1. In Render, open your service.
2. Go to **Shell**.
3. Run:
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```
4. Enter email and password for the admin user.

### 2.3 Get Backend URL

Your API will be: `https://datam-backend.onrender.com` (or your chosen name).

Add `/api/v1/` for API calls, e.g. `https://datam-backend.onrender.com/api/v1/`.

---

## Part 3: Frontend on Vercel

### 3.1 Create Project

1. Go to [Vercel](https://vercel.com).
2. Click **Add New** → **Project**.
3. Import your GitHub repo.
4. Use these settings:

| Field | Value |
|-------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` (default for Vite) |

5. Add **Environment Variable**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://YOUR-RENDER-URL.onrender.com/api/v1` |

   Replace `YOUR-RENDER-URL` with your actual Render service URL (e.g. `datam-backend`).

6. Click **Deploy**.

### 3.2 Update Backend CORS

1. Get your Vercel URL (e.g. `https://datam.vercel.app`).
2. In Render → your service → **Environment**.
3. Edit `CORS_ALLOWED_ORIGINS` and set:
   ```
   https://datam.vercel.app
   ```
   Or add both:
   ```
   https://datam.vercel.app,https://datam-xxx.vercel.app
   ```
4. Save. Render will redeploy.

---

## Part 4: Final Checklist

- [ ] Neon connection string in Render `DATABASE_URL`
- [ ] `SECRET_KEY` set in Render (random, not default)
- [ ] `DEBUG=False` in Render
- [ ] `ALLOWED_HOSTS` includes Render URL
- [ ] `CORS_ALLOWED_ORIGINS` includes Vercel URL
- [ ] Migrations run in Render Shell
- [ ] Superuser created
- [ ] `VITE_API_URL` in Vercel points to `https://YOUR-RENDER-URL.onrender.com/api/v1`

---

## URLs After Deployment

| Service | URL |
|---------|-----|
| Frontend | `https://your-project.vercel.app` |
| API | `https://your-backend.onrender.com/api/v1/` |
| Login | `https://your-backend.onrender.com/api/v1/auth/login/` |

---

## Notes

- **Render free tier**: Services sleep after ~15 min of inactivity. First request may take ~30 seconds.
- **Neon free tier**: 0.5 GB storage.
- **Vercel**: Free tier includes automatic deploys on push.
