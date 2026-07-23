<!-- 
    The Actu Container consists of three vertically stacked components:
    A header with nav and display controls
    An article display box
    A footer
 -->
<script lang="ts" context="module">
	import ActuCats from './ActuCats.svelte';
	export interface Article {
		id: string;
		title: string;
		summary: string;
		pubdate: string;
		pubname: string;
		link: string;
		hash: string;
		cat?: string;
	}

	export interface Timespan {
		start: string;
		end: string;
	}
	export interface Appdata {
		arts: Article[];
		count: string;
		timeframe: string;
		timespan: Timespan;
		pubnames: Array<string>; // sorted array of pubnames on current page
		ndocs: string;
		// cats: Array<string>;
	}
</script>

<script lang="ts">
	import ActuContent from './ActuContent.svelte';
	import ActuHdr from './ActuHdr.svelte';
	import ActuSidebar from './ActuSidebar.svelte';
	import ActuFtr from './ActuFtr.svelte';
	export let appdata: Appdata;
	let collapse_summary = false;
	let show_filters = false;
</script>

<div class="pagewrapper">
	<div class="header">
		<ActuHdr timeframe={appdata.timeframe} bind:collapse_summary bind:show_filters />
	</div>
	<div class="cats-ctr">
		<ActuCats />
	</div>
	<!-- id pagecontent is used in ActuHdr to force scroll to top -->
	<div id="pagecontent" class="content">
		<ActuContent articles={appdata.arts} pubnames={appdata.pubnames} {collapse_summary} />
	</div>
	{#key appdata.pubnames}
		<div class="aside" class:open={show_filters}>
			<ActuSidebar pubnames={appdata.pubnames} />
		</div>
	{/key}
	<div class="footer">
		<ActuFtr {appdata} />
	</div>
</div>

<style>
	.pagewrapper {
		/* single accent + neutral grays, shared by all child components */
		--accent: #9a031e;
		--accent-dark: #6e0215;
		--accent-soft: #f7e9eb;
		--border: #c8c3c5;
		--text: #333;
		--text-muted: #6b6b6b;
		font-family: Verdana, Geneva, Tahoma, sans-serif;
		display: grid;
		margin: 0 auto;
		padding: 2px;
		border: 1px solid var(--border);
		border-radius: 10px;
		height: 98svh;
		max-width: 800px;
		background-color: rgba(208, 198, 203, 0.2);
		color: var(--text);
		grid-template-columns: auto 1fr;
		grid-template-rows: auto auto 1fr auto;
		gap: 0.3em;
		grid-template-areas:
			'hdr hdr'
			'cats cats'
			'aside content'
			'footer footer';
	}

	.aside {
		grid-area: aside;
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 1px;
		margin-left: 0px;
		margin-top: 4px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-size: 0.75rem;
		overflow: hidden;
	}

	.header {
		border: 1px solid var(--border);
		border-radius: 10px;
		grid-area: hdr;
		margin: 2px;
		padding: 4px;
		display: flex;
		flex-direction: row;
		gap: 15px;
	}

	.content {
		grid-area: content;
		margin-left: 0px;
		margin-right: 2px;
		margin-top: 4px;
		padding: 0px;
		overflow-y: scroll;
		overflow-x: hidden;
	}

	.footer {
		border: 1px solid var(--border);
		border-radius: 10px;
		grid-area: footer;
		color: var(--text-muted);
		padding: 0.5rem;
		margin: 2px;
		font-size: 0.75rem;
	}

	.cats-ctr {
		width: 99%;
		margin: 0 auto;
		border: 1px solid var(--border);
		border-radius: 10px;
		grid-area: cats;
		column-gap: 2px;
		background-color: #fff;
		overflow-x: hidden;
		overflow-y: auto;
	}

	@media (max-width: 640px) {
		.pagewrapper {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto auto 1fr auto;
			grid-template-areas:
				'hdr'
				'cats'
				'aside'
				'content'
				'footer';
		}

		.aside {
			display: none;
		}

		.aside.open {
			display: flex;
			max-height: 30svh;
		}
	}
</style>
