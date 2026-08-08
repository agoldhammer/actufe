export const ssr = false;
export const prerender = false;
import { time_window_store } from '$lib/actustores';
import { fetchAppdata } from '$lib/articles';

export const load = function ({ fetch, url }) {
	const authed = localStorage.getItem('auth');
	if (authed !== 'ok') {
		// A redirect thrown from a client-only load can leave some mobile browsers
		// with an unfinished initial navigation. Let the page perform a replacement
		// navigation after it has mounted instead.
		return { requiresLogin: true as const, appdata: null };
	}
	const timeframe = url.searchParams.get('timeframe') || '0';
	const time_window = url.searchParams.get('timewindow') || '3';
	const text_query = url.searchParams.get('txtquery');
	// URL-derived, so it is known without touching the network and the header's
	// window selector is correct on the very first paint.
	time_window_store.set(parseInt(time_window));

	// Deliberately NOT awaited — see the header comment in $lib/articles. Awaiting
	// here blocks the first paint *and* the start of the client router on exactly
	// the flaky mobile connections where that hurts most. SvelteKit 2 does not
	// unwrap top-level promises returned from a universal load, so this arrives at
	// the page unresolved and +page.svelte renders it with {#await}.
	const appdata = fetchAppdata(fetch, { timeframe, time_window, text_query });
	// Mark it handled so a rejection landing before {#await} subscribes is not
	// reported as an unhandled rejection. {#await} still receives the rejection;
	// this only attaches a second, no-op handler.
	appdata.catch(() => {
		// deliberately empty: the {#await} block is what actually reports this
	});

	return { requiresLogin: false as const, appdata };
};
