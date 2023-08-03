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
    interface Appdata {
        arts: Article[]
        count: string
        timeframe: string
    }
    
	import ActuContent from "./ActuContent.svelte";
	import ActuHdr from "./ActuHdr.svelte";
    export let appdata: Appdata;
    //export let count = data.count;
    //export let timeframe = data.timeframe;
    //export let articles = data.arts;
 
 </script>

<div class="pagecontainer">
    <div class="pageheader">
        <ActuHdr count={appdata.count} timeframe={appdata.timeframe}/>
    </div>
    <div class="pagecontent">
        <ActuContent articles={appdata.arts}/>
    </div>
</div>

<style>
    .pagecontainer {
        max-height: 100svh;
        /* margin-top: 80px; */
        margin-right: 4rem;
    }

    .pageheader {
        position: fixed;
        top: 0;
        width: 99svw;
    }

    .pagecontent {
        margin-top: 5rem;
    }
    
</style>