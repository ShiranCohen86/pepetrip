# PepeTrip 🧳

AI-powered travel platform. **Phase 1: the AI Trip Planner** — sign in with Google, describe a
trip (destination, dates, budget, style), and get an editable, drag-and-drop day-by-day itinerary
with estimated costs. Built as an installable, mobile-first PWA.

> Long-term vision is a full "travel operating system." We ship one excellent vertical slice first
> on a clean, scalable foundation, then layer features on. See
> [`docs/`](docs) / the project plan for the roadmap.

## Architecture

A single-deployable monorepo. In **production** the Express server serves both the REST API
(`/api/v1/*`) and the pre-built React SPA from one origin (Render web service) — no CORS, simple
same-site cookies. In **dev** they run separately with a Vite proxy.

```
pepetrip/
├─ shared      # Zod schemas + constants shared by frontend & backend (one source of truth)
├─ backend     # Express + MongoDB (layered: routes→controllers→services→repositories→models)
└─ frontend    # React PWA (Vite, Redux Toolkit, TanStack Query, React Router, SASS)
```

Stack: Node 20+, Express 4, MongoDB/Mongoose, JWT (access + rotating refresh), Google sign-in,
Gemini (free tier) behind a provider abstraction, React 18, Redux Toolkit, TanStack Query,
React Hook Form + Zod, `@dnd-kit`, SASS, PWA (Workbox via `vite-plugin-pwa`).

## Getting started

```bash
# 1. Install
npm install

# 2. Configure env — each app owns its own file
cp backend/.env.example backend/.env      # fill in values (see comments in the file)
cp frontend/.env.example frontend/.env    # optional — only if the web app runs on a different origin

# 3a. Easiest: run with an in-memory MongoDB (no Docker, no real .env needed)
npm run dev:mem

# 3b. Or run against a real MongoDB
docker compose up -d        # start MongoDB
npm run dev                 # api on :4000, web on :5173 (with /api proxied)
```

You'll need:

- A **Google OAuth Web Client ID** — [Google Cloud Console](https://console.cloud.google.com/) →
  APIs & Services → Credentials. Add `http://localhost:5173` to authorized JavaScript origins.
- A **Gemini API key** — [Google AI Studio](https://aistudio.google.com/apikey) (free tier).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Run api + web together (concurrently) |
| `npm run dev:mem` | Run with an in-memory MongoDB — no Docker, no real `.env` needed |
| `npm run build` | Build the web app and copy it to `backend/public` (served by the backend in prod) |
| `npm start` | Start the production server (serves API + SPA) |
| `npm test` | Run api + web test suites |
| `npm run lint` / `npm run format` | Lint / format the whole repo |

## Deployment (Render, free tier)

Single web service via [`render.yaml`](render.yaml): build `npm ci && npm run build`, start
`npm start`. Set the secret env vars (Mongo URI, JWT secrets, Google client ID, Gemini key) in the
dashboard. Data: MongoDB Atlas M0 (free).

**Full step-by-step:** see [DEPLOY.md](DEPLOY.md) — Atlas, Google OAuth, Gemini, GitHub, and the
Render Blueprint, with a smoke-test checklist.
