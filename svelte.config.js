import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// SPA mode: only /login and /about are prerendered; nginx serves
		// index.html as the fallback for everything else.
		// precompress emits .gz (and .br) next to each asset for gzip_static.
		adapter: adapter({ fallback: 'index.html', precompress: true }),
		paths: {
			// Set when the app is served from a subpath. Use the per-target npm
			// scripts (`npm run build` / `npm run build:tiny`) rather than
			// exporting BASE_PATH in the shell: the build script pins BASE_PATH
			// so a stray exported value can't leak into an unrelated build
			// (e.g. the Playwright webServer build). Note: only the process
			// environment is read here — a BASE_PATH line in .env is ignored.
			base: process.env.BASE_PATH || ''
		},
		alias: {
			// $db: './src/db',
			// $livedb: './src/livedb'
			$comp: './src/Components'
		}
	}
};

export default config;
