# Trace — web client

A Vite + React single-page app that talks to the Trace backend API and is built
on the in-repo Trace design system (`window.TRACE_UI`).

## How it fits together

- The design system ships as a precompiled global bundle (`ui-bundle.js`) whose
  components expect **one global React**. So this app does **not** bundle its own
  React: [`src/main.jsx`](src/main.jsx) loads React/ReactDOM UMD + `ui-bundle.js`
  + `styles.css` at runtime, then dynamically imports the app. JSX compiles to
  global `React.createElement` (see [`vite.config.js`](vite.config.js)).
- API calls go to `/api` and are proxied to the Express API in dev (and via
  `vite preview`). Override the target with `VITE_API_PROXY`, or point the client
  at an absolute API origin with `VITE_API_BASE`.

## Run it

From the **repo root** (runs the API on `:4000` and the web app on `:5173`
together):

```bash
npm install            # installs concurrently at the root
npm run install:all    # installs backend + frontend deps
npm run dev            # api + web, side by side
```

Prereqs: MongoDB running and `backend/.env` present (see
[docs/05-operations/run-test-deploy.md](../docs/05-operations/run-test-deploy.md)).

Or run just the web app (expects the API already on `:4000`):

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

## Build

```bash
cd frontend
npm run build          # -> dist/ (includes the design-system assets)
npm run preview        # serve the build on :4173 (also proxies /api)
```

## What's wired

Register / log in / log out, capture (optimistic), day-grouped timeline with
cursor pagination, inline edit, backdate (`occurredAt`), soft-delete with undo,
draft restore, theme toggle, and client-side search / tag index / export
(Markdown + JSON) over your entries.

Out of scope (no backend endpoint yet): password reset, server-side search, bulk
/ account deletion. These are shown as honest, disabled notices.
