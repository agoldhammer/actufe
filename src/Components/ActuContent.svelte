<script lang="ts">
	import type { Article } from '$lib/types';
	import { selected_cats_store, selected_pubs_store } from '$lib/actustores';
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	export let articles: Article[];
	export let pubnames: string[];
	export let collapse_summary: boolean;

	$: visibleArticles = articles.filter(
		(a) =>
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
	// dropping a publication): find the article at the top of the viewport before
	// the list re-renders, then scroll it back to the top afterward.
	//
	// The anchor is the article's own id (`card-${article.id}`), never the list
	// index: when a filter removes articles a given index points at a different
	// article after the update, so an index-based anchor scrolled to the wrong
	// card. With a stable id the anchor lands on the same article, or — if that
	// article was filtered out — is simply absent and the scroll is left alone.
	//
	// This is driven by a reactive statement + tick() rather than
	// beforeUpdate/afterUpdate: under Svelte 5 those legacy hooks fire out of step
	// with the {#each} DOM patch (afterUpdate still saw the pre-filter cards), so
	// the anchor was measured and restored against a stale DOM.
	const cardId = (article: Article) => `card-${article.id}`;

	function topVisibleCardId(): string {
		const parent = document.getElementById('pagecontent');
		if (!parent) return '';
		// Measure in viewport coordinates via getBoundingClientRect rather than
		// offsetTop/scrollTop: #pagecontent isn't a positioned element, so the
		// cards' offsetParent is some ancestor and offsetTop is in a different
		// coordinate space than scrollTop — comparing them picks the wrong card.
		const parentTop = parent.getBoundingClientRect().top;
		const cards = parent.getElementsByClassName('card');
		for (let i = 0; i < cards.length; i++) {
			const el = cards[i] as HTMLDivElement;
			// First card whose bottom edge is still below the container's top edge is
			// the topmost (partially) visible one. The 1px slop discounts a sub-pixel
			// sliver of the card above so the barely off-screen previous card doesn't win.
			if (el.getBoundingClientRect().bottom > parentTop + 1) return el.id;
		}
		return '';
	}

	let scrollKey = '';
	$: preserveScroll(collapse_summary, visibleArticles);

	async function preserveScroll(collapsed: boolean, arts: Article[]) {
		// Re-run only when the rendered set actually changes; the reactive
		// statement also fires for unrelated store updates. Collapsing summaries
		// keeps the same ids but changes heights, so it is part of the key.
		const key = `${collapsed}|${arts.map((a) => a.id).join(',')}`;
		if (key === scrollKey) return;
		scrollKey = key;
		// Measured against the pre-update DOM (reactive statements run before the
		// DOM is patched); tick() then waits for the new list to render.
		const anchorId = topVisibleCardId();
		await tick();
		if (anchorId) document.getElementById(anchorId)?.scrollIntoView(true);
	}
</script>

{#if visibleArticles.length === 0}
	<div class="empty">
		<p>No articles match the current filters.</p>
		<button type="button" on:click={resetFilters}>Reset filters</button>
	</div>
{:else}
	{#each visibleArticles as article}
		<div id={cardId(article)} class="card">
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
					<!-- summaries are HTML fragments from the trusted actuproxy feed;
					     rendering them is the point of the app -->
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html article.summary}
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
