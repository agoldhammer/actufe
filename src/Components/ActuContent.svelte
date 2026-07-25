<script lang="ts">
	import type { Article } from '$lib/types';
	import { selected_cats_store, selected_pubs_store } from '$lib/actustores';
	import { sanitizeSummary } from '$lib/sanitize';
	import { tick, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	export let articles: Article[];
	export let pubnames: string[];
	export let collapse_summary: boolean;

	type KeyedArticle = { article: Article; cardId: string };

	// Pair every article with the DOM id of its card up front, from its position
	// in the *unfiltered* list, so the id survives filtering (see the scroll
	// notes below). `hash` is the backend's own identifier; the index only
	// guarantees uniqueness, since a feed can legitimately deliver the same
	// article — same hash — twice in one window.
	$: keyedArticles = articles.map((article, i) => ({
		article,
		cardId: `card-${i}-${article.hash}`
	}));

	$: visibleArticles = keyedArticles.filter(
		({ article: a }) =>
			($selected_cats_store.length === 0 ||
				$selected_cats_store.includes(a.cat ?? 'uncategorized')) &&
			$selected_pubs_store.includes(a.pubname)
	);

	const resetFilters = () => {
		selected_cats_store.set([]);
		selected_pubs_store.set(pubnames);
		const params = new URLSearchParams($page.url.search);
		if (params.has('txtquery')) {
			params.delete('txtquery');
			goto(`${base}/?${params}`);
		}
	};

	// Preserve the reading position across re-renders (collapsing summaries or
	// dropping a publication): keep track of the article at the top of the
	// viewport, and after the list re-renders bring that same article back to the
	// top.
	//
	// The anchor is the card's own id (see keyedArticles above), never an index
	// into the rendered list: when a filter removes articles a given index points
	// at a different article after the update. With a stable id the anchor lands
	// on the same article, or — if that article was filtered out — is simply
	// absent and the scroll is left alone.
	//
	// The anchor is captured continuously by a scroll listener rather than being
	// measured inside the reactive statement below. Under Svelte 5 that reactive
	// statement runs *after* the {#each} DOM patch in WebKit but *before* it in
	// Blink, so measuring there read the wrong (already-collapsed) DOM in Safari
	// and left the wrong article on top. Reading a value captured during the
	// user's last scroll is immune to that ordering difference. (Held in an object
	// so scroll-time writes don't invalidate the component every frame.)
	const anchor = { id: '' };

	// The topmost (partially) visible card in the scroll container. Everything is
	// measured in viewport coordinates via getBoundingClientRect: #pagecontent
	// isn't a positioned element, so the cards' offsetParent is some ancestor and
	// offsetTop lives in a different coordinate space than scrollTop.
	function topVisibleCardId(parent: HTMLElement): string {
		const parentTop = parent.getBoundingClientRect().top;
		const cards = parent.getElementsByClassName('card');
		for (let i = 0; i < cards.length; i++) {
			const el = cards[i] as HTMLDivElement;
			// First card whose bottom edge is still below the container's top edge is
			// the topmost visible one. The 1px slop discounts a sub-pixel sliver of the
			// card above so the barely off-screen previous card doesn't win.
			if (el.getBoundingClientRect().bottom > parentTop + 1) return el.id;
		}
		return '';
	}

	function updateAnchor() {
		const parent = document.getElementById('pagecontent');
		if (parent) anchor.id = topVisibleCardId(parent);
	}

	onMount(() => {
		const parent = document.getElementById('pagecontent');
		updateAnchor();
		parent?.addEventListener('scroll', updateAnchor, { passive: true });
		return () => parent?.removeEventListener('scroll', updateAnchor);
	});

	let scrollKey = '';
	$: preserveScroll(collapse_summary, visibleArticles);

	async function preserveScroll(collapsed: boolean, arts: KeyedArticle[]) {
		// Re-run only when the rendered set actually changes; the reactive
		// statement also fires for unrelated store updates. Collapsing summaries
		// keeps the same ids but changes heights, so it is part of the key.
		const key = `${collapsed}|${arts.map((a) => a.cardId).join(',')}`;
		if (key === scrollKey) return;
		scrollKey = key;
		const target = anchor.id; // captured by the scroll listener, before this render
		await tick();
		const parent = document.getElementById('pagecontent');
		if (!target || !parent) return;
		const el = document.getElementById(target);
		// Missing: the anchored article was filtered out. Outside the container:
		// the id is not one of ours. Either way, leave the scroll alone rather
		// than yanking the view to an unrelated element.
		if (!el || !parent.contains(el)) return;
		// Bring the anchor card to the top by nudging only this container's
		// scrollTop. Not scrollIntoView(): that also scrolls ancestor scrollers and
		// the window and aligns inconsistently across browsers.
		const delta = el.getBoundingClientRect().top - parent.getBoundingClientRect().top;
		if (delta !== 0) parent.scrollTop += delta;
	}
</script>

{#if visibleArticles.length === 0}
	<div class="empty">
		<p>No articles match the current filters.</p>
		<button type="button" on:click={resetFilters}>Reset filters</button>
	</div>
{:else}
	{#each visibleArticles as { article, cardId } (cardId)}
		<div id={cardId} class="card">
			<div class="cardhdr" class:nosumm={collapse_summary}>
				<!-- <span class="pubdate">[{article.pubdate}: {article.pubname}-{article.hash}]</span> -->
				<div class="pubdate">[{article.pubdate}: {article.pubname}]</div>
				<div>
					<a class="title-link" href={article.link} target="_blank" rel="noreferrer noopener"
						>{article.title}</a
					>
					<a class="more-link" href={article.link} target="_blank" rel="noreferrer noopener"
						>&#8618; Continue reading ...</a
					>
				</div>
				{#if article.cat}
					<span class="category">Category: {article.cat}</span>
				{:else}
					<span class="category">No category</span>
				{/if}
			</div>
			{#if !collapse_summary}
				<div class="cardbody">
					<!-- summaries are HTML fragments that reach actuproxy from third-party
					     RSS feeds; rendering them is the point of the app, so they are
					     sanitized (see $lib/sanitize) rather than trusted -->
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html sanitizeSummary(article.summary)}
				</div>
			{/if}
		</div>
	{/each}
{/if}

<style>
	.card {
		width: 100%;
		margin: 0px;
		padding-right: 2px;
	}
	.cardhdr {
		padding-top: 5px;
		padding-bottom: 5px;
		padding-left: 4px;
		padding-right: 2px;
		margin-left: 2px;
		margin-right: 20px;
		background-color: seashell;
		color: var(--accent);
		font-size: 1.15rem;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
		overflow-wrap: break-word;
	}

	.cardbody {
		/* display: flex;
		flex-direction: row;
		gap: 2px; */
		margin-left: 2px;
		margin-right: 20px;
		padding-top: 8px;
		padding-left: 8px;
		padding-right: 4px;
		padding-bottom: 8px;
		border: solid 1px var(--border);
		border-bottom-left-radius: 10px;
		border-bottom-right-radius: 10px;
		background-color: aliceblue;
		margin-bottom: 1rem;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
		font-size: 1rem;
		color: var(--text);
	}

	.cardhdr {
		border-top: solid 1px var(--border);
		border-left: solid 1px var(--border);
		border-right: solid 1px var(--border);
		border-top-left-radius: 10px;
		border-top-right-radius: 10px;
		/* box-shadow: 10px 10px #888888; */
	}

	.nosumm {
		margin-bottom: 1rem;
		border-bottom: solid 1px var(--border);
		border-bottom-left-radius: 8px;
		border-bottom-right-radius: 8px;
	}

	.cardhdr a.title-link {
		color: inherit;
		text-decoration: none;
	}

	.cardhdr a.title-link:hover {
		text-decoration: underline;
	}

	.cardhdr a.more-link {
		font-size: 0.8rem;
		padding-left: 8px;
		color: var(--accent);
	}

	.pubdate {
		color: var(--text-muted);
		font-size: 0.75rem;
		margin-bottom: 2px;
	}

	.category {
		color: var(--text-muted);
		font-size: 0.8rem;
	}

	.cardbody :global(img) {
		max-width: 20%;
	}

	.empty {
		margin: 2rem auto;
		text-align: center;
		color: var(--text-muted);
	}

	.empty button {
		border: 1px solid var(--accent);
		border-radius: 999px;
		background-color: #fff;
		color: var(--accent);
		font-size: 0.8rem;
		padding: 4px 12px;
		cursor: pointer;
	}

	.empty button:hover {
		background-color: var(--accent-soft);
	}
</style>
