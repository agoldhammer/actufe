import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { article, makeResponse } from '../src/lib/fixtures';

const articles = [
	article({
		title: 'Élections: le grand débat',
		summary: '<p>Résumé du débat électoral.</p>',
		pubdate: '2026-07-16 08:00',
		pubname: 'Le Monde',
		link: 'https://example.com/debat',
		hash: 'h1',
		cat: 'politics'
	}),
	article({
		title: 'Victoire au Tour de France',
		summary: '<p>Résumé de la victoire.</p>',
		pubdate: '2026-07-16 09:00',
		pubname: 'Libération',
		link: 'https://example.com/tour',
		hash: 'h2',
		cat: 'sports'
	})
];

const apiResponse = makeResponse(articles, {
	timespan: { start: '2026-07-16 07:00', end: '2026-07-16 10:00' },
	ndocs: '1234'
});

// The preview server has no /api proxy (nginx provides it in production),
// so the articles endpoint is always mocked.
async function mockArticles(page: Page) {
	await page.route('**/api/articles*', (route) => route.fulfill({ json: apiResponse }));
}

async function loginByStorage(page: Page) {
	await page.addInitScript(() => localStorage.setItem('auth', 'ok'));
}

// The login page is prerendered: it paints before its handlers are attached,
// so wait for hydration before typing into it.
async function gotoLogin(page: Page) {
	await page.goto('/login');
	await page.locator('.login[data-hydrated="true"]').waitFor();
}

test.describe('authentication', () => {
	test('unauthenticated visit redirects to the login page', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL(/login/);
		await expect(
			page.getByRole('heading', { name: 'Sorry, but this is not a public website' })
		).toBeVisible();
	});

	test('wrong magic word stays on the login page', async ({ page }) => {
		await gotoLogin(page);
		await page.getByPlaceholder('type magic word here').fill('abracadabra');
		await page.getByRole('button', { name: 'Enter' }).click();
		await expect(page).toHaveURL(/login/);
	});

	test('the magic word logs in and shows the articles', async ({ page }) => {
		await mockArticles(page);
		await gotoLogin(page);
		await page.getByPlaceholder('type magic word here').fill('shazam');
		await page.getByPlaceholder('type magic word here').press('Enter');
		await expect(page).toHaveTitle('Euronews');
		await expect(page.getByText('Élections: le grand débat')).toBeVisible();
	});
});

