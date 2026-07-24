import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	// Run on both engines. Blink and WebKit differ in Svelte-5 reactive-statement
	// ordering relative to DOM patches, which the scroll-restoration tests depend
	// on — a WebKit-only regression once slipped through a Chromium-only run.
	// WebKit needs a one-time `npx playwright install webkit`.
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'webkit', use: { ...devices['Desktop Safari'] } }
	]
});
