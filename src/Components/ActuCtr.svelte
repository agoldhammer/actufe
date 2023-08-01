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


<ActuHdr count={pagedata.count}/>
<ActuContent articles={pagedata.arts}/>