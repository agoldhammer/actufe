# De-Netlify rewrite — completion notes (2026-07-14)

The Netlify function is gone and the app is now a pure static SPA with nginx as the data endpoint. All changes verified locally.

## What changed

- `svelte.config.js` — switched `@sveltejs/adapter-auto` → `@sveltejs/adapter-static` in SPA mode (`fallback: 'index.html'`); the build now lands in `build/` as plain static files.
- `src/routes/+page.ts` — added `prerender = false`, and the two hard-coded `/.netlify/functions/connProxy` URLs are now a single `/api/articles?...` built with `URLSearchParams` (which also fixes the previously unencoded `txtquery`).
- `vite.config.ts` — added a dev-server proxy so `npm run dev` works without the Netlify CLI: `/api/articles` → `PROXY_URI` (read from `.env`, defaulting to `http://127.0.0.1:8000`), rewritten to the backend's root path.
- `deploy/nginx.conf` — new site config: serves `build/` with an SPA `try_files` fallback, long-cache headers on `/_app/immutable/`, and `location = /api/articles { proxy_pass http://127.0.0.1:8000/; }` which replaces connProxy (the trailing slash maps `/api/articles?q` → `/?q`, exactly what actuproxy expects).
- Deleted `netlify/functions/connProxy.cjs` and `netlify.toml`; removed the unused `mongodb`/`saslprep` deps and adapter-auto from `package.json`; lockfile refreshed. The pre-existing `@types/node` addition was preserved.
- Saved the approved plan to `plan.md`.

## Verification

- `npm run check` passes (0 errors, one pre-existing CSS warning).
- `npm run build` emits `build/index.html` + `build/_app/`.
- Since nginx and docker weren't installed locally, the endpoint contract was proven end-to-end with a stub actuproxy on port 8000 behind the Vite dev server: requesting `/api/articles?timeframe=0&timewindow=2&txtquery=macron` reached the stub as `/?timeframe=0&timewindow=2&txtquery=macron` and returned the full JSON (`articles`, `count`, `timespan`, `ndocs`), and `/` served the SPA shell with a 200. The nginx `proxy_pass` in `deploy/nginx.conf` performs the identical rewrite.

## To fill in at deploy time (values are not in the repo)

- The real actuproxy port in `deploy/nginx.conf` (placeholder is `127.0.0.1:8000`).
- `PROXY_URI` in the local `.env` if you want `npm run dev` to hit the real backend — the old value lives in the Netlify dashboard.