test.describe('article display', () => {
	test.beforeEach(async ({ page }) => {
		await mockArticles(page);
		await loginByStorage(page);
		await page.goto('/');
	});

	test('renders one card per article with title, pub, and category', async ({ page }) => {
		const cards = page.locator('.card');
		await expect(cards).toHaveCount(2);
		await expect(cards.first()).toContainText('Élections: le grand débat');
		await expect(cards.first()).toContainText('Le Monde');
		await expect(cards.first()).toContainText('Category: politics');
		await expect(cards.first().getByRole('link', { name: /Continue reading/ })).toHaveAttribute(
			'href',
			'https://example.com/debat'
		);
		// the headline itself is also a link to the article
		await expect(
			cards.first().getByRole('link', { name: 'Élections: le grand débat' })
		).toHaveAttribute('href', 'https://example.com/debat');
	});

	test('footer shows document counts and the timespan', async ({ page }) => {
		const footer = page.locator('.ftr');
		await expect(footer).toContainText('Total no. of docs 1234');
		await expect(footer).toContainText('Displaying 2');
		await expect(footer).toContainText('Start: 2026-07-16 07:00');
		await expect(footer).toContainText('End:');
	});

	test('category bar lists categories with counts and filters on click', async ({ page }) => {
		const catbar = page.locator('.cats');
		await expect(catbar).toContainText('politics (1)');
		await expect(catbar).toContainText('sports (1)');

		await page.locator('.cat', { hasText: 'politics' }).click();
		await expect(page.locator('.card')).toHaveCount(1);
		await expect(page.locator('.card')).toContainText('Élections: le grand débat');

		// clicking again deselects and restores all articles
		await page.locator('.cat', { hasText: 'politics' }).click();
		await expect(page.locator('.card')).toHaveCount(2);
	});

	test('unchecking a publication hides its articles', async ({ page }) => {
		await page.locator('label.option', { hasText: 'Libération' }).getByRole('checkbox').uncheck();
		await expect(page.locator('.card')).toHaveCount(1);
		await expect(page.locator('.card')).toContainText('Le Monde');
	});

	test('the All/None toggle clears and restores all articles', async ({ page }) => {
		const allNone = page.locator('label.option', { hasText: 'All/None' }).getByRole('checkbox');
		await allNone.uncheck();
		await expect(page.locator('.card')).toHaveCount(0);
		await allNone.check();
		await expect(page.locator('.card')).toHaveCount(2);
	});

	test('unchecking one publication also unchecks All/None', async ({ page }) => {
		const allNone = page.locator('label.option', { hasText: 'All/None' }).getByRole('checkbox');
		await expect(allNone).toBeChecked();
		await page.locator('label.option', { hasText: 'Libération' }).getByRole('checkbox').uncheck();
		await expect(allNone).not.toBeChecked();
	});

	test('filtering out everything shows an empty state whose reset restores all', async ({
		page
	}) => {
		await page.locator('label.option', { hasText: 'All/None' }).getByRole('checkbox').uncheck();
		await expect(page.locator('.card')).toHaveCount(0);
		await expect(page.getByText('No articles match the current filters.')).toBeVisible();
		await page.getByRole('button', { name: 'Reset filters' }).click();
		await expect(page.locator('.card')).toHaveCount(2);
	});

	test('the Hide summ. button collapses article summaries', async ({ page }) => {
		await expect(page.getByText('Résumé du débat électoral.')).toBeVisible();
		await page.getByRole('button', { name: /summ\./ }).click();
		await expect(page.getByText('Résumé du débat électoral.')).toHaveCount(0);
		await expect(page.getByText('Élections: le grand débat')).toBeVisible();
	});

	test('Escape and Cancel both dismiss the search box without searching', async ({ page }) => {
		await page.getByRole('button', { name: 'Query' }).click();
		await page.locator('#txtqry').press('Escape');
		await expect(page.locator('#txtqry')).toHaveCount(0);
		await expect(page.getByRole('button', { name: 'Query' })).toBeVisible();

		await page.getByRole('button', { name: 'Query' }).click();
		await page.getByRole('button', { name: 'Cancel' }).click();
		await expect(page.locator('#txtqry')).toHaveCount(0);
		await expect(page).not.toHaveURL(/txtquery/);
	});

	test('an active text query shows a chip that clears it', async ({ page }) => {
		await page.getByRole('button', { name: 'Query' }).click();
		await page.locator('#txtqry').fill('macron');
		await page.getByRole('button', { name: 'Submit' }).click();
		await expect(page).toHaveURL(/txtquery=macron/);
		const chip = page.locator('.query-chip');
		await expect(chip).toContainText('search: macron');
		await chip.click();
		await expect(page).not.toHaveURL(/txtquery/);
		await expect(chip).toHaveCount(0);
	});

	test('narrow screens hide the sidebar behind a Filters toggle', async ({ page }) => {
		await page.setViewportSize({ width: 400, height: 800 });
		await expect(page.locator('.sidebar')).toBeHidden();
		await page.getByRole('button', { name: /^Filters$/ }).click();
		await expect(page.locator('.sidebar')).toBeVisible();
		await page.getByRole('button', { name: 'Hide filters' }).click();
		await expect(page.locator('.sidebar')).toBeHidden();
	});
});

