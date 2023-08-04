<script lang=ts>
    interface Timespan {
        start: string
        end: string
    }
	import { goto } from '$app/navigation';
    export let count: string;
    export let timeframe: string; // used in computations, do not change
    export let timespan: Timespan; // strings for displaying timeframe to humans
    // console.log('timeframe', timeframe)
    $: flag = (timeframe === '0'?true: false);

    function disableFwd() {
        return timeframe === '0'? true: false;
    }
    // @ts-ignore
    const handleTimeBtnClick = (event) => {
        // console.log(event.target.value)
        if (event.target.value === 'back') {
            const newframe = +timeframe + 1
            goto('/?timeframe=' + newframe)
        } else {
            let newframe = +timeframe - 1;
            newframe = newframe < 0 ? 0: newframe;
            goto('/?timeframe=' + newframe)
        }

    }
    // let FETCHED_ARTS: string
</script>

<div class="actu-hdr">
    <!-- TODO: hamburger button, for now is just HOME button-->
    <button class="hamburger" type="button" on:click|preventDefault={() => goto('/')}>&#9776</button>
    <div class="spacer"></div>
    <!-- time buttons -->
    <!-- back button -->
    <button class="timebutton" type="button" value="back" on:click|preventDefault={(event) => handleTimeBtnClick(event)}>&#8678</button>
    <span class="timetravel">Time Travel</span>
    <!-- forward button -->
    <button class="timebutton" type="button" value="fwd"
        disabled={flag} on:click|preventDefault={(event) => handleTimeBtnClick(event)}>&#8680</button> 
    <!-- help button -->
    <div class="spacer"></div>
    <button class="help" type="button" on:click|preventDefault={() => goto('/about')} >Help</button>
    <!-- <span>{FETCHED_ARTS}</span> -->
    <div class="spacer"></div>
    <!-- <button class="count">Count: {count}</button> -->
    <div class="timespan">
        <span>Displaying {count}</span>
        <span>{timespan.start}</span>
        <span>{timespan.end}</span>
    </div>
</div>

<style>
    .actu-hdr {
        /* position: fixed;
        top: 0;
        width: 96%;
        max-width: inherit;
        margin-left: 0px;
        margin-right: 0px; */
        display:flex;
        flex-wrap: wrap;
        flex-direction: row;
        align-items: center;
        gap: 2px;
        border: 3px ridge blue;
        border-radius: 6px 8px 10px 10px;
        padding: 10px;
        margin-right: 4px;
        background-color: lightcyan;
    }

    .hamburger, .timebutton, .help {
        height: 85%;
        border-radius: 8px;
        background-color:lightcoral;
        color: white;
        transition-duration: 0.3s;
    }

    .timebutton:disabled,
    .timebutton:hover:disabled {
        background-color: lightgray;
    }

    .hamburger:hover, .timebutton:hover, .help:hover {
        background-color: green;
    }

    .timetravel {
        color: lightseagreen;
        font-size: xx-small;
    }

    .timespan {
        font-size: xx-small;
        display: flex;
        flex-direction: column;
        color: lightseagreen;
    }


    .spacer {
        width: 1em;
    }
</style>