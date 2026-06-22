# Trace — Frontend (Web Client)

The React web client for Trace, built with **Vite** and the Trace design system.
It talks to the backend API at `/api` (same origin in production on Vercel).

## Quick start

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Start the API separately (`npm run dev:api` from the repo root, or
`cd backend && npm run dev`). The Vite dev server proxies `/api` to
`http://localhost:4000`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the production build locally |

## Configuration

| Variable | Default | Notes |
|---|---|---|
| `VITE_API_BASE` | `/api` | API base path; override for split-origin dev |
| `VITE_API_PROXY` | `http://localhost:4000` | Dev-server proxy target (vite.config.js) |

## Architecture notes

- The design system ships as a precompiled global bundle (`ui-bundle.js`) with
  a single global React — see `src/main.jsx` and `vite.config.js`.
- Auth tokens are stored in `localStorage` under `trace.token`.
- Production builds are served by Vercel from `frontend/dist`; API routes are
  handled by the serverless function at `api/index.js`.