test.describe('scroll restoration', () => {
	// Enough articles across two publications to make the list scroll. Even
	// indexes belong to 'Keep Pub' (survive the filter below), odd ones to
	// 'Drop Pub'. Articles 20 and 21 deliberately share a hash: a feed can
	// deliver the same story twice in one window (the live feed does), and the
	// card ids must still be unique or the anchor lookup finds the wrong card.
	const many = Array.from({ length: 40 }, (_, i) =>
		article({
			hash: i === 21 ? 'h20' : `h${i}`,
			title: `Article ${i}`,
			summary: `<p>Summary paragraph for article number ${i}.</p>`,
			pubname: i % 2 === 0 ? 'Keep Pub' : 'Drop Pub'
		})
	);
	const manyResponse = makeResponse(many);

	// Cards are addressed by position in the unfiltered list, not by anything the
	// backend may or may not send.
	const card = (i: number) => `#card-${i}-${i === 21 ? 'h20' : `h${i}`}`;

	test.beforeEach(async ({ page }) => {
		await page.route('**/api/articles*', (route) => route.fulfill({ json: manyResponse }));
		await loginByStorage(page);
		await page.goto('/');
	});

	// The card currently at the top of the scroll container, and how far its top
	// sits from the container's top edge (0 = flush, negative = scrolled past).
	const topCard = (page: Page) =>
		page.locator('#pagecontent').evaluate((parent) => {
			const parentTop = parent.getBoundingClientRect().top;
			const cards = parent.getElementsByClassName('card');
			for (let i = 0; i < cards.length; i++) {
				const el = cards[i] as HTMLElement;
				const r = el.getBoundingClientRect();
				if (r.bottom > parentTop + 1) return { id: el.id, offset: r.top - parentTop };
			}
			return { id: '', offset: NaN };
		});

	// Leave a 'Keep Pub' card (index 10, survives the pub filter) as the top card,
	// deliberately scrolled 40px past the top so restoration has real work to do —
	// not pre-aligned, which would make "returns to the top" trivially true.
	async function scrollCard10PastTop(page: Page) {
		await page.locator(card(10)).evaluate((el) => el.scrollIntoView(true));
		await page.locator('#pagecontent').evaluate((p) => (p.scrollTop += 40));
		const before = await topCard(page);
		expect(before.id).toBe(card(10).slice(1));
		expect(before.offset).toBeLessThan(-20); // genuinely scrolled off the top
	}

	// The anchor is looked up with getElementById, so a repeated or missing card
	// id silently resolves to the first matching card and the restore scrolls the
	// list to the top. That is exactly what happened in production, where the
	// backend sends no `id` field and every card was id="card-undefined", while
	// the fixtures supplied one and kept these tests green.
	test('every card has a distinct, fully-resolved id', async ({ page }) => {
		const ids = await page
			.locator('#pagecontent')
			.evaluate((parent) => Array.from(parent.getElementsByClassName('card')).map((el) => el.id));
		expect(ids).toHaveLength(40);
		expect(new Set(ids).size).toBe(40);
		expect(ids.filter((id) => !id || /undefined|null/.test(id))).toEqual([]);
	});

	test('unchecking a publication keeps the top-of-viewport article anchored', async ({ page }) => {
		await expect(page.locator('.card')).toHaveCount(40);
		await scrollCard10PastTop(page);

		// Drop the other publication. With index-based anchoring the view jumped to
		// whatever article landed at the old top index; the article's own id must
		// bring it back to the top instead.
		await page.locator('label.option', { hasText: 'Drop Pub' }).getByRole('checkbox').uncheck();
		await expect(page.locator('.card')).toHaveCount(20);

		const after = await topCard(page);
		expect(after.id).toBe(card(10).slice(1));
		expect(Math.abs(after.offset)).toBeLessThan(3);
	});

	test('collapsing summaries returns the top-of-viewport article to the top', async ({ page }) => {
		await expect(page.locator('.card')).toHaveCount(40);
		await scrollCard10PastTop(page);

		// Collapsing summaries shrinks every card above the anchor. The anchored
		// article must be brought back to the top, not left drifting.
		await page.getByRole('button', { name: /summ\./ }).click();
		await expect(page.getByText('Summary paragraph for article number 10.')).toHaveCount(0);

		const after = await topCard(page);
		expect(after.id).toBe(card(10).slice(1));
		expect(Math.abs(after.offset)).toBeLessThan(3);
	});
});

test.describe('summary sanitization', () => {
	// Summaries reach the app from third-party RSS feeds, so a hostile one has to
	// be defused before it is rendered with {@html}. $lib/sanitize is unit-tested
	// on its own; this checks that it is actually wired into the render path.
	const hostile = makeResponse([
		article({
			summary:
				'<p>Lead paragraph.</p>' +
				'<script>window.__pwned = true;</script>' +
				'<img src="/nonexistent.png" onerror="window.__pwned = true;" alt="art">' +
				'<a href="javascript:window.__pwned = true">click</a>' +
				'<iframe src="https://example.com/frame"></iframe>'
		})
	]);

	test.beforeEach(async ({ page }) => {
		await page.route('**/api/articles*', (route) => route.fulfill({ json: hostile }));
		await loginByStorage(page);
		await page.goto('/');
	});

	test('active content in a summary is stripped and never runs', async ({ page }) => {
		const body = page.locator('.cardbody');
		await expect(body).toContainText('Lead paragraph.');

		await expect(body.locator('script')).toHaveCount(0);
		await expect(body.locator('iframe')).toHaveCount(0);
		// The image survives (feeds legitimately use them) minus its handler; the
		// broken src makes the browser fire error, which must do nothing.
		await expect(body.locator('img')).toHaveCount(1);
		await expect(body.locator('img')).not.toHaveAttribute('onerror', /./);
		await expect(body.locator('a')).not.toHaveAttribute('href', /javascript:/);
		expect(await page.evaluate(() => '__pwned' in window)).toBe(false);
	});
});

