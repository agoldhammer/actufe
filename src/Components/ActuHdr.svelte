<script lang=ts>
	//import { FETCHED_ARTS } from './../livedb/connect.ts';
    // this gives an error insisting on using event.fetch instead of fetch when export is nondummy
	// import { FETCHED_ARTS } from '$livedb/connect';
    export let count: string
    // let FETCHED_ARTS: string
</script>

<div class="actu-hdr">
    <nav>
	    <a href="/">home</a>
	    <a href="/about">about</a>
    </nav>
    <button>&#9776</button>
    <button>&#x2713</button>
    <!-- <span>{FETCHED_ARTS}</span> -->
    <p>Count: {count}</p>
</div>

<style>
    .actu-hdr {
        position: fixed;
        top: 0;
        left: 0;
        width: 99lvw;
        display:flex;
        flex-direction: row;
        gap: 1em;
        border: 2px solid red;
        border-radius: 10px;
        padding: 2px;
        background-color: lightcyan;
    }
    p {
        color: blue;
    }
</style>