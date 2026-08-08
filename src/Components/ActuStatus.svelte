<!--
	What the page shows while the articles are in flight, or when they failed to
	arrive. It exists so the app never presents an unexplained blank screen: with
	`ssr = false` there is no server-rendered markup to fall back on, so if this
	component isn't on screen, nothing is.
-->
<script lang="ts">
	export let kind: 'loading' | 'error' = 'loading';
	export let message = '';
	export let onRetry: (() => void) | null = null;
</script>

<div class="frame">
	<div class="panel" class:failed={kind === 'error'}>
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
		/* Hold it back briefly: a fast request should not make a spinner flash.
		   Anything slower than this is worth acknowledging on screen. */
		opacity: 0;
		animation: appear 0s linear 500ms forwards;
	}

	/* A failure is never transient noise — show it at once. */
	.panel.failed {
		animation-delay: 0s;
	}

	@keyframes appear {
		to {
			opacity: 1;
		}
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
		.panel {
			animation-duration: 0s;
		}
	}
</style>
