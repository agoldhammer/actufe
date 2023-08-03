<script lang=ts>
	import { goto } from '$app/navigation';
    export let count: string;
    export let timeframe: string;
    // @ts-ignore
    const handleTimeBtnClick = (event) => {
        console.log(event.target.value)
        if (event.target.value === 'back') {
            goto('/?timeframe=1')
        } else {
            goto('/?timeframe=0')
        }

    }
    // let FETCHED_ARTS: string
</script>

<div class="actu-hdr">
    <!-- TODO: hamburger button, for now is just HOME button-->
    <button class="hamburger" type="button" on:click|preventDefault={() => goto('/')}>&#9776</button>
    <div class="spacer"></div>
    <!-- time buttons -->
    <button class="timebutton" type="button" value="back" on:click|preventDefault={(event) => handleTimeBtnClick(event)}>&#8592</button>
    <span class="timetravel">Time Travel</span>
    <button class="timebutton" type="button" value="fwd" on:click|preventDefault={(event) => handleTimeBtnClick(event)}>&#8594</button> 
    <!-- help button -->
    <div class="spacer"></div>
    <button class="help" type="button" on:click|preventDefault={() => goto('/about')} >Help</button>
    <!-- <span>{FETCHED_ARTS}</span> -->
    <div class="spacer"></div>
    <button class="count">Count: {count}</button>
    <span>Timeframe: {timeframe}</span>
</div>

<style>
    .actu-hdr {
        position: fixed;
        top: 0;
        left: 0;
        width: 97svw;
        margin-left: 5px;
        margin-right: 8px;
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
        transition-duration: 0.3s;
    }

    .hamburger:hover, .timebutton:hover, .help:hover {
        background-color: green;
    }

    .timetravel {
        font-size: smaller;
    }

    .spacer {
        width: 1em;
    }
</style>