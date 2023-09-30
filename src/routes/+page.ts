export const ssr = false;
import { redirect } from '@sveltejs/kit';
import { cats_store, selected_cats_store } from '$lib/actustores';
// import { time_window_store } from '$lib/actustores';

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
	const time_window = url.searchParams.get('timewindow') ?? '3';
	// console.log('load: timeframe', timeframe);
	let response;
	try {
		// console.log('loader', timeframe, time_window);
		const url = `/.netlify/functions/connProxy?timeframe=${timeframe}&timewindow=${time_window}`;
		response = await fetch(url).then((response) => response.json());
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
	// console.log('catset', catset);

	const pubnames: Array<string> = Array.from(pubnameset).sort();
	const catnames: Array<string> = Array.from(catset).sort();
	// reset the category stores
	// console.log('resetting stores');
	cats_store.set(catnames);
	selected_cats_store.set([]);
	// selected_cats_store.subscribe((selcats) => console.log('resetting selcats', selcats));

	return {
		arts: response.articles,
		count: response.count,
		timeframe: timeframe,
		timespan: response.timespan,
		pubnames: pubnames,
		ndocs: response.ndocs
	};
};
