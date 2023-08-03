export const ssr = false;

export const load = async function ({fetch, params, url}) {
	console.log("load:", params)
	console.log("load: url.searchParams", url.searchParams.get('time') || '0')
	const response = await fetch('/.netlify/functions/conn?timeago=3')
          .then(response => response.json()
          )
	return {arts: response.articles,
			count: response.count}
}
