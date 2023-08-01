// import { data } from './data.js';
// import type { PageServerLoad } from './$types.js';
// import { articles } from '../db/articles'

export const ssr = false;

export const load = async function () {
	// const data = await articles.find( {}, {limit: 25, projection: {_id: 0, title: 1, summary: 1, pubdate: 1}}).toArray();
	const response = await fetch('/.netlify/functions/conn')
          .then(response => response.json()
          )
	// console.dir(response)
	// const retval = {arts: data, count: data.length}
	return {arts: response.articles,
			count: response.count}
}
