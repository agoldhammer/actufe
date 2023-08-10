<script lang="ts">
	import type { Article } from '$comp/ActuCtr.svelte';
	export let articles: Article[];
	export let selected_pubnames: string[];
	export let collapse_summary: boolean;
</script>

<!-- <div class="content"> -->
{#each articles as article (article.hash)}
	{#if selected_pubnames.includes(article.pubname)}
		<!-- content here -->

		<div class="card">
			<div class="cardhdr">
				<!-- <span class="pubdate">[{article.pubdate}: {article.pubname}-{article.hash}]</span> -->
				<span class="pubdate">[{article.pubdate}: {article.pubname}]</span>
				<span>{article.title}</span>
				<a href={article.link} target="_blank" rel="noreferrer noopener"
					>&#8618; Continue reading ...</a
				>
			</div>
			{#if !collapse_summary}
				<div class="cardbody">
					{@html article.summary}
				</div>
			{/if}
		</div>
	{/if}
{/each}

<!-- </div> -->

<style>
	.card {
		width: 100%;
		margin: 0px;
		padding-right: 2px;
	}
	.cardhdr,
	.cardbody {
		padding-top: 5px;
		padding-bottom: 5px;
		padding-left: 4px;
		padding-right: 2px;
		margin-left: 2px;
		margin-right: 20px;
		background-color: seashell;
		color: #9a031e;
		font-size: larger;
		box-shadow: 8px 8px #c1bebe;
	}

	.cardhdr {
		border-top: solid 2px black;
		border-left: solid 2px black;
		border-right: solid 2px black;
		border-top-left-radius: 10px;
		border-top-right-radius: 10px;
		/* box-shadow: 10px 10px #888888; */
	}

	.cardhdr a {
		font-size: small;
		padding-left: 8px;
		color: #0077b6;
	}

	.cardbody {
		border: solid 2px blue;
		border-style: groove;
		border-bottom-left-radius: 10px;
		border-bottom-right-radius: 10px;
		background-color: aliceblue;
		margin-bottom: 1rem;
		font-size: smaller;
		color: black;
	}

	.pubdate {
		color: #00b4d8;
		font-size: xx-small;
	}

	:global(img) {
		max-width: 20%;
	}
</style>
