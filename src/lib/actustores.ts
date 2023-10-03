import { writable } from 'svelte/store';
import { Counter } from '$lib/counter';

// category stores
const catlist: string[] = [];
const selected_cats: string[] = [];
export const cats_store = writable<string[]>(catlist);
export const selected_cats_store = writable<string[]>(selected_cats);
export const cat_count_store = writable<Counter>(new Counter());

// selected pubs store
export const selected_pubs_store = writable<string[]>([]);

// timewindow store: default = 3 hours
export const time_window_store = writable<number>(3);
