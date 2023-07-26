// import { data } from './data.js';
import type { PageServerLoad } from './$types.js';
import { articles } from '../db/articles'

// const articles = JSON.parse(jdata);

// export function load() {
// 	get_arts()
// 	return data;
// }

// async function get_arts() {
// 	const data = await _newload()
// 	console.log("getarts", data)
// }

export const load: PageServerLoad = async function () {
	const data = await articles.find( {}, {limit: 25, projection: {_id: 0, title: 1, summary: 1, pubdate: 1}}).toArray();
	const retval = {arts: data, count: data.length}
	return retval
}
