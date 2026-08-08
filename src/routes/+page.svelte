<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import ActuCtr from '../Components/ActuCtr.svelte';
	import ActuStatus from '../Components/ActuStatus.svelte';
	export let data;

	onMount(() => {
		if (data.requiresLogin) {
			// Replace the protected URL so Back cannot restore the incomplete
			// first-load navigation that sent the user here.
			goto(`${base}/login`, { replaceState: true });
		}
	});
</script>

<svelte:head>
	<title>Euronews</title>
	<link rel="apple-touch-icon" sizes="180x180" href="{base}/apple-touch-icon.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="{base}/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="{base}/favicon-16x16.png" />
	<link rel="manifest" href="{base}/site.webmanifest" />
</svelte:head>

{#if data.requiresLogin || !data.appdata}
	<main class="redirecting" aria-live="polite">Checking access...</main>
{:else}
	<!-- The articles are still on the wire at this point: load() hands over an
	     unresolved promise so that this page paints, and the client router
	     starts, without waiting for the network. -->
	{#await data.appdata}
		<ActuStatus kind="loading" />
	{:then appdata}
		<ActuCtr {appdata} />
	{:catch err}
		<ActuStatus kind="error" message={err.message} onRetry={() => invalidateAll()} />
	{/await}
{/if}

<style>
	.redirecting {
		padding: 1rem;
		font-family: Verdana, Geneva, Tahoma, sans-serif;
	}
</style>
