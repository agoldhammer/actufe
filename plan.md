# De-Netlify actufe: static SPA behind nginx

> **Historical document** (written before implementation, kept for context).
> Details below are stale: the real nginx config is `deploy/nginx.conf`
> (server*name nooz.ghmr.net, root /var/www/nooz, actuproxy on port 33433,
> scoped SPA fallback per commit 057e771 — not the `server_name *`/ port 8000 /
blanket-fallback sketch here). Current deployment notes live in`notes.md`.

## Context

actufe is a SvelteKit SPA (`ssr = false`, so fully client-rendered) currently deployed on Netlify. Its only server-side piece is `netlify/functions/connProxy.cjs`, a trivial GET pass-through that forwards `timeframe` / `timewindow` / `txtquery` query params to the actuproxy backend (`PROXY_URI`) and returns its JSON unchanged. The goal is to drop Netlify entirely: build the app as static files served by nginx, and let nginx's `proxy_pass` replace the function (the actuproxy backend will run on the same machine as nginx, so it proxies to localhost and the backend is never exposed publicly).

Decisions already made with the user:

- **Endpoint**: nginx `proxy_pass` directly — no Node service.
- **Backend location**: same machine as nginx (`127.0.0.1:<port>`).
- **Cleanup**: full — remove Netlify function, `netlify.toml`, adapter-auto, and the unused `mongodb`/`saslprep` dependencies.

The API contract to preserve (frontend throws if `articles` is missing):
`GET ?timeframe=&timewindow=&txtquery=` → `{ articles: Article[], count, timespan: {start, end}, ndocs }`

## Changes

### 1. Switch to static adapter — `svelte.config.js`

- Replace `@sveltejs/adapter-auto` with `@sveltejs/adapter-static` in SPA mode:
  ```js
  import adapter from '@sveltejs/adapter-static';
  ...
  adapter: adapter({ fallback: 'index.html' })
  ```
- Add `export const prerender = false;` alongside the existing `export const ssr = false;` in `src/routes/+page.ts` (fallback mode requires routes not be prerendered; the load() depends on URL query params and localStorage so it must stay client-only).
- Output lands in `build/` (adapter-static default).

### 2. Repoint the API URL — `src/routes/+page.ts` (lines 39–41)

Replace the two hard-coded `/.netlify/functions/connProxy?...` URIs with `/api/articles?...`, keeping the same query params. (Optionally build the query string with `URLSearchParams` to also fix the currently-unencoded `txtquery`.)

### 3. Dev proxy — `vite.config.ts`

So `npm run dev` keeps working without Netlify CLI, add a Vite dev-server proxy:

```ts
server: {
  proxy: {
    '/api/articles': {
      target: process.env.PROXY_URI ?? 'http://127.0.0.1:8000',
      changeOrigin: true,
      rewrite: () => '/'   // backend expects GET /?timeframe=...
    }
  }
}
```

(Load `PROXY_URI` from `.env` via `loadEnv` or `dotenv`; the actual value lives only in the local `.env` / Netlify dashboard — it is not in the repo.)

### 4. nginx site config — new file `deploy/nginx.conf`

Checked into the repo as the deployment reference:

```nginx
server {
    listen 80;
    server_name _;                      # adjust to real hostname
    root /var/www/actufe;               # contents of build/

    # API: replaces connProxy. Backend expects GET /?timeframe=...
    location = /api/articles {
        proxy_pass http://127.0.0.1:8000/;   # PLACEHOLDER: actuproxy port
        proxy_set_header Host $host;
    }

    # Hashed build assets: cache forever
    location /_app/immutable/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Notes: `proxy_pass` with a trailing `/` maps `/api/articles?q` → `/?q`, which is exactly what actuproxy expects; the query string is forwarded automatically. The `connProxy.cjs` server-side defaults (`timeframe=0`, `timewindow=2`) are redundant — the SPA always sends both params (defaults applied client-side in `+page.ts:30-31`).

### 5. Netlify cleanup

- Delete `netlify/functions/` and `netlify.toml`.
- `package.json`: remove `@sveltejs/adapter-auto`; add `@sveltejs/adapter-static@^2` (the v2 line matches SvelteKit 1.x); remove `mongodb` and `saslprep` from dependencies (only referenced by dead code in `outtakes/`, which is outside the build and type-check scope — left untouched).
- Run `npm install` to refresh the lockfile.

## Files touched

| File                                              | Action                                         |
| ------------------------------------------------- | ---------------------------------------------- |
| `svelte.config.js`                                | adapter-auto → adapter-static (SPA fallback)   |
| `src/routes/+page.ts`                             | `prerender = false`; API URL → `/api/articles` |
| `vite.config.ts`                                  | dev proxy for `/api/articles`                  |
| `deploy/nginx.conf`                               | new — nginx site config                        |
| `netlify/functions/connProxy.cjs`, `netlify.toml` | delete                                         |
| `package.json`, `package-lock.json`               | dep swap/removal                               |

## Verification

1. `npm run check` and `npm run build` — confirm the static build succeeds and emits `build/index.html` + `build/_app/`.
2. `npm run dev` with `PROXY_URI` set in `.env` — load the app, log in (`shazam`), confirm articles render and the footer shows count/timespan/ndocs; try a `txtquery` search and a timewindow change.
3. nginx dry-run: `nginx -t -c` against a test config including `deploy/nginx.conf` (root pointed at the local `build/` dir), then run it locally (or via `docker run nginx` with the conf and `build/` mounted) and confirm: `/` serves the SPA, a deep link like `/login` falls back to `index.html`, and `curl 'localhost/api/articles?timeframe=0&timewindow=2'` returns JSON with an `articles` key.

## Out of scope / follow-ups

- Actual server provisioning (copying `build/` to `/var/www/actufe`, enabling the site, TLS via certbot).
- The real actuproxy port must be filled into `deploy/nginx.conf` at deploy time; `PROXY_URI`'s value is not in the repo — get it from the local `.env` or the Netlify dashboard.
- `outtakes/` dead code is left as-is; delete separately if desired.
