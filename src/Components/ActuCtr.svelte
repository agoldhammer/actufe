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
    //export let count = data.count;
    //export let timeframe = data.timeframe;
    //export let articles = data.arts;
 
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
        width: 99svw;
    }

    .pagecontent {
        width: 99svw;
        margin-top: 7rem;
        margin-right: 4px;
    }
    
</style>