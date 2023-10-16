<script lang="ts">
	import { goto } from '$app/navigation';
	import { time_window_store } from '$lib/actustores';
	export let timeframe: string;
	$: flag = timeframe === '0' ? true : false;

	function disableFwd() {
		return timeframe === '0' ? true : false;
	}

	let textQueryVisible = false;

	const handleTextReqBtnClick = () => {
		// console.log('Handling hamburger');
		//@ts-ignore
		// document.getElementById('pagecontent').scrollTop = 0;
		textQueryVisible = true;
	};
	// @ts-ignore
	const handleTimeBtnClick = (event) => {
		// console.log('handleTimeBtnClick', event.target.value);
		const tw = $time_window_store;
		if (event.target.value === 'back') {
			const newframe = +timeframe + 1;
			goto(`/?timeframe=${newframe}&timewindow=${tw}`);
		} else {
			let newframe = +timeframe - 1;
			newframe = newframe < 0 ? 0 : newframe;
			goto(`/?timeframe=${newframe}&timewindow=${tw}`);
		}
		// scroll back to top after time travel
		// @ts-ignore
		document.getElementById('pagecontent').scrollTop = 0;
	};
	// @ts-ignore
	const textQuerySubmit = (event) => {
		const elt = document.getElementById('txtqry') as HTMLTextAreaElement;
		const text = elt.value;
		console.log('submit', text);
		textQueryVisible = false;
	};

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

	// @ts-ignore
	function twinChange(event) {
		const twin = event.target.value;
		// console.log('twinchange', twin);
		time_window_store.set(twin);
		goto(`/?timewindow=${twin}`);
	}

	const fwdBtnTip = 'Next time frame';
	const backBtnTip = 'Prev time frame';
	$: tval = $time_window_store.toString() ?? '3';
	const twinTip = 'Select time frame';
</script>

<div class="actu-hdr">
	{#if textQueryVisible}
		<!-- svelte-ignore a11y-autofocus -->
		<textarea
			name="txtqry"
			placeholder="Type one or more search terms separated by spaces"
			autofocus
			id="txtqry"
			cols="30"
			rows="4"
			value=""
		/>
		<button type="button" class="textqrysubmit" on:click|preventDefault={textQuerySubmit}
			>Submit</button
		>
	{:else}
		<!-- TODO: hamburger button, for now is just HOME button-->
		<button class="textreq" type="button" on:click|preventDefault={handleTextReqBtnClick}
			>Text Query</button
		>
		<!-- <div class="spacer" /> -->
		<label for="twin">Time window:</label>
		<select
			class="tsel"
			bind:value={tval}
			use:tooltip={{ content: twinTip, theme: 'material', animation: 'fade' }}
			name="twindow"
			id="twin"
			on:change={twinChange}
		>
			<option value="3">3 hrs</option>
			<option value="6">6 hrs</option>
			<option value="12">12 hrs</option>
			<option value="24">24 hrs</option>
		</select>

		<!-- <div class="spacer" /> -->
		<!-- time buttons -->
		<!-- back button -->
		<div class="time">
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
		</div>
		<!-- help button -->
		<!-- <div class="spacer" /> -->
		<button class="help" type="button" on:click|preventDefault={() => goto('/about')}>Help</button>
	{/if}
</div>

<style>
	.actu-hdr {
		display: flex;
		flex-wrap: wrap;
		flex-direction: row;
		align-items: center;
		gap: 1em;
		width: inherit;
		padding: 5px;
	}

	.textreq,
	.timebutton,
	.textqrysubmit,
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

	label {
		font-size: xx-small;
		color: lightseagreen;
	}
	.tsel {
		background-color: lightcoral;
		color: white;
		border: 2px solid black;
		border-radius: 8px;
		font-size: small;
	}

	.textreq:hover,
	.timebutton:hover,
	/* .cat-button:hover, */
	.help:hover {
		background-color: green;
	}

	.timetravel {
		color: lightseagreen;
		font-size: xx-small;
		padding: 2px;
	}
</style>
