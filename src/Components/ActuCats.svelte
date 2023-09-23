<script lang="ts">
	export let cats: string[];
</script>

<div class="cats">
	{#each cats as cat}
		<span class="cat">{cat}</span>
		<!-- <input type="checkbox" /> -->
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
		padding: 2px;
	}
</style>
