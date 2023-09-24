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
	interface Appdata {
		arts: Article[];
		count: string;
		timeframe: string;
		timespan: Timespan;
		pubnames: Array<string>; // sorted array of pubnames on current page
		ndocs: string;
		cats: Array<string>;
	}
</script>

<script lang="ts">
	// import { onMount } from 'svelte';

	import ActuContent from './ActuContent.svelte';
	import ActuHdr from './ActuHdr.svelte';
	import ActuSidebar from './ActuSidebar.svelte';
	import ActuFtr from './ActuFtr.svelte';
	export let appdata: Appdata;
	let selected_pubnames: string[] = appdata.pubnames;
	let collapse_summary = false;
</script>

<div class="pagewrapper">
	<div class="header">
		<ActuHdr {appdata} />
	</div>
	<div class="cats-ctr">
		<ActuCats cats={appdata.cats} />
	</div>
	<!-- id pagecontent is used in ActuHdr to force scroll to top -->
	<div id="pagecontent" class="content">
		<ActuContent articles={appdata.arts} {selected_pubnames} {collapse_summary} />
	</div>
	<div class="aside">
		<ActuSidebar pubnames={appdata.pubnames} bind:selected_pubnames bind:collapse_summary />
	</div>
	<div class="footer">
		<ActuFtr {appdata} />
	</div>
</div>

<style>
	.pagewrapper {
		display: grid;
		margin: 0 auto;
		padding: 2px;
		border: 2px solid blue;
		border-radius: 10px;
		height: 98svh;
		max-width: 800px;
		background-color: rgba(208, 198, 203, 0.2);
		grid-template-columns: auto 1fr;
		grid-template-rows: 1fr 2fr 11fr 1fr;
		gap: 0.3em;
		grid-template-areas:
			'hdr hdr'
			'cats cats'
			'aside content'
			'footer footer';
	}

	.aside {
		grid-area: aside;
		border: 1px solid magenta;
		border-radius: 10px;
		/* width: 120px; */
		padding: 1px;
		margin-left: 0px;
		color: lightsalmon;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-size: xx-small;
		overflow: hidden;
	}

	.header {
		border: 1px solid orange;
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
		color: green;
		/* border: 1px groove magenta; */
		/* border-radius: 10px; */
		margin-left: 0px;
		margin-right: 2px;
		padding: 0px;
		overflow-y: scroll;
	}

	.footer {
		border: 2px solid orange;
		border-radius: 10px;
		grid-area: footer;
		color: blue;
		padding: 0.5rem;
		margin: 2px;
		font-size: xx-small;
	}

	.cats-ctr {
		border: 1px solid black;
		border-radius: 10px;
		grid-area: cats;
		column-gap: 2px;
		font-size: xx-small;
		background-color: rgba(0, 13, 51, 0.8);
		color: white;
		overflow-x: hidden;
	}
</style>
