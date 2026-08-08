// The /api/articles request and everything derived from it.
//
// This deliberately no longer runs *inside* +page.ts's load. With `ssr = false`
// SvelteKit renders nothing whatsoever until load resolves, and it installs its
// popstate and link handlers only afterwards — client.js `start()` awaits the
// initial navigation before calling `_start_router()`. Awaiting the article
// fetch in load therefore left a phone with a stalled request looking at a page
// that was blank *and inert*: no header, no error, no working links, and no
// scroll restoration. The only control that still did anything was the
// browser's Back button, because it left the document entirely — which is
// exactly the symptom that was reported.
//
// load() now hands the unresolved promise to the page, which renders it with
// {#await}, so the first paint never waits on the network.

import { base } from '$app/paths';
import { Counter } from '$lib/counter';
import type { Appdata, Article, Timespan } from '$lib/types';
import {
	cats_store,
	selected_cats_store,
	cat_count_store,
	selected_pubs_store
} from '$lib/actustores';

// A phone can leave a fetch pending forever: a wifi<->cellular handoff kills the
// socket without rejecting the promise, and a tab the OS discarded mid-request
// may never resume it. Nothing beneath us imposes a deadline, so we do — an
// error the user can retry beats a spinner that never ends.
export const ATTEMPT_TIMEOUT_MS = 8000;
// Two attempts: the failure this guards against is usually transient, and the
// second try runs on a connection the first one has already warmed up.
export const ATTEMPTS = 2;

export type ArticlesQuery = {
	timeframe: string;
	time_window: string;
	text_query: string | null;
};

// The `fetch` SvelteKit passes into load.
export type LoadFetch = typeof globalThis.fetch;

interface ArticlesResponse {
	articles?: Article[];
	count: string;
	timespan: Timespan;
	ndocs: string;
}

export function articlesUri(q: ArticlesQuery): string {
	const params = new URLSearchParams({ timeframe: q.timeframe, timewindow: q.time_window });
	if (q.text_query) params.set('txtquery', q.text_query);
	return `${base}/api/articles?${params}`;
}

async function fetchWithTimeout(fetch: LoadFetch, uri: string): Promise<Response> {
	// AbortController + setTimeout rather than AbortSignal.timeout(): identical
	// effect, but supported by every browser that can run the rest of the app.
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);
	try {
		return await fetch(uri, { signal: controller.signal });
	} finally {
		clearTimeout(timer);
	}
}

async function requestArticles(fetch: LoadFetch, uri: string): Promise<ArticlesResponse> {
	let lastError: unknown;
	for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
		try {
			const response = await fetchWithTimeout(fetch, uri);
			// A non-2xx is nginx or actuproxy talking, and the body is usually not
			// JSON; parsing it would throw a syntax error that hides the real status.
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			return await response.json();
		} catch (e) {
			lastError = e;
		}
	}
	throw new Error(`failed to fetch articles from ${uri}: ${lastError}`);
}

export async function fetchAppdata(fetch: LoadFetch, q: ArticlesQuery): Promise<Appdata> {
	const response = await requestArticles(fetch, articlesUri(q));
	if (response.articles === undefined) {
		throw new Error('articles missing from response; check actuproxy');
	}
	const articles = response.articles;
	const pubnameset: Set<string> = new Set();
	const catset: Set<string> = new Set();
	const cat_counter = new Counter();
	articles.forEach((article) => {
		pubnameset.add(article.pubname);
		catset.add(article.cat);
		cat_counter.inc(article.cat);
	});
	const pubnames: Array<string> = Array.from(pubnameset).sort();
	const catnames: Array<string> = Array.from(catset).sort();

	// Set only after a successful fetch, never as a side effect of load(): the
	// category bar and the sidebar read these, and a failed request must not
	// leave them describing articles that were never rendered.
	cats_store.set(catnames);
	selected_cats_store.set([]);
	cat_count_store.set(cat_counter);
	selected_pubs_store.set(pubnames);

	return {
		arts: articles,
		count: response.count,
		timeframe: q.timeframe,
		timespan: response.timespan,
		pubnames,
		ndocs: response.ndocs
	};
}
