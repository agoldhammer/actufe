<script lang="ts">
	import { cats_store, selected_cats_store } from '$lib/catstore';
	// selected_cats_store.subscribe((sel_cats) => console.log('selcats', sel_cats));

	const cats = $cats_store;
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
		// selected_cats_store.subscribe((sel_cats) => console.log('selcats', sel_cats));
		// console.log('hdl click', $selected_cats_store);
	};
</script>

<div class="cats">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	{#key $cats_store}
		{#each cats as cat}
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
	}
</style>
