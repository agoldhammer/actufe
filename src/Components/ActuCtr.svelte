<!-- 
    The Actu Container consists of three vertically stacked components:
    A header with nav and display controls
    An article display box
    A footer
 -->
<script lang="ts" context="module">
	export interface Article {
		id: string;
		title: string;
		summary: string;
		pubdate: string;
		pubname: string;
		link: string;
		hash: string;
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
	}
</script>

<script lang="ts">
	import ActuContent from './ActuContent.svelte';
	import ActuHdr from './ActuHdr.svelte';
	import ActuSidebar from './ActuSidebar.svelte';
	export let appdata: Appdata;
	// console.log('ActuCtr: timeframe', appdata.timeframe)
	export let pubnames: Set<string> = new Set();
	appdata.arts.forEach((art) => pubnames.add(art.pubname));
	console.log(pubnames);
</script>

<div class="pagewrapper">
	<div class="header">
		<ActuHdr count={appdata.count} timeframe={appdata.timeframe} timespan={appdata.timespan} />
	</div>
	<!-- id pagecontent is used in ActuHdr to force scroll to top -->
	<div id="pagecontent" class="content">
		<ActuContent articles={appdata.arts} />
	</div>
	<div class="aside">
		<ActuSidebar {pubnames} />
	</div>
	<div class="footer">footer</div>
</div>

<style>
	.pagewrapper {
		display: grid;
		border: 2px solid blue;
		border-radius: 10px;
		height: 100lvh;
		background-color: rgba(208, 198, 203, 0.2);
		grid-template-columns: auto 1fr;
		grid-template-rows: 1fr 11fr 1fr;
		gap: 0.3em;
		grid-template-areas:
			'hdr hdr'
			'aside content'
			'footer footer';
	}

	.aside {
		grid-area: aside;
		border: 1px solid magenta;
		width: 100px;
		padding: 6px;
		margin-left: 2px;
		color: lightsalmon;
		display: flex;
		flex-direction: column;
		gap: 1rem;
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

	/* button {
  height: 60%;
} */

	.content {
		grid-area: content;
		color: green;
		border: 1px groove magenta;
		margin-right: 2px;
		padding: 1em;
		overflow: scroll;
	}

	/* checkbox {
  padding: 10px;
  margin: 10px;
  width: 0.5rem;
  height: 0.5rem;
  background-color: gray;
} */

	.footer {
		border: 2px solid orange;
		border-radius: 10px;
		grid-area: footer;
		color: lightcoral;
		padding: 0.5rem;
		margin: 2px;
		font-size: xx-small;
	}

	/* .opt {
  padding-left: 8px;
  font-size: xx-small;
}

.opt:first-of-type {
  margin-top: 8px;
}    */
</style>
