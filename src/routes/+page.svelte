<script lang=ts>
    import ActuCtr from "../Components/ActuCtr.svelte"
    export let data;
</script>

<!-- <ActuCtr style="background-color: lightblue"/> -->
<!-- <div class="pageframe"> -->
    <ActuCtr appdata={data}/>
<!-- </div> -->

<!-- <style>
    .pageframe {
        max-width: 100%;
    }
</style> -->