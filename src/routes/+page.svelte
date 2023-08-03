<script lang=ts>
    interface Article {
        id: string
        title: string
        summary: string
        pubdate: string
        pubname: string
        link: string
    }
    
    import ActuCtr from "../Components/ActuCtr.svelte"
    export let data;
</script>

<!-- <ActuCtr style="background-color: lightblue"/> -->
<ActuCtr {data}/>