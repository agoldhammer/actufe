import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// SPA mode: no prerendering, nginx serves index.html as fallback for all routes.
		adapter: adapter({ fallback: 'index.html' }),
		paths: {
			// Set when the app is served from a subpath, e.g. on tiny:
			//   BASE_PATH=/news npm run build
			base: process.env.BASE_PATH || ''
		},
		alias: {
			// $db: './src/db',
			// $livedb: './src/livedb'
			$comp: './src/Components',
		}
	}
};

export default config;
