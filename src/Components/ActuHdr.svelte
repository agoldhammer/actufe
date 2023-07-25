<script>
    export let count
</script>

<div class="actu-hdr">
    <nav>
	    <a href="/">home</a>
	    <a href="/about">about</a>
    </nav>
    <button>Button1</button>
    <button>Button2</button>
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