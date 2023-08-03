export const ssr = false;

export const load = async function ({fetch, params, url}) {
	console.log("load:", params)
	console.log("load: url.searchParams", url.searchParams.get('timeframe') || '0')
	const timeframe = url.searchParams.get('timeframe') || '0'
	const response = await fetch('/.netlify/functions/conn?timeframe=' + timeframe)
          .then(response => response.json()
          )
	return {arts: response.articles,
			count: response.count,
		timeframe: timeframe}
}
