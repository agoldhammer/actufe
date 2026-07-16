import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const articles = [
	{
		id: '1',
		title: 'Élections: le grand débat',
		summary: '<p>Résumé du débat électoral.</p>',
		pubdate: '2026-07-16 08:00',
		pubname: 'Le Monde',
		link: 'https://example.com/debat',
		hash: 'h1',
		cat: 'politics'
	},
	{
		id: '2',
		title: 'Victoire au Tour de France',
		summary: '<p>Résumé de la victoire.</p>',
		pubdate: '2026-07-16 09:00',
		pubname: 'Libération',
		link: 'https://example.com/tour',
		hash: 'h2',
		cat: 'sports'
	}
];

const apiResponse = {
	articles,
	count: '2',
	timespan: { start: '2026-07-16 07:00', end: '2026-07-16 10:00' },
	ndocs: '1234'
};

// The preview server has no /api proxy (nginx provides it in production),
// so the articles endpoint is always mocked.
async function mockArticles(page: Page) {
	await page.route('**/api/articles*', (route) => route.fulfill({ json: apiResponse }));
}

async function loginByStorage(page: Page) {
	await page.addInitScript(() => localStorage.setItem('auth', 'ok'));
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
		await page.goto('/login');
		await page.getByPlaceholder('type magic word here').fill('abracadabra');
		await page.getByRole('button', { name: 'Enter' }).click();
		await expect(page).toHaveURL(/login/);
	});

	test('the magic word logs in and shows the articles', async ({ page }) => {
		await mockArticles(page);
		await page.goto('/login');
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

	test('the No summary box collapses article summaries', async ({ page }) => {
		await expect(page.getByText('Résumé du débat électoral.')).toBeVisible();
		await page.locator('label.option', { hasText: 'No summary' }).getByRole('checkbox').check();
		await expect(page.getByText('Résumé du débat électoral.')).toHaveCount(0);
		await expect(page.getByText('Élections: le grand débat')).toBeVisible();
	});
});
