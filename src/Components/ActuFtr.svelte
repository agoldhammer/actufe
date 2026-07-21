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
		<span>Ver. 0.3</span>
	</div>
</div>

<style>
	.ftr {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		font-size: 0.75rem;
		gap: 20px;
	}

	.ndocs {
		display: flex;
		flex-direction: column;
	}
	.timespan,
	.version {
		display: flex;
		flex-direction: column;
		color: var(--text-muted);
	}
</style>
