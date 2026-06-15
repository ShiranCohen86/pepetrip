# Deploying PepeTrip to Render (free tier)

PepeTrip ships as **one** Render web service: Express serves the API **and** the built React SPA
from `backend/public`. You'll need a few free accounts. Total cost: **$0**.

> Tip: only `MONGODB_URI` + the two JWT secrets are strictly required to boot. `GOOGLE_CLIENT_ID`
> (login) and `GEMINI_API_KEY` (AI) can be added later — the app runs without them, those features
> just stay off.

---

## 1. MongoDB Atlas (free M0 database)

1. Create an account → **Build a Database** → **M0 (Free)**.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → **Allow access from anywhere** (`0.0.0.0/0`) — Render's IPs aren't fixed.
4. **Connect → Drivers** → copy the connection string, e.g.
   `mongodb+srv://USER:PASSWORD@cluster0.xxxx.mongodb.net/pepetrip?retryWrites=true&w=majority`
   (add `/pepetrip` as the db name before the `?`). This is your **`MONGODB_URI`**.

## 2. Google sign-in (OAuth Web Client ID)

1. [Google Cloud Console](https://console.cloud.google.com/) → create a project.
2. **APIs & Services → OAuth consent screen** → External → fill the basics → add yourself as a test user.
3. **Credentials → Create credentials → OAuth client ID → Web application**.
4. Under **Authorized JavaScript origins** add your Render URL (e.g. `https://pepetrip.onrender.com`).
   (Google Identity Services uses origins; no redirect URI needed for the token flow.)
5. Copy the **Client ID** → this is your **`GOOGLE_CLIENT_ID`**.

## 3. Gemini API key (optional — enables AI trip + packing generation)

[Google AI Studio → API keys](https://aistudio.google.com/apikey) → create a key → **`GEMINI_API_KEY`** (free tier).

## 4. Generate JWT secrets

Run locally and copy the two values:

```bash
node -e "const c=require('crypto');console.log('ACCESS',c.randomBytes(32).toString('hex'));console.log('REFRESH',c.randomBytes(32).toString('hex'))"
```

## 5. Push the repo to GitHub

```bash
git add -A && git commit -m "Deploy PepeTrip"
gh repo create pepetrip --private --source=. --push   # or create on github.com and `git push`
```

## 6. Create the Render service (Blueprint)

1. [Render](https://render.com) → **New → Blueprint** → connect your GitHub repo.
2. Render reads [`render.yaml`](render.yaml) automatically:
   - build: `npm ci && npm run build`  (installs, builds the SPA, copies it to `backend/public`)
   - start: `npm start`  (`node backend/src/server.js`)
   - health check: `/api/v1/health`
3. When prompted, set the **secret env vars** (marked `sync:false`):
   - `MONGODB_URI` — from step 1
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — from step 4
   - `GOOGLE_CLIENT_ID` — from step 2 (optional)
   - `GEMINI_API_KEY` — from step 3 (optional)
   (`NODE_ENV=production`, `COOKIE_SECURE=true`, etc. are already in `render.yaml`.)
4. **Create** → Render builds and deploys.

## 7. Smoke-test the live URL

- `https://<your-app>.onrender.com/api/v1/health` → `{ "data": { "status": "ok", "db": "up" } }`
- Open the root URL → the app loads; refresh on a deep link (e.g. `/world`) still loads (SPA fallback).
- Sign in with Google (if `GOOGLE_CLIENT_ID` set), create a trip, hit **Generate with AI** (if
  `GEMINI_API_KEY` set).

---

## Notes / gotchas

- **Free tier cold starts:** the service sleeps after ~15 min idle; the first request then takes
  ~30–50s. Fine for friends; a free uptime pinger (e.g. cron-job.org hitting `/api/v1/health`) keeps it warm.
- **Uploads are ephemeral on free tier:** photos/documents written to `backend/public`-adjacent local
  disk vanish on redeploy. For durable media set `STORAGE_DRIVER=cloudinary` + `CLOUDINARY_URL` (free
  Cloudinary tier) — the storage layer is already abstracted for it.
- **Demo login is auto-disabled in production** (`NODE_ENV=production`), so `/auth/dev-login` returns
  403 on Render regardless of `ALLOW_DEV_LOGIN`. Real login = Google.
- **After deploy**, add the live origin to the Google OAuth "Authorized JavaScript origins" if you
  didn't already (step 2.4), or Google sign-in will be blocked.
```