test.describe('slow and failed article requests', () => {
	// The reported mobile bug: roughly one load in five came up blank and stayed
	// that way until the user pressed Back. With `ssr = false` there is no
	// server-rendered markup, and SvelteKit's client router only starts once the
	// initial load resolves — so awaiting the article fetch inside load left the
	// page both empty and inert, and Back "fixed" it only by leaving the document.
	test('a slow request shows a loading panel and a live router, not a blank page', async ({
		page
	}) => {
		await loginByStorage(page);
		let release!: () => void;
		const held = new Promise<void>((resolve) => (release = resolve));
		await page.route('**/api/articles*', async (route) => {
			await held;
			await route.fulfill({ json: apiResponse });
		});

		await page.goto('/', { waitUntil: 'commit' });

		// Something is on screen while the articles are still on the wire...
		await expect(page.getByText('Loading articles…')).toBeVisible();
		// ...and the router is running, which is what makes links, in-app
		// navigation and scroll restoration work during the wait. SvelteKit sets
		// scrollRestoration to 'manual' as the first act of _start_router().
		await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe('manual');

		release();
		await expect(page.getByText('Élections: le grand débat')).toBeVisible();
	});

	test('a failed request explains itself and the retry recovers', async ({ page }) => {
		await loginByStorage(page);
		let attempts = 0;
		await page.route('**/api/articles*', (route) => {
			attempts += 1;
			// $lib/articles retries once on its own, so fail both tries of the first
			// request, then serve the articles to whatever the retry button sends.
			if (attempts <= 2) return route.fulfill({ status: 502, body: 'bad gateway' });
			return route.fulfill({ json: apiResponse });
		});

		await page.goto('/');

		await expect(page.getByText('Could not load the articles.')).toBeVisible();
		await expect(page.getByText(/HTTP 502/)).toBeVisible();
		await page.getByRole('button', { name: 'Try again' }).click();
		await expect(page.getByText('Élections: le grand débat')).toBeVisible();
	});

	// A 200 carrying a body the components can't render is worse than a 502: the
	// fetch succeeds, {#await} moves to its :then branch, and the throw lands in
	// the middle of building the article tree — where it is not a rejected
	// promise, so {#await} never sees it, and where the boot watchdog has long
	// since bowed out. Measured on both engines, the page keeps the loading
	// panel and spins on it for good. $lib/articles therefore checks every field
	// the components read unguarded, so this arrives as a rejection instead.
	test('a response missing timespan fails the load, not the render', async ({ page }) => {
		await loginByStorage(page);
		const malformed: Record<string, unknown> = { ...apiResponse };
		delete malformed.timespan;
		await page.route('**/api/articles*', (route) => route.fulfill({ json: malformed }));

		await page.goto('/');

		await expect(page.getByText('Could not load the articles.')).toBeVisible();
		await expect(page.getByText(/timespan missing/)).toBeVisible();
		await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
		await expect(page.getByText('Loading articles…')).toHaveCount(0);
	});
});

