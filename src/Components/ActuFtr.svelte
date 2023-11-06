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
		<span>Start: {appdata.timespan.start}</span>
		<span>End:&nbsp;&nbsp;&nbsp;{appdata.timespan.end}</span>
	</div>
	<div class="version">
		<span>Ver. 0.2 beta</span>
	</div>
</div>

<style>
	.ftr {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		font-size: xx-small;
		gap: 20px;
	}

	.ndocs {
		display: flex;
		flex-direction: column;
	}
	.timespan,
	.version {
		/* font-size: xx-small; */
		display: flex;
		flex-direction: column;
		color: lightseagreen;
	}

	.timespan {
		color: red;
	}
</style>
