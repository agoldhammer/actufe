<script lang="ts">
	import { selected_pubs_store } from '$lib/actustores';
	export let pubnames: string[];
	// derived, so unchecking individual pubs can't leave it stale
	$: all = pubnames.length > 0 && $selected_pubs_store.length === pubnames.length;
	function handleAllNone(event: Event) {
		selected_pubs_store.set((event.currentTarget as HTMLInputElement).checked ? pubnames : []);
	}
	export let collapse_summary: boolean;
</script>

<div class="sidebar">
	<label class="option">
		All/None
		<input type="checkbox" checked={all} on:change={handleAllNone} />
	</label>
	<hr />
	{#each pubnames as pubname}
		<label class="option">
			{pubname}
			<input type="checkbox" bind:group={$selected_pubs_store} value={pubname} />
		</label>
	{/each}
	<hr />
	<label class="option">
		No summary
		<input type="checkbox" bind:checked={collapse_summary} />
	</label>
</div>

<style>
	.sidebar {
		display: flex;
		flex-direction: column;
		/* fill the aside and act as the scroll viewport; min-height:0 lets the
		   flex item shrink below its content height so overflow-y engages
		   instead of the list spilling out and being clipped by the aside */
		flex: 1;
		min-height: 0;
		/* `safe` keeps the list vertically centered when it fits, but falls
		   back to top-aligned + scrollable (rather than clipping the top row,
		   e.g. All/None) when the viewport is too short to show every pub */
		justify-content: safe center;
		row-gap: 5px;
		font-size: 0.75rem;
		overflow-y: auto;
		color: var(--text);
	}
	.option {
		display: flex;
		flex-direction: row;
		width: inherit;
		justify-content: space-between;
		margin: 2px;
	}

	.option:hover {
		color: var(--accent);
	}

	hr {
		border: solid var(--border) 1px;
		width: 90%;
		margin: 4px;
	}
</style>
