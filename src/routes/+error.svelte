<!--
	What a failed load or navigation looks like. Without this SvelteKit falls back
	to its own bare error page; with `ssr = false` and a root layout that is only
	`<slot />`, that is the whole of what the user sees, so it may as well be the
	same panel the rest of the app uses when it can't reach the backend.

	Reload rather than "try again": a load that threw is not retried by re-rendering,
	and the failures that land here (a pruned chunk after a redeploy, a shell that
	arrived without its modules) are the ones a fresh document actually fixes.
-->
<script lang="ts">
	import { page } from '$app/stores';
	import ActuStatus from '../Components/ActuStatus.svelte';

	$: message = $page.error?.message ?? `Error ${$page.status}`;
</script>

<svelte:head>
	<title>Euronews — error</title>
</svelte:head>

<ActuStatus kind="error" {message} onRetry={() => location.reload()} />
