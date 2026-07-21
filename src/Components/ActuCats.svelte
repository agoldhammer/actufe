<script lang="ts">
	import { cats_store, selected_cats_store, cat_count_store } from '$lib/actustores';
	const toggleCat = (cat: string) => {
		if ($selected_cats_store.includes(cat)) {
			selected_cats_store.update((cats) => cats.filter((c) => c !== cat));
		} else {
			// TODO: single cat sel for now
			selected_cats_store.set([cat]);
		}
		const pagecontent = document.getElementById('pagecontent');
		if (pagecontent) pagecontent.scrollTop = 0;
	};
</script>

<div class="cats">
	{#each $cats_store as cat}
		<button
			type="button"
			class="cat"
			class:selected={$selected_cats_store.includes(cat)}
			on:click|preventDefault={() => toggleCat(cat)}
		>
			{cat}
			<span class="cat-count">({$cat_count_store.getCount(cat)})</span>
			{#if $selected_cats_store.includes(cat)}
				<span class="cat-x" aria-hidden="true">&#10005;</span>
			{/if}
		</button>
	{/each}
</div>

<style>
	.cats {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 6px;
		padding: 5px 6px;
	}

	.cat {
		width: fit-content;
		white-space: nowrap;
		border: 1px solid var(--accent);
		border-radius: 999px;
		background-color: #fff;
		color: var(--accent);
		font-size: 0.8rem;
		padding: 2px 10px;
		cursor: pointer;
	}

	.cat:hover {
		background-color: var(--accent-soft);
	}

	.cat.selected {
		background-color: var(--accent);
		color: #fff;
	}

	.cat.selected:hover {
		background-color: var(--accent-dark);
	}

	.cat-count {
		font-size: 0.7rem;
	}

	.cat-x {
		font-size: 0.7rem;
		padding-left: 2px;
	}
</style>
