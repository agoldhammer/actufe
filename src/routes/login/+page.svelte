<script lang="ts">
	import { goto } from '$app/navigation';
	let value = '';
	function handleEnter(event: any) {
		if (event.key === 'Enter') {
			console.log('Entered');
			handleReady();
		}
	}
	function handleReady() {
		console.log('hdl', value);
		if (value === 'shazam') {
			localStorage.setItem('auth', 'ok');
			console.log('bingo');
			goto('/');
		}
	}
</script>

<div class="login">
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
