import { error } from '@sveltejs/kit'; //eslint-disable-line

// TODO: See https://kit.svelte.dev/docs/routing

/** @type {import('./$types').RequestHandler} */
// tslint-disable-next-line
export function GET({ url }) { //eslint-disable-line
    
    console.log(url)
    return new Response("hi");
}