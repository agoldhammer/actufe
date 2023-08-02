<script lang=ts>
	import { goto } from '$app/navigation';
    export let count: string;
    const handleTimeBtnClick = function(event) {
        console.log(event.target.value)
    }
    // let FETCHED_ARTS: string
</script>

<div class="actu-hdr">
    <!-- TODO: hamburger button, for now is just HOME button-->
    <button class="hamburger" type="button" on:click|preventDefault={() => goto('/')}>&#9776</button>
    <div class="spacer"></div>
    <!-- time buttons -->
    <button class="timebutton" type="button" value="1" on:click|preventDefault={(event) => handleTimeBtnClick(event)}>3-0</button>
    <button class="timebutton" type="button" value="2" on:click|preventDefault={(event) => handleTimeBtnClick(event)}>6-3</button> 
    <button class="timebutton" type="button" value="3" on:click|preventDefault={(event) => handleTimeBtnClick(event)}>9-6</button> 
    <button class="timebutton" type="button" value="4" on:click|preventDefault={(event) => handleTimeBtnClick(event)}>12-9</button> 
    <!-- help button -->
    <div class="spacer"></div>
    <button class="help" type="button" on:click|preventDefault={() => goto('/about')} >Help</button>
    <!-- <span>{FETCHED_ARTS}</span> -->
    <div class="spacer"></div>
    <button class="count">Count: {count}</button>
</div>

<style>
    .actu-hdr {
        position: fixed;
        top: 0;
        left: 0;
        width: 99lvw;
        display:flex;
        flex-direction: row;
        gap: 1em;
        border: 2px solid red;
        border-radius: 10px;
        padding: 10px;
        background-color: lightcyan;
    }

    .hamburger, .timebutton, .help, .count {
        height: 85%;
        border-radius: 8px;
        background-color:lightcoral;
        color: white;
    }

    .spacer {
        width: 1em;
    }
</style>