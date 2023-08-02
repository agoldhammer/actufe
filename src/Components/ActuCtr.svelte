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
    }
	import ActuContent from "./ActuContent.svelte";
	import ActuHdr from "./ActuHdr.svelte";
    export let pagedata: Pagedata;
 </script>

<div class="pagecontainer">
    <div class="pageheader">
        <ActuHdr count={pagedata.count}/>
    </div>
    <div class="pagecontent">
        <ActuContent articles={pagedata.arts}/>
    </div>
</div>

<style>
    .pagecontainer {
        margin-top: 100px;
    }
</style>