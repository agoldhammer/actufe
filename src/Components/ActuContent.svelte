<script lang=ts>
    interface Articles {
        id: string
        title: string
        summary: string
        pubdate: string
    }

    export let articles: Articles[]
</script>

<div class="content">
    {#each articles as article}
         <!-- content here -->
    
    <div class="card">
        <div class="cardhdr">
            <span class="pubdate">[{article.pubdate}:]</span>
            <span>{article.title}</span>
        </div>
        <div class="cardbody">
            {@html article.summary}
        </div>
        
    </div>
    {/each}

</div>

<style>
    .cardhdr {
        padding: 2px;
        padding-left: 8px;
        margin-top: 10px;
        border-top: solid 2px black;
        border-left: solid 2px black;
        border-right: solid 2px black;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        background-color: seashell;
        color: magenta;
        font-size: larger;
        
    }

    .cardbody {
        padding-left: 16px;
        padding-top: 10px;
        padding-bottom: 10px;
        border: solid 2px blue;
        border-style: groove;
        border-bottom-left-radius: 10px;
        border-bottom-right-radius: 10px;
        background-color: rgb(214, 225, 228);
        /* border-top-style: none; */
    }

    .pubdate {
        font-size: smaller;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
</style>