test.describe('the boot skeleton', () => {
	// app.html carries a watchdog because the shell is otherwise empty: with
	// `ssr = false` nothing is on screen until the app's modules have downloaded
	// and run, and if one of them never arrives the shell's
	// Promise.all([...]).then(...) stays pending forever with nothing to report it.
	test('reports a boot that never completes, and the page can be reloaded', async ({ page }) => {
		await loginByStorage(page);
		// Kill the module graph the way a dropped mobile connection does.
		await page.route('**/_app/**', (route) => route.abort());

		await page.goto('/', { waitUntil: 'commit' });

		// Well inside GIVE_UP_AFTER_MS (10s): the failed dynamic imports reject the
		// shell's un-caught Promise.all, and the watchdog's unhandledrejection
		// handler reports that at once rather than sitting out the whole timeout.
		await expect(page.getByText('The app didn’t finish loading.')).toBeVisible({
			timeout: 5000
		});
		await expect(page.getByRole('button', { name: 'Reload' })).toBeVisible();
		// The loading spinner must not still be claiming progress underneath.
		await expect(page.locator('#boot .boot-loading')).toBeHidden();
	});

	// The failure the watchdog moved into <head> for. A phone waking on a cold
	// radio commits the response and then loses the socket, so the document
	// arrives truncated: the parser never reaches the end of <body>, where both
	// the skeleton's markup and its watchdog used to live. Nothing was left
	// running to report it, and the page stayed white until the user pressed Back.
	//
	// Moving it into <head> was worth much less than it looked: the watchdog
	// finished parsing at 90% of the shell, so 90% still had to arrive. The two
	// timers now live in a stub at the very top of <head> — 8% in — and the rest
	// of the file is only what dresses their verdict up. A single cut proves
	// almost nothing about that (the old one cut at <div id="app">, 89% in, and
	// so exercised the last 11%), which is why this sweeps the offset instead.
	// `reporter` is which half of the pair is expected to do the reporting: the
	// stub's bare fallback, or the styled #boot panel once the watchdog has
	// parsed. Both have to offer a way out, since Back is the only other one.
	const cuts: [string, (html: string) => number, 'stub' | 'panel'][] = [
		// Immediately after the stub's own closing tag: everything else — the
		// stylesheet, the watchdog, SvelteKit, <body> — is still missing.
		['just after the head stub', (html) => html.indexOf('</script>') + '</script>'.length, 'stub'],
		// Mid-stylesheet, so the stub is armed but the boot skeleton's CSS is not.
		['midway through the boot stylesheet', (html) => html.indexOf('#boot .boot-spinner'), 'stub'],
		// After the full watchdog, which reports through the styled overlay.
		[
			'just after the watchdog',
			(html) => html.indexOf('</script>', html.indexOf('Watchdog for the boot skeleton')) + 9,
			'panel'
		],
		// The original case: everything but SvelteKit's own bootstrap.
		[
			'at the opening #app tag',
			(html) => html.indexOf('>', html.indexOf('<div id="app"')) + 1,
			'panel'
		]
	];

	async function truncateShell(page: Page, at: (html: string) => number) {
		await page.route('**/', async (route) => {
			if (route.request().resourceType() !== 'document') return route.fallback();
			const html = await (await route.fetch()).text();
			await route.fulfill({ contentType: 'text/html', body: html.slice(0, at(html)) });
		});
	}

	for (const [where, at, reporter] of cuts) {
		test(`reports a document that stops arriving ${where}`, async ({ page }) => {
			await loginByStorage(page);
			await truncateShell(page, at);

			await page.goto('/');

			// Said by both halves; only the second can dress it up.
			await expect(page.getByText('finish loading')).toBeVisible({ timeout: 15000 });

			if (reporter === 'stub') {
				await expect(page.getByText('Tap to reload')).toBeVisible();
				await expect(page.locator('#boot')).toHaveCount(0);
			} else {
				await expect(page.getByRole('button', { name: 'Reload' })).toBeVisible();
				// The spinner must not still be claiming progress underneath.
				await expect(page.locator('#boot .boot-loading')).toBeHidden();
			}
		});
	}

	// The control that keeps the four above honest. One character earlier the
	// stub's closing </script> is incomplete, so the HTML parser never runs it,
	// no timer is ever armed, and nothing reports anything — which is precisely
	// the state the whole file exists to prevent, and precisely what the old
	// single cut at <div id="app"> could not tell apart from success.
	test('one character before the stub closes, nothing reports at all', async ({ page }) => {
		await loginByStorage(page);
		await truncateShell(page, (html) => html.indexOf('</script>') + '</script>'.length - 1);

		await page.goto('/');

		await page.waitForTimeout(12000);
		await expect(page.getByText('finish loading')).toHaveCount(0);
		await expect(page.getByText('Loading…')).toHaveCount(0);
	});

	test('gets out of the way once the app renders', async ({ page }) => {
		await mockArticles(page);
		await loginByStorage(page);
		await page.goto('/');

		await expect(page.locator('.card').first()).toBeVisible();
		// Removed from the DOM, not merely hidden: it is position:fixed over the
		// whole viewport, so anything left behind would swallow clicks.
		await expect(page.locator('#boot')).toHaveCount(0);
	});

	test('is gone immediately on a prerendered page', async ({ page }) => {
		await page.goto('/about');
		await expect(page.locator('#boot')).toHaveCount(0);
	});

	// ...but getting out of the way used to mean going deaf. done() latched
	// `finished`, and every later error and rejection was dropped on the floor —
	// so anything that killed the app after its first render left whatever was
	// last on screen there, saying nothing, forever. The launch of 18 Aug 2026
	// reached /api/articles and then showed nothing for the half minute before
	// the reader gave up and pressed Back, and no in-page code was left running
	// that could have said why.
	test('still reports an error that arrives after the app has rendered', async ({ page }) => {
		await loginByStorage(page);
		let release!: () => void;
		const held = new Promise<void>((resolve) => (release = resolve));
		await page.route('**/api/articles*', async (route) => {
			await held;
			await route.fulfill({ json: apiResponse });
		});

		await page.goto('/');
		// The panel that retires the watchdog: it has a height, so as far as
		// done() is concerned the app is up.
		await expect(page.getByText('Loading articles…')).toBeVisible();

		// Detached from evaluate's own promise so it reaches the window as an
		// unhandled rejection, the way a pruned chunk does.
		await page.evaluate(() => {
			setTimeout(() => {
				Promise.reject(new Error('chunk gone'));
			}, 0);
		});

		await expect(page.getByText('The app didn’t finish loading.')).toBeVisible();
		await expect(page.getByText(/chunk gone/)).toBeVisible();
		await expect(page.getByRole('button', { name: 'Reload' })).toBeVisible();

		// And it yields again if the app turns out to be alive after all: the
		// overlay is only there because the panel underneath it was still
		// promising articles.
		release();
		await expect(page.getByText('Élections: le grand débat')).toBeVisible();
		await expect(page.locator('#boot')).toHaveCount(0);
	});

	// The app cannot be asked what it saw: it runs on a phone, with no console
	// to open, and a reader who can only describe the screen afterwards. So it
	// tells the server, and the answers land in the nginx access log next to the
	// /api/articles request from the same launch.
	test('reports how far the launch got', async ({ page }) => {
		const beacons: string[] = [];
		page.on('request', (request) => {
			const url = new URL(request.url());
			if (url.pathname.endsWith('/_b')) beacons.push(url.searchParams.get('m') ?? '');
		});
		await mockArticles(page);
		await loginByStorage(page);

		await page.goto('/');
		await expect(page.locator('.card').first()).toBeVisible();

		// `app` is the app having rendered something; `up` is a frame having been
		// painted afterwards, which is the one that separates an app that died
		// from an app that was never put on screen. The preview server has no /_b
		// (nginx provides it in production), and the 404 is deliberately not
		// mocked away — a beacon that fails must never be visible to the reader.
		await expect.poll(() => beacons).toContain('app');
		await expect.poll(() => beacons).toContain('up');
	});
});

