<!--
	What the page shows while the articles are in flight, or when they failed to
	arrive. It exists so the app never presents an unexplained blank screen: with
	`ssr = false` there is no server-rendered markup to fall back on, so if this
	component isn't on screen, nothing is.
-->
<script lang="ts">
	import { onMount } from 'svelte';

	export let kind: 'loading' | 'error' = 'loading';
	export let message = '';
	export let onRetry: (() => void) | null = null;

	// Held back so a fast request never flashes a spinner. A failure is not
	// transient noise, so it appears at once.
	const APPEAR_AFTER_MS = 500;

	// The boot skeleton in app.html runs the same timer before the app exists.
	// If its spinner was already on screen when we took over, show ours
	// immediately: restarting the clock here would blink the spinner off in the
	// middle of a single continuous wait.
	const carriedOver =
		typeof window !== 'undefined' &&
		(window as unknown as { __bootSpinnerShown?: boolean }).__bootSpinnerShown === true;

	let visible = kind === 'error' || carriedOver;

	onMount(() => {
		if (visible) return;
		const timer = setTimeout(() => (visible = true), APPEAR_AFTER_MS);
		return () => clearTimeout(timer);
	});
</script>

<div class="frame">
	<div class="panel" class:visible>
		{#if kind === 'loading'}
			<div class="spinner" aria-hidden="true"></div>
			<p class="headline" aria-live="polite">Loading articles…</p>
		{:else}
			<p class="headline">Could not load the articles.</p>
			{#if message}<p class="detail">{message}</p>{/if}
			{#if onRetry}
				<button type="button" on:click={onRetry}>Try again</button>
			{/if}
		{/if}
	</div>
</div>

<style>
	/* Matches the .pagewrapper frame in ActuCtr so the app doesn't visibly
	   change shape when the articles land. */
	.frame {
		font-family: Verdana, Geneva, Tahoma, sans-serif;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto;
		padding: 2px;
		border: 1px solid #c8c3c5;
		border-radius: 10px;
		height: 98svh;
		max-width: 800px;
		background-color: rgba(208, 198, 203, 0.2);
		color: #333;
	}

	.panel {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		text-align: center;
		padding: 1rem;
		/* Timed in the script above, not here, so the delay can be skipped when
		   the boot skeleton has already been showing a spinner. */
		opacity: 0;
	}

	.panel.visible {
		opacity: 1;
	}

	.headline {
		margin: 0;
		font-size: 0.9rem;
		color: #6b6b6b;
	}

	.detail {
		margin: 0;
		max-width: 40ch;
		font-size: 0.75rem;
		color: #6b6b6b;
		overflow-wrap: break-word;
	}

	.spinner {
		width: 28px;
		height: 28px;
		border: 3px solid #c8c3c5;
		border-top-color: #9a031e;
		border-radius: 50%;
		animation: spin 0.9s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	button {
		border: none;
		border-radius: 8px;
		background-color: #9a031e;
		color: #fff;
		font-size: 0.8rem;
		padding: 6px 14px;
		cursor: pointer;
	}

	button:hover {
		background-color: #6e0215;
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation: none;
		}
	}
</style>
