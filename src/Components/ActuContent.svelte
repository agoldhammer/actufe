<script lang="ts">
	import type { Article } from '$comp/ActuCtr.svelte';
	import { selected_cats_store, selected_pubs_store } from '$lib/actustores';
	import { afterUpdate, beforeUpdate } from 'svelte';
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

	/* * before update, get id of top elt in pagecontent viewport*/
	let topElementId = '';
	//
	/* ! This still seems to have an annoying off-by-one behavior */
	beforeUpdate(() => {
		// console.log('before update called');

		const cardElts = document.getElementsByClassName('card');
		const parent = document.getElementById('pagecontent');
		if (!parent) return;
		const top = parent.scrollTop;
		const height = parent.offsetHeight;
		for (let i = 0; i < cardElts.length; i++) {
			let el = cardElts.item(i) as HTMLDivElement;
			let y = el.offsetTop;
			// console.log('id y top height', el.id, y, top, height);
			// check if el is visible in container
			if (top && height && y >= top && y <= top + height) {
				topElementId = el.id;
				// console.log('setting topElementId', topElementId);
				// break out after first visible el, which will be top one
				break;
			}
		}
		// }
	});

	/* * After update, find top elt and scroll to it*/
	afterUpdate(() => {
		// console.log('after update topElId', topElementId);

		if (topElementId) {
			// console.log('aft: scroll to topElementId\n', topElementId);
			const el = document.getElementById(topElementId) as HTMLDivElement;
			if (el) {
				el.scrollIntoView(true);
			}
		} else {
			// console.log('no top el');
		}
	});
</script>

{#if visibleArticles.length === 0}
	<div class="empty">
		<p>No articles match the current filters.</p>
		<button type="button" on:click={resetFilters}>Reset filters</button>
	</div>
{:else}
	{#each visibleArticles as article, i}
		<div id={i.toString()} class="card">
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
