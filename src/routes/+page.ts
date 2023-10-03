export const ssr = false;
import { redirect } from '@sveltejs/kit';
import { Counter } from '$lib/counter';
import {
	cats_store,
	selected_cats_store,
	cat_count_store,
	time_window_store,
	selected_pubs_store
} from '$lib/actustores';
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
	const time_window = url.searchParams.get('timewindow') || '3';
	time_window_store.set(parseInt(time_window));
	// console.log('load: timeframe', timeframe);
	let response;
	try {
		// console.log('loader', timeframe, time_window);
		// time_window_store.subscribe((tw) => console.log('loader tw', tw));
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
		arts: response.articles,
		count: response.count,
		timeframe: timeframe,
		timespan: response.timespan,
		pubnames: pubnames,
		ndocs: response.ndocs
	};
};
