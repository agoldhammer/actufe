<script lang=ts>
    interface Articles {
        id: string
        title: string
        summary: string
        pubdate: string
        pubname: string
        link: string
    }

    export let articles: Articles[]
</script>

<div class="content">
    {#each articles as article, i}
         <!-- content here -->
    
    <div class="card">
        <div class="cardhdr">
            <span class="pubdate">[{article.pubdate}: {article.pubname}]</span>
            <span>{article.title}</span>
            <a href="{article.link}" target="_blank" rel="noreferrer noopener">&#8618; Continue reading ...</a>
        </div>
        <div class="cardbody">
            {@html article.summary}
        </div>
        
    </div>
    {/each}

</div>

<style>
    .cardhdr {
        padding-top: 55px;
        padding-bottom: 5px;
        padding-left: 8px;
        padding-right: 8px;
        margin-top: 10px;
        border-top: solid 2px black;
        border-left: solid 2px black;
        border-right: solid 2px black;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        background-color: seashell;
        /* color: magenta; */
        /* color: oklch(40.2, 0.2, 15.5); */
        color: #9a031e;
        font-size: larger;
        
    }

    .cardhdr a {
        font-size: small;
        padding-left: 8px;
        /* color: blue; */
        /* color: oklch(50.66, 0.2018, 269.35); */
        color:#0077b6;
    }

    .cardbody {
        /* display: flex;
        flex-direction: row;
        gap: 3px; */
        padding-left: 16px;
        padding-top: 10px;
        padding-bottom: 10px;
        border: solid 2px blue;
        border-style: groove;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
        background-color: aliceblue;
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