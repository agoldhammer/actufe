export const ssr = false;
import { redirect } from '@sveltejs/kit';
// import { user } from '../routes/store';

import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const persistedUser = browser && localStorage.getItem('user');
const user = writable(persistedUser ? JSON.parse(persistedUser) : '');

if (browser) {
	console.log('user is:', user);
	user.subscribe((u) => (localStorage.user = u));
}

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
	let credentials = false;
	user.subscribe((u) => (credentials = u));
	console.log('load credentials', credentials);
	if (!credentials) {
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

	return {
		arts: response.articles,
		count: response.count,
		timeframe: timeframe,
		timespan: response.timespan,
		pubnames: pubnames,
		ndocs: response.ndocs,
		cats: catnames
		// user: user
	};
};
