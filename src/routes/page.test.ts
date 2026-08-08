import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { load } from './+page';
import { time_window_store } from '$lib/actustores';
import { article, makeResponse } from '$lib/fixtures';

// A minimal stand-in for the Response that fetch resolves to.
const okResponse = (body: unknown) => ({
	ok: true,
	status: 200,
	json: () => Promise.resolve(body)
});

const mockFetch = (body: unknown) => vi.fn().mockResolvedValue(okResponse(body));

const runLoad = (fetch: unknown, search = '') =>
	// Only fetch and url are used by load; the rest of the event is irrelevant.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(load as any)({ fetch, url: new URL(`http://localhost/${search}`) });

describe('load', () => {
	beforeEach(() => {
		vi.stubGlobal('localStorage', {
			getItem: vi.fn().mockReturnValue('ok')
		});
		time_window_store.set(3);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('asks for login when not authenticated, without fetching', () => {
		vi.stubGlobal('localStorage', {
			getItem: vi.fn().mockReturnValue(null)
		});
		const fetch = mockFetch(makeResponse([]));
		expect(runLoad(fetch)).toEqual({ requiresLogin: true, appdata: null });
		expect(fetch).not.toHaveBeenCalled();
	});

	// The regression this whole change exists for. When load awaited the article
	// fetch, SvelteKit rendered nothing and started no router until the network
	// answered, so a stalled request left the page blank and inert — the reported
	// mobile bug. load must hand back an unresolved promise instead.
	it('returns before the articles arrive, so the page can paint immediately', async () => {
		let release!: (r: unknown) => void;
		const pending = new Promise((resolve) => (release = resolve));
		const fetch = vi.fn().mockReturnValue(pending);

		const result = runLoad(fetch);

		// Synchronous: not a promise the router has to wait on.
		expect(result).not.toBeInstanceOf(Promise);
		expect(result.requiresLogin).toBe(false);
		expect(result.appdata).toBeInstanceOf(Promise);

		release(okResponse(makeResponse([article()])));
		await expect(result.appdata).resolves.toMatchObject({ count: '1' });
	});

	// A fetch that never settles, standing in for the stalled mobile request.
	const neverSettles = () =>
		vi.fn().mockReturnValue(
			new Promise(() => {
				// deliberately never resolves
			})
		);

	it('sets the time window store from the url without waiting for the fetch', () => {
		runLoad(neverSettles(), '?timeframe=2&timewindow=12');
		expect(get(time_window_store)).toBe(12);
	});

	it('defaults the time window to 3 hours', () => {
		runLoad(neverSettles());
		expect(get(time_window_store)).toBe(3);
	});

	it('resolves to the article data for the requested timeframe', async () => {
		const result = runLoad(mockFetch(makeResponse([article()])), '?timeframe=1');
		await expect(result.appdata).resolves.toMatchObject({ timeframe: '1' });
	});

	it('does not report an unhandled rejection when the fetch fails', async () => {
		const unhandled = vi.fn();
		process.on('unhandledRejection', unhandled);
		const result = runLoad(vi.fn().mockRejectedValue(new Error('connection refused')));
		// let the rejection propagate through both attempts
		await new Promise((r) => setTimeout(r, 0));
		await expect(result.appdata).rejects.toThrow(/failed to fetch articles/);
		process.off('unhandledRejection', unhandled);
		expect(unhandled).not.toHaveBeenCalled();
	});
});
