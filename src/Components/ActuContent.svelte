<script lang="ts">
	import type { Article } from '$comp/ActuCtr.svelte';
	import { selected_cats_store, selected_pubs_store } from '$lib/actustores';
	import { afterUpdate, beforeUpdate } from 'svelte';
	export let articles: Article[];
	// export let selected_pubnames: string[];
	export let collapse_summary: boolean;

	/* * before update, get id of top elt in pagecontent viewport*/
	let topElementId: string = '';
	//
	beforeUpdate(() => {
		// console.log('before update called');

		const cardElts = document.getElementsByClassName('card');
		const parent = document.getElementById('pagecontent');
		if (!parent) return;
		const top = parent.scrollTop;
		const height = parent.offsetHeight;
		if (topElementId) {
			// console.log('b4: expdg, so scroll to topElementId\n', topElementId);
			let el = document.getElementById(topElementId) as HTMLDivElement;
			if (el) {
				el.scrollIntoView(true);
			} else {
				el = cardElts[0] as HTMLDivElement;
			}
		}
		if (collapse_summary) {
			for (let i = cardElts.length - 1; i >= 0; i--) {
				let el = cardElts.item(i) as HTMLDivElement;
				let y = el.offsetTop;
				// console.log('y', y);
				// check if el is visible in container
				if (top && height && y >= top && y <= top + height) {
					topElementId = el.id;
					// console.log('setting topElementId', topElementId);
					// break out after first visible el, which will be top one
					break;
				}
			}
		}
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
		}
	});

	function isCatShowing(cat: string): boolean {
		const selected_cats = $selected_cats_store;
		let retval: boolean;
		// console.log('isCatShowing', cat, selected_cats);
		if (selected_cats.length === 0 || selected_cats.includes(cat)) {
			retval = true;
		} else {
			retval = false;
		}
		// console.log('retval', cat, retval);
		return retval;
	}
</script>

<!-- force rerender when cats change -->
{#key $selected_cats_store}
	{#each articles as article (article.hash)}
		{#if isCatShowing(article.cat ?? 'uncategorized') && $selected_pubs_store.includes(article.pubname)}
			<!-- content here -->

			<div id={article.hash} class="card">
				<div class="cardhdr" class:nosumm={collapse_summary}>
					<!-- <span class="pubdate">[{article.pubdate}: {article.pubname}-{article.hash}]</span> -->
					<div class="pubdate">[{article.pubdate}: {article.pubname}]</div>
					<div>
						<span>{article.title}</span>
						<a href={article.link} target="_blank" rel="noreferrer noopener"
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
						{@html article.summary}
					</div>
				{/if}
			</div>
		{/if}
	{/each}
{/key}

<!-- </div> -->

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
		color: #9a031e;
		font-size: x-large;
		box-shadow: 8px 8px #c1bebe;
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
		border: solid 2px blue;
		border-style: groove;
		border-bottom-left-radius: 10px;
		border-bottom-right-radius: 10px;
		background-color: aliceblue;
		margin-bottom: 1rem;
		box-shadow: 8px 8px #c1bebe;
		font-size: large;
		color: black;
	}

	.cardhdr {
		border-top: solid 2px black;
		border-left: solid 2px black;
		border-right: solid 2px black;
		border-top-left-radius: 10px;
		border-top-right-radius: 10px;
		/* box-shadow: 10px 10px #888888; */
	}

	.nosumm {
		margin-bottom: 1rem;
		border-bottom: solid 1px black;
		border-bottom-left-radius: 8px;
		border-bottom-right-radius: 8px;
	}

	.cardhdr a {
		font-size: small;
		padding-left: 8px;
		color: #0077b6;
	}

	.pubdate {
		color: #00b4d8;
		font-size: xx-small;
		margin-bottom: 2px;
	}

	.category {
		color: red;
		font-size: small;
	}

	:global(img) {
		max-width: 20%;
	}
</style>
