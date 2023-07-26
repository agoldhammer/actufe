import { data } from './data.js';
import type { PageServerLoad } from './$types.js';

// const articles = JSON.parse(jdata);

export function load() {
	return data;
}
