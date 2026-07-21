# Dependency upgrade: SvelteKit 2 / Svelte 5 (2026-07-21)

Record of the toolchain upgrade done to clear all `npm audit` vulnerabilities.
Commit `9e6d33f` on branch `rewrite`; deployed to con1 the same day.

## Why

`npm audit` reported **32 vulnerabilities** (1 critical, 13 high, 16 moderate,
2 low). Every one of them was in `devDependencies` — the shipped bundle only
contains `date-fns` and `tippy.js`, and `npm audit --omit=dev` reported a
single moderate advisory (`@babel/runtime`, pulled in by `date-fns`).

So the practical exposure was low: this is a static SPA built by
`adapter-static`, and the vulnerable code is build-time tooling, not anything
served to a browser. The upgrade was still worth doing — the critical was
`vitest` and the toolchain was two majors behind across the board — but it was
housekeeping, not an incident.

## What changed

`npm audit fix` (non-breaking) cleared 18 transitive advisories: `braces`,
`brace-expansion`, `cross-spawn`, `ajv`, `flatted`, `yaml`, `@babel/runtime`
and others.

The remaining 14 all traced back to pinned majors in the build toolchain, so
they had to move together. `npm install -D` of the new versions hit an
`ERESOLVE` peer conflict against the stale tree, so the versions were written
into `package.json` directly and resolved fresh (`rm -rf node_modules
package-lock.json && npm install`).

| package                    | before | after  |
| -------------------------- | ------ | ------ |
| `@sveltejs/kit`            | 1.22.3 | 2.70.1 |
| `svelte`                   | 4.1.1  | 5.56.7 |
| `vite`                     | 4.4.7  | 8.1.5  |
| `vitest`                   | 0.32.4 | 4.1.10 |
| `prettier`                 | 2.8.8  | 3.9.6  |
| `prettier-plugin-svelte`   | 2.10.1 | 4.1.1  |
| `svelte-check`             | 3.4.6  | 4.7.3  |
| `@sveltejs/adapter-static` | 2.0.3  | 3.0.10 |

`@sveltejs/vite-plugin-svelte@7.2.0` was added as an explicit devDependency
(see below).

## Code changes forced by the upgrade

Only three, all mechanical:

1. **`svelte.config.js`** — `vitePreprocess` moved out of `@sveltejs/kit/vite`
   into `@sveltejs/vite-plugin-svelte` in Kit 2. Without this the build dies at
   config load with `does not provide an export named 'vitePreprocess'`.
2. **`.prettierrc` and the `lint`/`format` npm scripts** — Prettier 3 removed
   both `pluginSearchDirs` (config) and `--plugin-search-dir` (CLI flag). The
   scripts would have failed as written.
3. **`src/Components/ActuHdr.svelte`** — a self-closing `<textarea ... />` is
   invalid in Svelte 5 (`element_invalid_self_closing_tag`); changed to an
   explicit `></textarea>`.

Prettier 3 additionally reformatted three files cosmetically: `<!DOCTYPE>` →
`<!doctype>` in `src/app.html`, slot indentation in `HelpCard.svelte`, and a
markdown blockquote continuation in `plan.md`.

Notably **no** SvelteKit 2 route-level migration was needed. The `throw
error(...)` calls in `src/routes/+page.ts` still work (the `throw` is redundant
in Kit 2 but harmless), and there was no `resolvePath` usage.

## The `cookie` override

The last 3 advisories (low severity, `cookie <0.7.0`) have **no upstream fix**:
SvelteKit 2.70.1 is the current release and pins `cookie@^0.6.0`. `npm audit
fix --force` proposed "fixing" this by installing `@sveltejs/kit@0.0.30`, which
would have destroyed the app.

Instead `package.json` carries:

```json
"overrides": {
	"cookie": "^0.7.2"
}
```

`cookie` 0.7 is API-compatible with 0.6 for the parse/serialize surface Kit
uses, and the full test suite passes with it. **Drop this override once
SvelteKit widens its own range** — it is a deliberate override of an upstream
pin, not something to carry forever.

## Verification

- `npm audit` — **0 vulnerabilities** (also 0 with `--omit=dev`)
- `npm run build` and `npm run build:tiny` — both succeed
- `npm run check` (svelte-check) — 429 files, **0 errors, 0 warnings**
- `npm run lint` — prettier + eslint clean, exit 0
- `npm run test:unit` — **17/17** on vitest 4
- `npm run test:integration` — **14/14** Playwright tests

Because a Svelte 4→5 jump mostly risks client-side hydration behavior that
static checks can't see, the deployed site was also driven in a headless
browser against https://nooz.ghmr.net:

- unauthenticated visit redirects to `/login`; prerendered page hydrates
- magic word logs in, navigates to `/`, title `Euronews`, 116 live article cards
- category filter: 116 → 3 on click, back to 116 on deselect
- text search "france": URL gains `txtquery=france`, chip renders
  `search: france ✕`, 116 → 4 cards
- zero console and page errors

## Deployment

Deployed to con1 (`https://nooz.ghmr.net`, `/var/www/nooz`) via
`npm run build` + `rsync -a --delete build/ con1:/var/www/nooz/`.
Previous build backed up first to `~agold/nooz-backup-20260721-152836.tar.gz`
on con1.

Also verified live: `gzip_static` still serving `Content-Encoding: gzip`, SPA
fallback intact (deep routes 200, unknown routes 404), favicon/manifest 200,
and the `/api/articles` proxy to actuproxy still returning 200.

**Gotcha hit during this session:** `npm run build` and `npm run build:tiny`
write to the _same_ `build/` directory and differ only by `BASE_PATH`. Running
them in parallel leaves `build/` in a mixed state. Always rebuild for the
intended target immediately before rsyncing, or con1 gets `/news`-prefixed
asset paths.

## Follow-ups (not done here)

- **tiny** (`http://tiny:8080/news/`) is still on the 2026-07-20 build and is
  now two generations behind. Update with `npm run build:tiny` + rsync.
- **Svelte 5 legacy mode.** The app works because Svelte 5 still runs Svelte 4
  syntax. `beforeUpdate`/`afterUpdate` in `ActuContent.svelte` and the `<slot>`
  usage in `HelpCard.svelte` / `+layout.svelte` are deprecated in favor of
  runes and `{@render ...}`. Worth migrating while the codebase is still only
  8 components.
- **eslint 8 is unsupported upstream** (as are `@typescript-eslint` 5,
  `eslint-config-prettier` 8, `eslint-plugin-svelte` 2). No advisories against
  them, so they were left out of scope. Moving to eslint 9 means converting
  `.eslintrc.cjs` to flat config (`eslint.config.js`).
- `date-fns` is still on 2.x (4.x available) and Playwright on 1.61; neither
  has advisories.
