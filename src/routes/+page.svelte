<script lang=ts>
    interface Article {
        id: string
        title: string
        summary: string
        pubdate: string
    }
    interface Pagedata {
        arts: Article[]
        count: string
    }
    import ActuCtr from "../Components/ActuCtr.svelte"
    export let data: Pagedata;
</script>

<!-- <ActuCtr style="background-color: lightblue"/> -->
<ActuCtr pagedata={data}/>