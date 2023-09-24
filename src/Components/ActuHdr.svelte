<script lang="ts">
	import type { Timespan } from '$comp/ActuCtr.svelte';
	import { goto } from '$app/navigation';
	export let appdata;
	const { count, timeframe, timespan } = appdata;
	// console.log('timeframe', count, timeframe, timespan);
	$: flag = timeframe === '0' ? true : false;

	function disableFwd() {
		return timeframe === '0' ? true : false;
	}

	const handleHamburgerBtnClick = () => {
		console.log('Handling hamburger');
		//@ts-ignore
		document.getElementById('pagecontent').scrollTop = 0;
	};
	// @ts-ignore
	const handleTimeBtnClick = (event) => {
		// console.log(event.target.value)
		if (event.target.value === 'back') {
			const newframe = +timeframe + 1;
			goto('/?timeframe=' + newframe);
		} else {
			let newframe = +timeframe - 1;
			newframe = newframe < 0 ? 0 : newframe;
			goto('/?timeframe=' + newframe);
		}
		// scroll back to top after time travel
		// @ts-ignore
		document.getElementById('pagecontent').scrollTop = 0;
	};
	// @ts-ignore
	const handleCatBtnClick = (event) => {};

	import tippy from 'tippy.js';
	import 'tippy.js/dist/tippy.css';
	import 'tippy.js/themes/material.css';

	// @ts-ignore
	function tooltip(node, options) {
		// @ts-ignore
		const tooltip = tippy(node, options);
		return {
			//@ts-ignore
			update(options) {
				//@ts-ignore
				tooltip.setProps(options);
			},
			destroy() {
				//@ts-ignore
				tooltip.destroy();
			}
		};
	}

	const fwdBtnTip = 'Next time frame';
	const backBtnTip = 'Prev time frame';
	const catBtnTip = 'Toggle category display';
</script>

<div class="actu-hdr">
	<!-- TODO: hamburger button, for now is just HOME button-->
	<button class="hamburger" type="button" on:click|preventDefault={handleHamburgerBtnClick}
		>&#9776</button
	>
	<div class="spacer" />
	<button
		class="cat-button"
		type="button"
		use:tooltip={{ content: catBtnTip, theme: 'material', animation: 'fade' }}
		value="cats"
		on:click|preventDefault={handleCatBtnClick}
	>
		Categories
	</button>

	<div class="spacer" />
	<!-- time buttons -->
	<!-- back button -->
	<button
		class="timebutton"
		type="button"
		use:tooltip={{ content: backBtnTip, theme: 'material', animation: 'fade' }}
		value="back"
		on:click|preventDefault={handleTimeBtnClick}>&#8678</button
	>
	<span class="timetravel">Time</span>
	<!-- forward button -->
	<button
		class="timebutton"
		use:tooltip={{ content: fwdBtnTip, theme: 'material', animation: 'fade' }}
		type="button"
		value="fwd"
		disabled={flag}
		on:click|preventDefault={handleTimeBtnClick}>&#8680</button
	>
	<!-- help button -->
	<div class="spacer" />
	<button class="help" type="button" on:click|preventDefault={() => goto('/about')}>Help</button>
</div>

<style>
	.actu-hdr {
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
		align-items: center;
		gap: 2px;
		width: inherit;
		padding: 5px;
	}

	.hamburger,
	.timebutton,
	.cat-button,
	/* .cat-dropdown-btn, */
	.help {
		height: 85%;
		border-radius: 8px;
		background-color: lightcoral;
		color: white;
		transition-duration: 0.3s;
	}

	.timebutton:disabled,
	.timebutton:hover:disabled {
		background-color: lightgray;
	}

	.hamburger:hover,
	.timebutton:hover,
	.cat-button:hover,
	.help:hover {
		background-color: green;
	}

	.timetravel {
		color: lightseagreen;
		font-size: xx-small;
		padding: 2px;
	}

	.spacer {
		width: 1em;
	}
</style>
