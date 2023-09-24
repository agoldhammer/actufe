export const ssr = false;
import { redirect } from '@sveltejs/kit';
import { cats_store } from '$lib/catstore.js';

export interface Article {
	id: string;
	title: string;
	summary: string;
	pubdate: string;
	pubname: string;
	link: string;
	hash: string;
	cat: string;
}

export const load = async function ({ fetch, url }) {
	const authed = localStorage.getItem('auth');
	// console.log('authed');
	if (authed !== 'ok') {
		console.log('not authenticated!');
		throw redirect(307, 'login');
	}
	const timeframe = url.searchParams.get('timeframe') || '0';
	// console.log('load: timeframe', timeframe);
	let response;
	try {
		response = await fetch('/.netlify/functions/connProxy?timeframe=' + timeframe).then(
			(response) => response.json()
		);
	} catch (e) {
		console.log('load error:', e);
	}
	const pubnameset: Set<string> = new Set();
	const catset: Set<string> = new Set();
	if (response.articles === undefined) {
		throw new Error('articles missing from response; check actuproxy');
	}
	const articles: Article[] = response.articles;
	articles.forEach((article) => {
		pubnameset.add(article.pubname);
		catset.add(article.cat);
	});
	const pubnames: Array<string> = Array.from(pubnameset).sort();
	const catnames: Array<string> = Array.from(catset).sort();
	cats_store.set(catnames);

	return {
		arts: response.articles,
		count: response.count,
		timeframe: timeframe,
		timespan: response.timespan,
		pubnames: pubnames,
		ndocs: response.ndocs
	};
};
