<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	// The page is prerendered, so it paints before the handlers below are
	// attached; the marker lets tests (and anything else) wait for hydration.
	let hydrated = false;
	onMount(() => (hydrated = true));
	let value = '';
	function handleEnter(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			// console.log('Entered');
			handleReady();
		}
	}
	// This is a "keep out" sign, NOT authentication, and it cannot be made into
	// authentication from here: the page is prerendered, so the word below ships
	// in the JS bundle for anyone to read, and the flag it sets is one devtools
	// line away regardless. /api/articles serves the same data without ever
	// consulting it (deploy/nginx.conf rate-limits that endpoint rather than
	// guarding it, since the data is aggregated public news). If this ever needs
	// to be a real boundary, it has to move to nginx — auth_basic on both the
	// site and = /api/articles, or a signed cookie checked there.
	function handleReady() {
		// console.log('hdl', value);
		if (value === 'shazam') {
			localStorage.setItem('auth', 'ok');
			// console.log('bingo');
			goto(`${base}/`);
		}
	}
</script>

<div class="login" data-hydrated={hydrated}>
	<h1 class="banner">Sorry, but this is not a public website</h1>
	<h2 class="deck">For development use only</h2>
	<input
		type="text"
		class="magic"
		on:keypress={handleEnter}
		bind:value
		placeholder="type magic word here"
	/>
	<button class="ready" on:click={handleReady}>Enter</button>
</div>

<style>
	.login {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		color: blue;
		background-color: lightgrey;
		margin: 1rem;
	}

	.banner,
	.deck {
		text-align: center;
	}

	.magic {
		width: 60%;
		margin: 20px;
		align-self: center;
	}

	.ready {
		align-self: center;
		margin: 5px;
	}
</style>
