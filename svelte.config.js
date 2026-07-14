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
		alias: {
			// $db: './src/db',
			// $livedb: './src/livedb'
			$comp: './src/Components',
		}
	}
};

export default config;
