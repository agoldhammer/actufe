import { writable } from 'svelte/store';

const catlist: string[] = [];
const selected_cats: string[] = [];
export const cats_store = writable<string[]>(catlist);
export const selected_cats_store = writable<string[]>(selected_cats);
