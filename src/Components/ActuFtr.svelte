<script lang="ts">
	import type { Appdata } from './ActuCtr.svelte';
	export let appdata: Appdata;
</script>

<div class="ftr">
	<div class="ndocs">
		Total no. of docs {appdata.ndocs}
		<span>Displaying {appdata.count}</span>
	</div>
	<div class="timespan">
		<span>{appdata.timespan.start}</span>
		<span>{appdata.timespan.end}</span>
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
