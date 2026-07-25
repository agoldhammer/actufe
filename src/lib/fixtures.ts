// Shared, typed test fixtures for the /api/articles contract, used by both
// the vitest suite (src/routes/page.test.ts) and the Playwright suite
// (tests/test.ts) so the mocked shape can't drift in one place only.
import type { Article } from '$lib/types';

// Keep this in the exact shape of a real /api/articles article — no extra
// fields. `hash` is the only per-article identifier the backend supplies.
export const article = (overrides: Partial<Article> = {}): Article => ({
	title: 'title',
	summary: 'summary',
	pubdate: '2026-07-16T00:00:00Z',
	pubname: 'Le Monde',
	link: 'https://example.com/1',
	hash: 'h1',
	cat: 'politics',
	...overrides
});

export const makeResponse = (articles: Article[], extra = {}) => ({
	articles,
	count: String(articles.length),
	timespan: { start: '2026-07-16T00:00:00Z', end: '2026-07-16T03:00:00Z' },
	ndocs: '1000',
	...extra
});
