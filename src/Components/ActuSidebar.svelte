<script lang="ts">
	export let pubnames: string[];
	export let selected_pubnames: string[];
</script>

<div class="sidebar">
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
		justify-content: space-around;
		font-size: xx-small;
		overflow-y: scroll;
		color: blue;
	}
	.option {
		margin: 2px;
	}

	.option:hover {
		color: magenta;
	}
</style>
