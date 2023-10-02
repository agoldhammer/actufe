import { writable } from 'svelte/store';

// category stores
const catlist: string[] = [];
const selected_cats: string[] = [];
export const cats_store = writable<string[]>(catlist);
export const selected_cats_store = writable<string[]>(selected_cats);

// selected pubs store
export const selected_pubs_store = writable<string[]>([]);

// timewindow store: default = 3 hours
export const time_window_store = writable<number>(3);
