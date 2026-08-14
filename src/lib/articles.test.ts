import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { fetchAppdata, articlesUri, ATTEMPT_TIMEOUT_MS, ATTEMPTS } from '$lib/articles';
import {
	cats_store,
	selected_cats_store,
	cat_count_store,
	selected_pubs_store
} from '$lib/actustores';
import { Counter } from '$lib/counter';
import { article, makeResponse } from '$lib/fixtures';

const okResponse = (body: unknown) => ({
	ok: true,
	status: 200,
	json: () => Promise.resolve(body)
});

const mockFetch = (body: unknown) => vi.fn().mockResolvedValue(okResponse(body));

const query = (overrides = {}) => ({
	timeframe: '0',
	time_window: '3',
	text_query: null,
	...overrides
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const run = (fetch: unknown, overrides = {}) => fetchAppdata(fetch as any, query(overrides));

// The uri the mocked fetch is expected to be called with, alongside the abort
// signal every attempt now carries.
const calledWith = (uri: string) => [uri, { signal: expect.any(AbortSignal) }];

describe('articlesUri', () => {
	it('uses the given timeframe and time window', () => {
		expect(articlesUri(query({ timeframe: '2', time_window: '12' }))).toBe(
			'/api/articles?timeframe=2&timewindow=12'
		);
	});

	it('includes txtquery when present', () => {
		expect(articlesUri(query({ text_query: 'macron' }))).toBe(
			'/api/articles?timeframe=0&timewindow=3&txtquery=macron'
		);
	});

	it('omits txtquery when it is empty', () => {
		expect(articlesUri(query({ text_query: '' }))).toBe('/api/articles?timeframe=0&timewindow=3');
	});
});

describe('fetchAppdata', () => {
	beforeEach(() => {
		cats_store.set([]);
		selected_cats_store.set([]);
		cat_count_store.set(new Counter());
		selected_pubs_store.set([]);
	});

	it('requests the articles with an abort signal', async () => {
		const fetch = mockFetch(makeResponse([article()]));
		await run(fetch);
		expect(fetch).toHaveBeenCalledWith(...calledWith('/api/articles?timeframe=0&timewindow=3'));
	});

	it('returns the response data and sorted pubnames', async () => {
		const arts = [
			article({ hash: 'h1', pubname: 'Le Monde', cat: 'politics' }),
			article({ hash: 'h2', pubname: 'Libération', cat: 'sports' }),
			article({ hash: 'h3', pubname: 'AFP', cat: 'politics' })
		];
		await expect(run(mockFetch(makeResponse(arts)), { timeframe: '1' })).resolves.toEqual({
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
			article({ hash: 'h1', cat: 'politics' }),
			article({ hash: 'h2', cat: 'sports' }),
			article({ hash: 'h3', cat: 'politics' })
		];
		selected_cats_store.set(['stale selection']);
		await run(mockFetch(makeResponse(arts)));
		expect(get(cats_store)).toEqual(['politics', 'sports']);
		expect(get(selected_cats_store)).toEqual([]);
		const counter = get(cat_count_store);
		expect(counter.getCount('politics')).toBe(2);
		expect(counter.getCount('sports')).toBe(1);
	});

	it('selects all pubs by default', async () => {
		const arts = [
			article({ hash: 'h1', pubname: 'B Pub' }),
			article({ hash: 'h2', pubname: 'A Pub' })
		];
		await run(mockFetch(makeResponse(arts)));
		expect(get(selected_pubs_store)).toEqual(['A Pub', 'B Pub']);
	});

	it('handles an empty article list', async () => {
		const result = await run(mockFetch(makeResponse([])));
		expect(result.arts).toEqual([]);
		expect(result.pubnames).toEqual([]);
		expect(get(cats_store)).toEqual([]);
	});

	it('leaves the filter stores untouched when the fetch fails', async () => {
		cats_store.set(['previous']);
		selected_pubs_store.set(['Previous Pub']);
		await expect(run(vi.fn().mockRejectedValue(new Error('nope')))).rejects.toThrow();
		expect(get(cats_store)).toEqual(['previous']);
		expect(get(selected_pubs_store)).toEqual(['Previous Pub']);
	});

	it('fails with a clear message naming the uri', async () => {
		const fetch = vi.fn().mockRejectedValue(new Error('connection refused'));
		await expect(run(fetch)).rejects.toThrow(
			/failed to fetch articles from \/api\/articles\?timeframe=0&timewindow=3/
		);
	});

	it('fails when articles are missing from the response', async () => {
		await expect(run(mockFetch({ count: '0' }))).rejects.toThrow(/articles missing from response/);
	});

	it('reports the status instead of a parse error on a non-2xx response', async () => {
		const fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 502,
			json: () => Promise.reject(new SyntaxError('Unexpected token <'))
		});
		await expect(run(fetch)).rejects.toThrow(/HTTP 502/);
	});

	it('retries once and succeeds on the second attempt', async () => {
		const fetch = vi
			.fn()
			.mockRejectedValueOnce(new Error('network changed'))
			.mockResolvedValueOnce(okResponse(makeResponse([article()])));
		await expect(run(fetch)).resolves.toMatchObject({ count: '1' });
		expect(fetch).toHaveBeenCalledTimes(2);
	});

	it('gives up after the configured number of attempts', async () => {
		const fetch = vi.fn().mockRejectedValue(new Error('still down'));
		await expect(run(fetch)).rejects.toThrow();
		expect(fetch).toHaveBeenCalledTimes(ATTEMPTS);
	});

	// The failure mode that produced the reported bug: a phone whose socket dies
	// without the promise ever settling. Without a deadline this hangs forever.
	describe('a request that never settles', () => {
		beforeEach(() => vi.useFakeTimers());
		afterEach(() => vi.useRealTimers());

		it('is aborted and reported rather than left pending', async () => {
			const fetch = vi.fn(
				(_uri: string, init: { signal: AbortSignal }) =>
					new Promise((_resolve, reject) => {
						init.signal.addEventListener('abort', () =>
							reject(new DOMException('The operation was aborted.', 'AbortError'))
						);
					})
			);
			const settled = expect(run(fetch)).rejects.toThrow(/failed to fetch articles/);
			await vi.advanceTimersByTimeAsync(ATTEMPT_TIMEOUT_MS * ATTEMPTS + 100);
			await settled;
			expect(fetch).toHaveBeenCalledTimes(ATTEMPTS);
		});

		// The headers can arrive and the body still never finish — a socket that
		// dies mid-response. The deadline has to outlive the headers, or the
		// attempt hangs in response.json() and never rejects, so nothing retries
		// and the page spins forever.
		it('is aborted when the body stalls after the headers arrive', async () => {
			const fetch = vi.fn((_uri: string, init: { signal: AbortSignal }) =>
				Promise.resolve({
					ok: true,
					status: 200,
					// A real body stream errors when the signal aborts; a plain
					// never-settling promise here would hang the test itself.
					json: () =>
						new Promise((_resolve, reject) => {
							init.signal.addEventListener('abort', () =>
								reject(new DOMException('The operation was aborted.', 'AbortError'))
							);
						})
				})
			);
			const settled = expect(run(fetch)).rejects.toThrow(/failed to fetch articles/);
			await vi.advanceTimersByTimeAsync(ATTEMPT_TIMEOUT_MS * ATTEMPTS + 100);
			await settled;
			expect(fetch).toHaveBeenCalledTimes(ATTEMPTS);
		});
	});
});
