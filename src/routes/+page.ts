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

// const user_status = true;
export const load = async function ({fetch, url}) {
	throw redirect(307, "login")
	// user.subscribe(u => console.log("subscribe", u))
	// if (user_status) {
	// 	throw redirect(307, "/login")
	// }
	// console.log("load:", params)
	// console.log("load: url.searchParams", url.searchParams.get('timeframe') || '0')
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
