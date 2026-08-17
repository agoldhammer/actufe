/// <reference types="@sveltejs/kit" />
/// <reference lib="webworker" />

/*
	Precaches the shell and its module graph so that launching the app touches
	neither the network nor the HTTP cache.

	This is the structural answer to the blank page that has now come back four
	times. With `ssr = false` the served shell is the only markup there is, so
	every failure between tapping the icon and the app's first render is silent
	by default, and every one of those failures has been on the launch path:

	  - the document arriving truncated, because a phone on a cold radio commits
	    the response and then loses the socket;
	  - the document arriving whole but never running, which is what the nginx
	    log shows for 13 Aug (`GET / 304` and then nothing at all — not even the
	    `<link rel=icon>` at byte 94);
	  - a single module of the graph going missing, leaving the shell's
	    un-caught `Promise.all([...]).then(...)` pending forever.

	The watchdog in app.html can only report those; it runs *inside* the document
	and so cannot outlive one. This file runs outside it, and removes the two
	things that go wrong: after the first successful launch the document and
	every chunk it needs come out of Cache Storage, with no socket to drop and no
	HTTP cache entry that can be stale or corrupt.

	Honest limit, worth keeping in mind before this gets credited with a fix it
	did not make: if the renderer is handed a document and simply never executes
	it, a service worker does not help. It removes the causes it can reach.

	It also handles properly what the `Cache-Control: no-cache` on the shell
	exists to solve. That header is there because a heuristically cached
	index.html goes on referencing `/_app/immutable` chunks the next deploy
	prunes. Here the shell and its chunks live in one cache named after the build
	version, so a cached shell is always accompanied by the exact chunks it asks
	for, and a new build gets a new cache rather than a mixture of two.
*/

import { base, build, files, prerendered, version } from '$service-worker';

// The project's other TypeScript is checked against the DOM lib, where `self`
// is a Window. SvelteKit excludes this file from tsconfig for that reason.
const sw = self as unknown as ServiceWorkerGlobalScope;

// `version` is the build timestamp, so every deploy gets its own cache and
// `activate` below drops the previous one whole.
const CACHE = `nooze-${version}`;

// The SPA shell. nginx serves it for `/` with a 200 and as the body of every
// deep-link 404; here it plays both parts.
const SHELL = `${base}/`;

// The news itself. Never cached and never intercepted: it is the one request on
// the page whose whole purpose is to differ between two launches five minutes
// apart, and it is the request nginx rate-limits, so a cached copy would also
// hide a 429 from the app's own error panel.
const API = `${base}/api/articles`;

// What a launch needs before it can paint: the document it starts from, the
// prerendered pages (/login is the entry point for anyone without the auth
// flag), and the module graph. Precached as a unit — a precache missing one
// chunk is worse than none, because it would serve a shell that cannot boot.
const CRITICAL = [SHELL, ...prerendered, ...build];

// Icons, the manifest, robots.txt. None of it is on the path to a rendered
// page, and android-chrome-512x512.png alone is 473 KB.
const OPTIONAL = files;

const PRECACHED = new Set([...CRITICAL, ...OPTIONAL]);

sw.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE);
			// `cache: 'reload'` bypasses the HTTP cache, and is load-bearing rather
			// than an optimisation: a shell the HTTP cache holds truncated or
			// corrupt is one of the failures this file is here to end, and without
			// it the precache would copy that entry in and then serve it from there
			// on every launch until the next deploy.
			await cache.addAll(CRITICAL.map((url) => new Request(url, { cache: 'reload' })));
			// addAll is atomic: one 404, one dropped connection, and the whole
			// install fails. The critical list is worth failing over. Half a
			// megabyte of launcher icons is not, so these go in one at a time and
			// are allowed to miss.
			await Promise.all(OPTIONAL.map((url) => cache.add(url).catch(() => undefined)));
		})()
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key !== CACHE) await caches.delete(key);
			}
		})()
	);
});

/*
	Deliberately no `skipWaiting()` and no `clients.claim()`.

	Each cache holds one build's shell *and* that build's chunks, and nothing
	else. Left alone, the lifecycle keeps it that way: a new worker installs its
	own cache in the background and then waits, so a page still running the old
	build keeps being served the old build, complete, while `rsync --delete` has
	already pruned those chunks from the server. `skipWaiting()` would activate
	the new worker under that page's feet and delete the cache it is still
	loading from — the stale-shell blank page, reintroduced from the other side.

	The cost is that a deploy reaches the phone one launch late: the launch after
	a deploy is served the old build from cache while the new worker installs,
	the worker activates once that page is closed, and the launch after that is
	the new build. The articles come from the network on every launch either way,
	so what is one build behind is the frontend, not the news. To see a deploy at
	once, clear the site's storage (or remove and re-add the home-screen icon).
*/

sw.addEventListener('fetch', (event) => {
	const request = event.request;
	if (request.method !== 'GET') return;

	const url = new URL(request.url);
	// Summary images and everything else off-origin: not ours to cache, and not
	// ours to add a worker startup to.
	if (url.origin !== sw.location.origin) return;
	if (url.pathname === API) return;

	// A navigation to a route the client-side router owns has no file of its own
	// and is answered with the shell — which is what nginx does too, as a 404
	// body. Anything else we have not precached is a 404 or a probe; leave it.
	if (!PRECACHED.has(url.pathname) && request.mode !== 'navigate') return;

	event.respondWith(respond(request, url));
});

async function respond(request: Request, url: URL): Promise<Response> {
	try {
		const cache = await caches.open(CACHE);
		const key = PRECACHED.has(url.pathname) ? url.pathname : SHELL;
		const hit = await cache.match(key);
		// The whole point of the file is this one line: on a launch, the document
		// that starts the app comes from here.
		if (hit) return hit;
		return await fetch(request);
	} catch (err) {
		// Offline, or the connection died mid-request. Anything that throws here
		// must still end in a response or a rethrow: a rejection from respondWith
		// is a failed request, which is exactly the blank page again.
		const stale = await caches.match(request).catch(() => undefined);
		if (stale) return stale;
		throw err;
	}
}
