import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	return {
		plugins: [sveltekit()],
		server: {
			// Bind all interfaces so the server is reachable from the Windows host under WSL.
			host: true,
			// In production nginx proxies /api/articles to actuproxy (see deploy/nginx.conf).
			// Exact match (query string aside), mirroring nginx's `location =`:
			// /api/articles/anything is NOT proxied there, so don't proxy it here.
			proxy: {
				'^/api/articles($|\\?)': {
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
