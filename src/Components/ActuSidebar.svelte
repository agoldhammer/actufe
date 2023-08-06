<script lang="ts">
	export let pubnames: Set<string>;
</script>

<div class="sidebar">
	{#each pubnames as pubname, i}
		<div class="option">
			<span>{pubname}</span>
		</div>
	{/each}
</div>

<style>
	.sidebar {
		display: flex;
		flex-direction: column;
		justify-content: space-around;
		font-size: xx-small;
		overflow: scroll;
		color: blue;
	}
	.option {
		margin: 2px;
	}

	.option span:hover {
		color: magenta;
	}
</style>
