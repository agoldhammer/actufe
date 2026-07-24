import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { article, makeResponse } from '../src/lib/fixtures';

const articles = [
	article({
		id: '1',
		title: 'Élections: le grand débat',
		summary: '<p>Résumé du débat électoral.</p>',
		pubdate: '2026-07-16 08:00',
		pubname: 'Le Monde',
		link: 'https://example.com/debat',
		hash: 'h1',
		cat: 'politics'
	}),
	article({
		id: '2',
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
	// Enough articles across two publications to make the list scroll. Even ids
	// belong to 'Keep Pub' (survive the filter below), odd ids to 'Drop Pub'.
	const many = Array.from({ length: 40 }, (_, i) =>
		article({
			id: String(i),
			title: `Article ${i}`,
			summary: `<p>Summary paragraph for article number ${i}.</p>`,
			pubname: i % 2 === 0 ? 'Keep Pub' : 'Drop Pub'
		})
	);
	const manyResponse = makeResponse(many);

	test.beforeEach(async ({ page }) => {
		await page.route('**/api/articles*', (route) => route.fulfill({ json: manyResponse }));
		await loginByStorage(page);
		await page.goto('/');
	});

	// Offset of the anchor card's top from the scroll container's top, in px.
	const anchorOffset = (page: Page) =>
		page.locator('#pagecontent').evaluate((parent) => {
			const el = document.getElementById('card-10');
			return el ? el.getBoundingClientRect().top - parent.getBoundingClientRect().top : null;
		});

	test('unchecking a publication keeps the top-of-viewport article anchored', async ({ page }) => {
		await expect(page.locator('.card')).toHaveCount(40);

		// Scroll a 'Keep Pub' card (id 10, so it survives) flush to the viewport top.
		await page.locator('#card-10').evaluate((el) => el.scrollIntoView(true));
		expect(await page.locator('#pagecontent').evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
		expect(Math.abs((await anchorOffset(page)) ?? Infinity)).toBeLessThan(3);

		// Drop the other publication. With index-based anchoring the view jumped to
		// whatever article landed at the old top index; the article's own id must
		// keep it pinned to the top instead.
		await page.locator('label.option', { hasText: 'Drop Pub' }).getByRole('checkbox').uncheck();
		await expect(page.locator('.card')).toHaveCount(20);

		await expect(page.locator('#card-10')).toBeVisible();
		expect(Math.abs((await anchorOffset(page)) ?? Infinity)).toBeLessThan(3);
	});
});
