<script lang="ts">
	export let appdata;
	const { count, ndocs, timespan } = appdata;
</script>

<div class="ftr">
	<div class="ndocs">
		Total no. of docs {ndocs}
		<span>Displaying {count}</span>
	</div>
	<div class="timespan">
		<span>{timespan.start}</span>
		<span>{timespan.end}</span>
	</div>
</div>

<style>
	.ftr {
		display: flex;
		flex-direction: row;
		font-size: xx-small;
		gap: 20px;
	}

	.ndocs {
		display: flex;
		flex-direction: column;
	}
	.timespan {
		/* font-size: xx-small; */
		display: flex;
		flex-direction: column;
		color: lightseagreen;
	}
</style>
