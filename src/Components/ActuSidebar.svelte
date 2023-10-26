<script lang="ts">
	import { selected_pubs_store } from '$lib/actustores';
	export let pubnames: string[];
	let all = true; //display all pubnames
	function handleAllNone() {
		all = !all;
		selected_pubs_store.set(all ? pubnames : []);
	}
	export let collapse_summary: boolean;
</script>

<div class="sidebar">
	<label class="option">
		All/None
		<input type="checkbox" bind:checked={all} on:click={handleAllNone} />
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
		justify-content: center;
		row-gap: 5px;
		font-size: xx-small;
		overflow-y: auto;
		color: blue;
	}
	.option {
		display: flex;
		flex-direction: row;
		width: inherit;
		justify-content: space-between;
		margin: 2px;
	}

	.option:hover {
		color: magenta;
	}

	hr {
		border: solid lightblue 1px;
		width: 90%;
		margin: 4px;
	}
</style>