test.describe('the service worker', () => {
	// Everywhere else these run with service workers blocked (see
	// playwright.config.ts). Here they are the subject.
	test.use({ serviceWorkers: 'allow' });

	// Registration happens on the window's load event, and the page that
	// registers is deliberately not claimed — so the worker only takes over from
	// the *next* launch. This is that launch. Logged in first, because the
	// redirect to /login would tear down the execution context mid-evaluate.
	async function launchUnderServiceWorker(page: Page) {
		await loginByStorage(page);
		await page.goto('/');
		await page.evaluate(() => navigator.serviceWorker.ready);
		await page.goto('/');
		await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
	}

	// Navigation Timing's transferSize is zero exactly when nothing came off the
	// network (Chromium additionally labels the entry deliveryType
	// 'cache-storage'). It is what tells a document served out of the precache
	// apart from one the worker merely fetched on the page's behalf — a
	// distinction fromServiceWorker() cannot make — and both engines report it.
	const transferredBytes = (page: Page) =>
		page.evaluate(
			() =>
				(performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming).transferSize
		);

	// The one sentence this whole file is for. Everything that has gone wrong on
	// this app's launch path has gone wrong in the stretch between tapping the
	// icon and the app running — a document that arrived truncated, a document
	// that arrived and never ran, a chunk that never arrived at all — and every
	// one of those needed the document to come off the wire. Now it does not.
	test('serves the launch document itself, without a byte off the wire', async ({ page }) => {
		const shell: boolean[] = [];
		page.on('response', (response) => {
			if (new URL(response.url()).pathname === '/') shell.push(response.fromServiceWorker());
		});

		await loginByStorage(page);
		await page.goto('/');
		// The launch that registers the worker is deliberately left uncontrolled and
		// pays full price for the document, which is what makes the figure below
		// mean something.
		expect(await transferredBytes(page)).toBeGreaterThan(0);

		await page.evaluate(() => navigator.serviceWorker.ready);
		await page.goto('/');
		await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

		expect(await transferredBytes(page)).toBe(0);
		expect(shell).toEqual([false, true]);
	});

	// The end-to-end version of the test above: with the plug pulled there is no
	// network for anything to come from, so an app that renders at all rendered
	// out of the precache — shell, entry chunks, route chunks and CSS. It cannot
	// have the articles, and saying so in its own words is the proof that it is
	// the app talking and not the boot skeleton.
	test('launches with no network at all, and says why it has no articles', async ({
		page,
		context,
		browserName
	}) => {
		// Playwright's WebKit cannot navigate at all while offline — page.goto
		// fails with an internal error before the worker is ever consulted. The
		// test above covers both engines; this one goes further where it can.
		test.skip(browserName === 'webkit', 'Playwright WebKit cannot navigate offline');

		await launchUnderServiceWorker(page);

		// Belt and braces, so that what answers below can only be the precache.
		// Chromium as it stands declines to serve an offline navigation from its
		// own HTTP cache — checked, by stripping Cache Storage out of the worker
		// with this line both present and absent — but that is a policy, not a
		// guarantee, and it is the sort of policy that changes quietly.
		await (await context.newCDPSession(page)).send('Network.clearBrowserCache');

		await context.setOffline(true);
		await page.goto('/');

		await expect(page.getByText('Could not load the articles.')).toBeVisible({ timeout: 15000 });
		await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
		// Not the boot skeleton's failure — that would mean the shell never ran.
		await expect(page.getByText('finish loading')).toHaveCount(0);
		// And the router is running, not just some markup on screen: SvelteKit
		// sets this as the first act of _start_router().
		expect(await page.evaluate(() => history.scrollRestoration)).toBe('manual');
	});

	// The one request on the page whose whole purpose is to differ between two
	// launches five minutes apart. Caching it would freeze the news at whatever
	// was current when the build shipped — a quieter bug than a blank page and a
	// worse one — and would hide nginx's 429 from the app's own error panel.
	test('precaches the shell and its chunks, and never the articles', async ({
		page,
		browserName
	}) => {
		// A real 200, because a worker that cached indiscriminately would still
		// skip the preview server's bare 502 and the test would prove nothing.
		// Playwright only intercepts a service-worker-controlled page's requests
		// in Chromium, so on WebKit this stays an assertion about the cache's
		// contents rather than a demonstration.
		await mockArticles(page);
		await launchUnderServiceWorker(page);
		if (browserName === 'chromium') await expect(page.locator('.card').first()).toBeVisible();
		// The app has asked for the articles by now, so anything that was going to
		// put them in the cache has had its chance.
		await expect.poll(() => page.evaluate(() => history.scrollRestoration)).toBe('manual');

		const paths = await page.evaluate(async () => {
			const [name] = await caches.keys();
			const cache = await caches.open(name);
			return (await cache.keys()).map((request) => new URL(request.url).pathname);
		});

		expect(paths).toContain('/');
		expect(paths).toContain('/login');
		expect(paths.filter((p) => p.startsWith('/_app/immutable/'))).not.toHaveLength(0);
		expect(paths.filter((p) => p.startsWith('/api/'))).toEqual([]);
	});

	// A precache that outlives the build it was made from is the stale-shell
	// blank page wearing a new hat: a cached index.html referencing chunks the
	// next `rsync --delete` has already pruned. One cache per build version, and
	// activate dropping every other one, is what keeps a shell and its chunks
	// together.
	test('drops an earlier build’s cache when it takes over', async ({ page }) => {
		// Stands in for what a previous deploy left behind. It has to exist before
		// the worker activates, hence addInitScript rather than a plain evaluate —
		// and the guard keeps the second launch, which the worker is already
		// controlling, from putting it back after the deletion it is testing.
		await page.addInitScript(() => {
			if (!navigator.serviceWorker.controller) void caches.open('nooze-stale');
		});

		await launchUnderServiceWorker(page);

		// Polled: `ready` can resolve while the worker is still activating, i.e.
		// with the deletion still in flight.
		await expect
			.poll(() => page.evaluate(() => caches.keys()))
			.toEqual([expect.stringMatching(/^nooze-\d+$/)]);
	});
});
