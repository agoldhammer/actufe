import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	return {
		plugins: [sveltekit()],
		server: {
			// In production nginx proxies /api/articles to actuproxy (see deploy/nginx.conf).
			proxy: {
				'/api/articles': {
					target: env.PROXY_URI ?? 'http://127.0.0.1:8000',
					changeOrigin: true,
					// actuproxy serves at its root: /api/articles?q -> /?q
					rewrite: (path) => path.replace(/^\/api\/articles/, '/')
				}
			}
		},
		test: {
			include: ['src/**/*.{test,spec}.{js,ts}']
		}
	};
});
