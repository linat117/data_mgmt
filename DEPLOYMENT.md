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
| **Build Command** | `pip install -r requirements.txt && python manage.py migrate --no-input` |
| **Start Command** | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT` |

5. Click **Advanced** and add environment variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon connection string |
| `SECRET_KEY` | Random string (e.g. from `python -c "import secrets; print(secrets.token_hex(32))"`) |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | *(optional)* Render sets `RENDER_EXTERNAL_HOSTNAME` automatically; settings.py uses it. Only set if you add a custom domain. |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` (add after Part 3) |

6. Click **Create Web Service**.

### 2.2 Migrations (runs automatically)

Migrations run automatically during each deploy via the build command. No Shell needed.

### 2.3 Create admin user (first time only)

Create the admin user locally – it’s stored in Neon and will work with your deployed app:

1. Locally, ensure `backend/.env` has your **Neon** connection string:
   ```env
   DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
   ```
2. From the project root, run:
   ```bash
   cd backend
   python manage.py createsuperuser
   ```
3. Enter email and password when prompted.

### 2.4 Get Backend URL

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
- [ ] `ALLOWED_HOSTS` – not required on Render (RENDER_EXTERNAL_HOSTNAME is used automatically)
- [ ] `CORS_ALLOWED_ORIGINS` includes Vercel URL
- [ ] Migrations run on each deploy (built into build command)
- [ ] Superuser created locally (`python manage.py createsuperuser`)
- [ ] `VITE_API_URL` in Vercel points to `https://YOUR-RENDER-URL.onrender.com/api/v1`

---

## URLs After Deployment

| Service | URL |
|---------|-----|
| Frontend | `https://your-project.vercel.app` |
| API | `https://your-backend.onrender.com/api/v1/` |
| Login | `https://your-backend.onrender.com/api/v1/auth/login/` |

---

## Troubleshooting

### Login returns 400 Bad Request

1. **Check if the backend is reachable**: Open in a browser or with curl:
   ```
   https://YOUR-RENDER-URL.onrender.com/api/v1/health/
   ```
   You should see `{"ok": true}`. If not, the app or Render service may be down.

2. **Inspect the response body** (DevTools → Network → login request → Response):
   - If **JSON** with `detail` and `received_keys`: the view is running; `received_keys` shows what the server parsed. Expect `["email","password"]`. If empty or different, the request body may not be reaching the view correctly.
   - If **HTML** or 400 on even `/api/v1/health/`: typically `ALLOWED_HOSTS`. Settings now auto-add `RENDER_EXTERNAL_HOSTNAME` on Render. Ensure you redeploy after updating settings.

3. **Verify env on Render**: `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `VITE_API_URL` all correct.

### Health endpoint

| URL | Purpose |
|-----|---------|
| `GET /api/v1/health/` | No auth. Returns `{"ok": true}` if the app is up. |

---

## Notes

- **Render free tier**: Services sleep after ~15 min of inactivity. First request may take ~30 seconds.
- **Neon free tier**: 0.5 GB storage.
- **Vercel**: Free tier includes automatic deploys on push.
