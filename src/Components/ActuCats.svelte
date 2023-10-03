<script lang="ts">
	type MouseEvent = { currentTarget: HTMLDivElement };
	import { cats_store, selected_cats_store, cat_count_store } from '$lib/actustores';
	const hdlClick = (event: MouseEvent) => {
		const cat = event.currentTarget.id;
		const selcats = $selected_cats_store;
		// console.log(selcats);
		if (selcats.includes(cat)) {
			// console.log('already in, so remove and chg color');
			event.currentTarget.style.color = 'white';
			const i = selcats.indexOf(cat);
			selcats.splice(i, 1);
			selected_cats_store.update((s) => selcats);
		} else {
			// add it in
			// TODO: single cat sel for now
			selected_cats_store.update((selcats) => [cat]);
		}
		// @ts-ignore
		document.getElementById('pagecontent').scrollTop = 0;
	};
</script>

<div class="cats">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	{#each $cats_store as cat}
		{#if $selected_cats_store.includes(cat)}
			<div id={cat} class="cat" style="color:lightsalmon" on:click|preventDefault={hdlClick}>
				{cat}
				({$cat_count_store.getCount(cat)})
			</div>
		{:else}
			<div id={cat} class="cat" on:click|preventDefault={hdlClick}>
				{cat}
				<span class="cat-count">
					({$cat_count_store.getCount(cat)})
				</span>
			</div>
		{/if}
	{/each}
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

	.cat-count {
		font-size: xx-small;
	}
</style>
