<script lang="ts">
	import ActuCtr from '../Components/ActuCtr.svelte';
	export let data;
	// export const user = data.user;
</script>

<svelte:head>
	<title>Euronews</title>
	<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
	<link rel="manifest" href="/site.webmanifest" />
</svelte:head>

<ActuCtr appdata={data} />
