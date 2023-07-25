<!-- 
    The Actu Container consists of three vertically stacked components:
    A header with nav and display controls
    An article display box
    A footer
 -->
 <script>
	import ActuContent from "./ActuContent.svelte";
	import ActuHdr from "./ActuHdr.svelte";
    export let pagedata;
    console.log("ActuCtr", pagedata)
 </script>


<ActuHdr count={pagedata.count}/>
<ActuContent articles={pagedata.arts}/>