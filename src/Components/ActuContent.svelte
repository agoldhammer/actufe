<script lang=ts>
    export let articles
</script>

<div class="content">

    <ul>
        {#each articles as article}
        <li>{article.id}</li>
        <li>{article.title}</li>
        <li>{article.summary}</li>
        <li>{article.pubdate}</li>
        {/each}
    </ul>

    <!-- <ul>
        <li>First</li>
        <li>Second</li>
        <li>Third</li>
    </ul> -->
</div>

<style>
    .content {
        background-color: seashell;
    }
    li {
        background-color: lavenderblush;
        margin: 1em;
    }
</style>