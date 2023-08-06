export const ssr = false;

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
	// console.log("load:", params)
	// console.log("load: url.searchParams", url.searchParams.get('timeframe') || '0')
	const timeframe = url.searchParams.get('timeframe') || '0'
	console.log('load: timeframe', timeframe)
	const response = await fetch('/.netlify/functions/conn?timeframe=' + timeframe)
          .then(response => response.json()
          )
	const pubnameset: Set<string> = new Set();
	const articles: Article[] = response.articles
	articles.forEach((article) => pubnameset.add(article.pubname));
	const pubnames: Array<string> = Array.from(pubnameset).sort()

	return {arts: response.articles,
			count: response.count,
			timeframe: timeframe,
			timespan: response.timespan,
			pubnames: pubnames}
}
