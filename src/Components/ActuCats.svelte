<script lang="ts">
	import { cats_store, selected_cats_store } from '$lib/catstore';
	const hdlClick = (event: any) => {
		const cat = event.target.id;
		const selcats = $selected_cats_store;
		// console.log(selcats);
		if (selcats.includes(cat)) {
			// console.log('already in, so remove and chg color');
			event.target.style.color = 'white';
			const i = selcats.indexOf(cat);
			selcats.splice(i, 1);
			selected_cats_store.update((s) => selcats);
		} else {
			// add it in

			selected_cats_store.update((selcats) => [...selcats, cat]);
			// event.target.style.color = 'lightsalmon';
		}
	};
</script>

<div class="cats">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	{#key $cats_store}
		{#each $cats_store as cat}
			{#if $selected_cats_store.includes(cat)}
				<div id={cat} class="cat" style="color:lightsalmon" on:click|preventDefault={hdlClick}>
					{cat}
				</div>
			{:else}
				<div id={cat} class="cat" on:click|preventDefault={hdlClick}>{cat}</div>
			{/if}
			<!-- <input type="checkbox" /> -->
		{/each}
	{/key}
</div>

<style>
	.cats {
		display: flex;
		flex-direction: row;
		justify-content: left stretch;
		flex-wrap: wrap;
		gap: 10px;
		font-size: small;
	}

	.cat {
		width: fit-content;
		text-wrap: nowrap;
		margin: 2px;
		padding-left: 3px;
		cursor: zoom-in;
	}
</style>
