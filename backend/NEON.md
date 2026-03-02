# Using Neon (serverless PostgreSQL) with DataM

Neon is a serverless PostgreSQL provider. Your Django app is already configured to use it via `DATABASE_URL`.

## Steps

### 1. Create a Neon project

1. Sign up at [neon.tech](https://neon.tech).
2. Create a new project and choose a region.
3. Copy the **connection string** from the Neon dashboard (Connection details). It looks like:
   ```text
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Set `DATABASE_URL`

**Option A – Using `.env` (local development)**

1. Create or edit `backend/.env` and set:
   ```env
   DATABASE_URL=postgresql://your_user:your_password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
2. Install `python-dotenv` so Django loads `.env` automatically:
   ```bash
   pip install python-dotenv
   ```
   Settings already load `backend/.env` when dotenv is installed.

   Alternatively, set the variable in your shell before running Django (no dotenv needed):
   ```bash
   set DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
   ```

**Option B – Production (e.g. Railway, Render, Heroku)**  
Set the `DATABASE_URL` environment variable in your host’s dashboard to the Neon connection string.

### 3. Run migrations

With `DATABASE_URL` set (and loaded into the environment when you run Django):

```bash
cd backend
python manage.py migrate
```

### 4. (Optional) Create a superuser

```bash
python manage.py createsuperuser
```

Use the email and password you want for the admin user.

## Notes

- The app detects Neon when the host contains `neon.tech` or when `sslmode=require` is in the URL, and enables SSL.
- If you don’t set `DATABASE_URL`, Django falls back to the default local PostgreSQL settings (`DB_NAME`, `DB_USER`, etc. or the hardcoded defaults).
