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
            <span>{article.title}   </span>
            <a href="{article.link}" target="_blank" rel="noreferrer noopener">&#8618;</a>
        </div>
        <div class="cardbody">
            {@html article.summary}
        </div>
        
    </div>
    {/each}

</div>

<style>
    .cardhdr {
        padding-top: 5px;
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
        color: magenta;
        font-size: larger;
        
    }

    .cardhdr a {
        color: red;
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
        color: lightseagreen;
        font-size: xx-small;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
</style>