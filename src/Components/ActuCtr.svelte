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
        hash: string
    }

    interface Timespan {
        start: string
        end: string
    }
    interface Appdata {
        arts: Article[]
        count: string
        timeframe: string
        timespan: Timespan
    }
    
	import ActuContent from "./ActuContent.svelte";
	import ActuHdr from "./ActuHdr.svelte";
    export let appdata: Appdata;
    console.log('ActuCtr: timeframe', appdata.timeframe)
 
 </script>

<!-- <div class="pagecontainer"> -->
    <div class="pageheader">
        <ActuHdr count={appdata.count} timeframe={appdata.timeframe}
            timespan={appdata.timespan}/>
    </div>
    <div class="pagecontent">
        <ActuContent articles={appdata.arts}/>
    </div>
<!-- </div> -->

<style>

    .pageheader {
        position: fixed;
        top: 1px;
        margin-right: 4px;
        margin-bottom: 6px;
        --pg-width: 99svw;
        width: 99svw;
        min-width: --pg-width;
    }

    .pagecontent {
        padding: 5px;
        width: --pg-width;
        border: 2px solid black;
        margin-top: 6rem;
        margin-right: 2px;
        margin-left: 2px;
        max-width: inherit;
        height: 80svh;
        max-height: 80svh;
        overflow: scroll;
    }
    
</style>