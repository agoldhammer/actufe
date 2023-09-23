//See https://alphonso-javier.medium.com/svelte-simple-login-with-local-storage-and-stores-723759da36b3
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const persistedUser = browser && localStorage.getItem('user');
export const user = writable(persistedUser ? JSON.parse(persistedUser) : '');

if (browser) {
	user.subscribe((u) => (localStorage.user = u));
}
