// Prerendered so the static build contains a real login.html and nginx can
// serve hard reloads of /login without an SPA-fallback allowlist entry.
export const prerender = true;

export const load = async function () {
	return {};
};
