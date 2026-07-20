export const ssr = false;
export const prerender = false;
import { Counter } from '$lib/counter';
import {
	cats_store,
	selected_cats_store,
	cat_count_store,
	time_window_store,
	selected_pubs_store
} from '$lib/actustores';

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
	if (authed !== 'ok') {
		// A redirect thrown from a client-only load can leave some mobile browsers
		// with an unfinished initial navigation. Let the page perform a replacement
		// navigation after it has mounted instead.
		return { requiresLogin: true };
	}
	const timeframe = url.searchParams.get('timeframe') || '0';
	const time_window = url.searchParams.get('timewindow') || '3';
	const text_query = url.searchParams.get('txtquery');
	time_window_store.set(parseInt(time_window));
	// console.log('load: timeframe', timeframe);
	let response;
	let uri;
	try {
		const params = new URLSearchParams({ timeframe, timewindow: time_window });
		if (text_query !== null && text_query !== undefined && text_query.length > 0) {
			params.set('txtquery', text_query);
		}
		uri = `/api/articles?${params}`;
		response = await fetch(uri).then((response) => response.json());
	} catch (e) {
		console.log('load error:', e);
		throw new Error(`failed to fetch articles from ${uri}: ${e}`);
	}
	const pubnameset: Set<string> = new Set();
	const catset: Set<string> = new Set();
	if (response.articles === undefined) {
		throw new Error('articles missing from response; check actuproxy');
	}
	const articles: Article[] = response.articles;
	const cat_counter = new Counter();
	articles.forEach((article) => {
		pubnameset.add(article.pubname);
		catset.add(article.cat);
		cat_counter.inc(article.cat);
	});

	const pubnames: Array<string> = Array.from(pubnameset).sort();
	const catnames: Array<string> = Array.from(catset).sort();
	// reset the category stores
	cats_store.set(catnames);
	selected_cats_store.set([]);
	cat_count_store.set(cat_counter);
	selected_pubs_store.set(pubnames);

	return {
		requiresLogin: false,
		arts: response.articles,
		count: response.count,
		timeframe: timeframe,
		timespan: response.timespan,
		pubnames: pubnames,
		ndocs: response.ndocs
	};
};
