<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import ActuCtr from '../Components/ActuCtr.svelte';
	import ActuStatus from '../Components/ActuStatus.svelte';
	export let data;

	onMount(() => {
		if (data.requiresLogin) {
			// A full document navigation, not goto(): onMount runs inside SvelteKit's
			// initial navigation, before start() has called _start_router(), so a
			// client-side navigation here re-enters the navigation that is still
			// mounting us and can simply be dropped — leaving the user parked on
			// "Checking access..." with a router that never started. location.replace
			// cannot be dropped, /login is prerendered so it costs one static request,
			// and replacing keeps Back from restoring the incomplete first load.
			location.replace(`${base}/login`);
		}
	});

	const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));
</script>

<svelte:head>
	<title>Euronews</title>
	<link rel="apple-touch-icon" sizes="180x180" href="{base}/apple-touch-icon.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="{base}/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="{base}/favicon-16x16.png" />
	<link rel="manifest" href="{base}/site.webmanifest" />
</svelte:head>

<!-- A throw while this tree is mounting is not caught here. It rejects the
     promise SvelteKit's start() is awaiting, so _start_router() is never reached
     and the page is left blank *and* inert — and +error.svelte cannot help,
     because the failure is in rendering rather than in load. What reports it is
     the unhandledrejection handler in the watchdog in app.html: the shell's
     bootstrap never returns kit.start()'s promise, so the rejection reaches the
     window. (A <svelte:boundary> would be the tidier answer, but this project's
     ESLint 8 / eslint-plugin-svelte 2 parser cannot parse one.) -->
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
		<ActuStatus kind="error" message={errorText(err)} onRetry={() => invalidateAll()} />
	{/await}
{/if}

<style>
	.redirecting {
		padding: 1rem;
		font-family: Verdana, Geneva, Tahoma, sans-serif;
	}
</style>
