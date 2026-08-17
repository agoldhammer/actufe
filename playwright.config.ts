import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
		// The production build registers a service worker that precaches the shell
		// and the whole module graph, which would answer most of what these tests
		// go out of their way to control: page.route() does not intercept requests
		// a service worker makes, and a precached shell never asks the network at
		// all. Blocked by default so every test below faces the real server; the
		// service-worker suite opts back in with test.use().
		serviceWorkers: 'block'
	},
	// Run on both engines. Blink and WebKit differ in Svelte-5 reactive-statement
	// ordering relative to DOM patches, which the scroll-restoration tests depend
	// on — a WebKit-only regression once slipped through a Chromium-only run.
	// WebKit needs a one-time `npx playwright install webkit`.
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'webkit', use: { ...devices['Desktop Safari'] } }
	]
});
