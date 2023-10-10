<script lang="ts">
	import HelpCard from './HelpCard.svelte';
	import { helpitems } from '$lib/topics';
	import { writable } from 'svelte/store';
	import { fade } from 'svelte/transition';
	const active_id_store = writable('');

	function hdlClick(e: MouseEvent) {
		// console.log("clicked", e.target);
		const target = e.target as HTMLButtonElement;
		const button_id = target.id || '';

		// console.log("setting active to id", button_id);
		const active_id = $active_id_store;
		if (active_id === button_id) {
			active_id_store.set('');
		} else {
			active_id_store.set(button_id);
		}
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="help-ctr" on:click={hdlClick}>
	<h1>Help Topics</h1>
	{#each helpitems as helpitem}
		<HelpCard card_id={helpitem.id} active_id={$active_id_store}>
			<h2 slot="topic">{helpitem.topic}</h2>
			<p slot="description" in:fade={{ duration: 300 }}>
				{helpitem.description}
			</p>
		</HelpCard>
	{/each}
</div>

<style>
	h1 {
		text-align: center;
		color: white;
		height: 2em;
		padding-top: 10px;
		border-radius: 8px;
		background-image: linear-gradient(90deg, rgb(114, 43, 15), 70%, blue);
	}
	.help-ctr {
		height: 100vh;
		font-family: Verdana, Geneva, Tahoma, sans-serif;
		border-radius: 8px;
		overflow-y: scroll;
	}
</style>
