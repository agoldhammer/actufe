<script lang=ts>
    export let count: string
</script>

<div class="actu-hdr">
    <nav>
	    <a href="/">home</a>
	    <a href="/about">about</a>
    </nav>
    <button>&#9776</button>
    <button>&#x2713</button>
    <p>Count: {count}</p>
</div>

<style>
    .actu-hdr {
        display:flex;
        gap: 1em;
        border: 2px solid red;
        padding: 2px;
        background-color: lightcyan;
    }
    p {
        color: blue;
    }
</style>