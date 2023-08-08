export const ssr = false;
import { redirect } from '@sveltejs/kit';
// import { user } from '../routes/store';


export interface Article {
		id: string;
		title: string;
		summary: string;
		pubdate: string;
		pubname: string;
		link: string;
		hash: string;
	}



export const load = async function ({fetch, url}) {
	let user_id ='';
	// user.subscribe((u) => (user_id = u));
	// console.log("load", user_id)
	// if (user_id === '') {
	// 	throw redirect(307, "login")
	// }
	const timeframe = url.searchParams.get('timeframe') || '0'
	console.log('load: timeframe', timeframe)
	let response;
	try{
		response = await fetch('/.netlify/functions/conn?timeframe=' + timeframe)
          .then(response => response.json()
          )} catch (e) {
				console.log("load error:", e);
		  } 
	const pubnameset: Set<string> = new Set();
	const articles: Article[] = response.articles
	articles.forEach((article) => pubnameset.add(article.pubname));
	const pubnames: Array<string> = Array.from(pubnameset).sort()

	return {arts: response.articles,
			count: response.count,
			timeframe: timeframe,
			timespan: response.timespan,
			pubnames: pubnames,
			ndocs: response.ndocs
		}
}
