<script lang=ts>
    interface Articles {
        id: string
        title: string
        summary: string
        pubdate: string
        pubname: string
        link: string
        hash: string
    }

    export let articles: Articles[]
</script>

<!-- <div class="content"> -->
{#each articles as article, i}
        <!-- content here -->

<div class="card">
    <div class="cardhdr">
        <span class="pubdate">[{article.pubdate}: {article.pubname}-{article.hash}]</span>
        <span>{article.title}</span>
        <a href="{article.link}" target="_blank" rel="noreferrer noopener">&#8618; Continue reading ...</a>
    </div>
    <div class="cardbody">
        {@html article.summary}
    </div>
    
</div>
{/each}

<!-- </div> -->

<style>
    .card {
        width: 100%;
        margin-right: 4px;
        padding-right: 4px;
    }
    .cardhdr, .cardbody {
        padding-top: 5px;
        padding-bottom: 5px;
        padding-left: 8px;
        padding-right: 8px;
        margin-left: 2px;
        margin-right: 2px;
        background-color: seashell;
        color: #9a031e;
        font-size: larger;
        
    }

    .cardhdr {
        border-top: solid 2px black;
        border-left: solid 2px black;
        border-right: solid 2px black;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }

    .cardhdr a {
        font-size: small;
        padding-left: 8px;
        color:#0077b6;
    }

    .cardbody {
        border: solid 2px blue;
        border-style: groove;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
        background-color: aliceblue;
        margin-bottom: 1rem;
        font-size: smaller;
        color: black;

        /* border-top-style: none; */
    }

    .pubdate {
        /* color: lightseagreen; */
        /* color: oklch(20.1, 0.091, 146.1); */
        color:#00b4d8;
        font-size: xx-small;
        /* font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; */
    }

    :global(img) {
        max-width: 20%;
    }
</style>