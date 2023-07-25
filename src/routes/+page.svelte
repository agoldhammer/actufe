<script>
	// import { data } from './data.js';
    import ActuCtr from "../Components/ActuCtr.svelte"
    export let data;
    // console.log(data.arts)
    // console.log(data)
    // export const data
</script>

<!-- <ActuCtr style="background-color: lightblue"/> -->
<ActuCtr pagedata={data}/>