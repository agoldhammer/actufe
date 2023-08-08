<script lang="ts">
	export let pubnames: string[];
	export let selected_pubnames: string[];
	let all = true;
	function handleAllNone() {
		console.log('hdl entr', all);
		all = !all;
		selected_pubnames = all ? pubnames : [];
		console.log('hdl leave', all);
	}
</script>

<div class="sidebar">
	<label class="option">
		All/None
		<input type="checkbox" bind:checked={all} on:click={handleAllNone} />
	</label>
	<hr />
	{#each pubnames as pubname, i}
		<label class="option">
			{pubname}
			<input type="checkbox" bind:group={selected_pubnames} value={pubname} />
		</label>
	{/each}
</div>

<style>
	.sidebar {
		display: flex;
		flex-direction: column;
		justify-content: center;
		row-gap: 5px;
		font-size: xx-small;
		overflow-y: scroll;
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
