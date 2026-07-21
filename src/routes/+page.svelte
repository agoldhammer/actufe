<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import type { Appdata } from '../Components/ActuCtr.svelte';
	import ActuCtr from '../Components/ActuCtr.svelte';
	export let data;

	onMount(() => {
		if (data.requiresLogin) {
			// Replace the protected URL so Back cannot restore the incomplete
			// first-load navigation that sent the user here.
			goto(`${base}/login`, { replaceState: true });
		}
	});

	$: appdata = data as Appdata;
</script>

<svelte:head>
	<title>Euronews</title>
	<link rel="apple-touch-icon" sizes="180x180" href="{base}/apple-touch-icon.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="{base}/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="{base}/favicon-16x16.png" />
	<link rel="manifest" href="{base}/site.webmanifest" />
</svelte:head>

{#if data.requiresLogin}
	<main class="redirecting" aria-live="polite">Checking access...</main>
{:else}
	<ActuCtr {appdata} />
{/if}

<style>
	.redirecting {
		padding: 1rem;
		font-family: Verdana, Geneva, Tahoma, sans-serif;
	}
</style>
