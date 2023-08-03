<!-- 
    The Actu Container consists of three vertically stacked components:
    A header with nav and display controls
    An article display box
    A footer
 -->
 <script lang=ts>
    interface Article {
        id: string
        title: string
        summary: string
        pubdate: string
        pubname: string
        link: string
    }
    
	import ActuContent from "./ActuContent.svelte";
	import ActuHdr from "./ActuHdr.svelte";
    export let data;
    export let count = data.count;
    export let timeframe = data.timeframe;
    export let articles = data.arts;
 
 </script>

<div class="pagecontainer">
    <div class="pageheader">
        <ActuHdr {count} {timeframe}/>
    </div>
    <div class="pagecontent">
        <ActuContent {articles}/>
    </div>
</div>

<style>
    .pagecontainer {
        margin-top: 80px;
    }
    
</style>