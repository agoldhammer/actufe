import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { load } from './+page';
import {
	cats_store,
	selected_cats_store,
	cat_count_store,
	time_window_store,
	selected_pubs_store
} from '$lib/actustores';
import { Counter } from '$lib/counter';
import { article, makeResponse } from '$lib/fixtures';

const mockFetch = (body: unknown) =>
	vi.fn().mockResolvedValue({ json: () => Promise.resolve(body) });

const runLoad = (fetch: unknown, search = '') =>
	// Only fetch and url are used by load; the rest of the event is irrelevant.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(load as any)({ fetch, url: new URL(`http://localhost/${search}`) });

describe('load', () => {
	beforeEach(() => {
		vi.stubGlobal('localStorage', {
			getItem: vi.fn().mockReturnValue('ok')
		});
		// reset module-level stores mutated by load
		cats_store.set([]);
		selected_cats_store.set([]);
		cat_count_store.set(new Counter());
		selected_pubs_store.set([]);
		time_window_store.set(3);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('asks for login when not authenticated, without fetching', async () => {
		vi.stubGlobal('localStorage', {
			getItem: vi.fn().mockReturnValue(null)
		});
		const fetch = mockFetch(makeResponse([]));
		await expect(runLoad(fetch)).resolves.toEqual({ requiresLogin: true });
		expect(fetch).not.toHaveBeenCalled();
	});

	it('fetches with default timeframe 0 and timewindow 3', async () => {
		const fetch = mockFetch(makeResponse([article()]));
		await runLoad(fetch);
		expect(fetch).toHaveBeenCalledWith('/api/articles?timeframe=0&timewindow=3');
	});

	it('passes timeframe and timewindow from the url', async () => {
		const fetch = mockFetch(makeResponse([article()]));
		await runLoad(fetch, '?timeframe=2&timewindow=12');
		expect(fetch).toHaveBeenCalledWith('/api/articles?timeframe=2&timewindow=12');
		expect(get(time_window_store)).toBe(12);
	});

	it('includes txtquery in the request when present', async () => {
		const fetch = mockFetch(makeResponse([article()]));
		await runLoad(fetch, '?txtquery=macron');
		expect(fetch).toHaveBeenCalledWith('/api/articles?timeframe=0&timewindow=3&txtquery=macron');
	});

	it('omits txtquery when it is empty', async () => {
		const fetch = mockFetch(makeResponse([article()]));
		await runLoad(fetch, '?txtquery=');
		expect(fetch).toHaveBeenCalledWith('/api/articles?timeframe=0&timewindow=3');
	});

	it('returns the response data and sorted pubnames', async () => {
		const arts = [
			article({ id: '1', pubname: 'Le Monde', cat: 'politics' }),
			article({ id: '2', pubname: 'Libération', cat: 'sports' }),
			article({ id: '3', pubname: 'AFP', cat: 'politics' })
		];
		const fetch = mockFetch(makeResponse(arts));
		const result = await runLoad(fetch, '?timeframe=1');
		expect(result).toEqual({
			requiresLogin: false,
			arts,
			count: '3',
			timeframe: '1',
			timespan: { start: '2026-07-16T00:00:00Z', end: '2026-07-16T03:00:00Z' },
			pubnames: ['AFP', 'Le Monde', 'Libération'],
			ndocs: '1000'
		});
	});

	it('populates the category stores from the articles', async () => {
		const arts = [
			article({ id: '1', cat: 'politics' }),
			article({ id: '2', cat: 'sports' }),
			article({ id: '3', cat: 'politics' })
		];
		selected_cats_store.set(['stale selection']);
		await runLoad(mockFetch(makeResponse(arts)));
		expect(get(cats_store)).toEqual(['politics', 'sports']);
		expect(get(selected_cats_store)).toEqual([]);
		const counter = get(cat_count_store);
		expect(counter.getCount('politics')).toBe(2);
		expect(counter.getCount('sports')).toBe(1);
	});

	it('selects all pubs by default', async () => {
		const arts = [article({ id: '1', pubname: 'B Pub' }), article({ id: '2', pubname: 'A Pub' })];
		await runLoad(mockFetch(makeResponse(arts)));
		expect(get(selected_pubs_store)).toEqual(['A Pub', 'B Pub']);
	});

	it('handles an empty article list', async () => {
		const result = await runLoad(mockFetch(makeResponse([])));
		expect(result.arts).toEqual([]);
		expect(result.pubnames).toEqual([]);
		expect(get(cats_store)).toEqual([]);
	});

	it('throws a 502 with a clear message when the fetch fails', async () => {
		const fetch = vi.fn().mockRejectedValue(new Error('connection refused'));
		await expect(runLoad(fetch)).rejects.toMatchObject({
			status: 502,
			body: {
				message: expect.stringContaining(
					'failed to fetch articles from /api/articles?timeframe=0&timewindow=3'
				)
			}
		});
	});

	it('throws a 502 when articles are missing from the response', async () => {
		const fetch = mockFetch({ count: '0' });
		await expect(runLoad(fetch)).rejects.toMatchObject({
			status: 502,
			body: { message: expect.stringContaining('articles missing from response') }
		});
	});
});
