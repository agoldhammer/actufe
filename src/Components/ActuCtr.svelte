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
    interface Pagedata {
        arts: Article[]
        count: string
        timeframe: string
    }
	import ActuContent from "./ActuContent.svelte";
	import ActuHdr from "./ActuHdr.svelte";
    export let pagedata: Pagedata;
    // export const data;
 </script>

<div class="pagecontainer">
    <div class="pageheader">
        <ActuHdr count={pagedata.count} timeframe={pagedata.timeframe}/>
    </div>
    <div class="pagecontent">
        <ActuContent articles={pagedata.arts}/>
    </div>
</div>

<style>
    .pagecontainer {
        margin-top: 80px;
    }
    
</style>