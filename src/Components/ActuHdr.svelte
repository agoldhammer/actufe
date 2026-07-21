<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import { time_window_store } from '$lib/actustores';
	import logo from '$lib/images/nooze-logo.png';
	export let timeframe: string;
	$: flag = timeframe === '0' ? true : false;
	$: activeQuery = $page.url.searchParams.get('txtquery');

	let textQueryVisible = false;

	const handleTextReqBtnClick = () => {
		textQueryVisible = true;
	};

	const takeydown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			textQuerySubmit();
		} else if (event.key === 'Escape') {
			event.preventDefault();
			textQueryVisible = false;
		}
	};
	const gotoQuery = (params: Record<string, string>) => {
		goto(`${base}/?${new URLSearchParams(params)}`);
	};
	const handleTimeBtnClick = (event: Event) => {
		const tw = $time_window_store;
		let newframe;
		if ((event.currentTarget as HTMLButtonElement).value === 'back') {
			newframe = +timeframe + 1;
		} else {
			newframe = +timeframe - 1;
			newframe = newframe < 0 ? 0 : newframe;
		}
		gotoQuery({ timeframe: `${newframe}`, timewindow: `${tw}` });
		// scroll back to top after time travel
		const pagecontent = document.getElementById('pagecontent');
		if (pagecontent) pagecontent.scrollTop = 0;
	};
	const textQuerySubmit = () => {
		const elt = document.getElementById('txtqry') as HTMLTextAreaElement;
		const text = elt.value;
		// console.log('submit', text);
		textQueryVisible = false;
		if (text.length > 0) {
			const tw = $time_window_store;
			gotoQuery({ timeframe, timewindow: `${tw}`, txtquery: text });
		}
	};

	const clearQuery = () => {
		gotoQuery({ timeframe, timewindow: `${$time_window_store}` });
	};

	import tippy, { type Props } from 'tippy.js';
	import 'tippy.js/dist/tippy.css';
	import 'tippy.js/themes/material.css';

	function tooltip(node: HTMLElement, options: Partial<Props>) {
		const instance = tippy(node, options);
		return {
			update(newOptions: Partial<Props>) {
				instance.setProps(newOptions);
			},
			destroy() {
				instance.destroy();
			}
		};
	}

	function twinChange(event: Event) {
		const twin = (event.currentTarget as HTMLSelectElement).value;
		time_window_store.set(parseInt(twin));
		gotoQuery({ timeframe, timewindow: twin });
	}

	const fwdBtnTip = 'Next time frame';
	const backBtnTip = 'Prev time frame';
	$: tval = $time_window_store.toString() ?? '3';
	const twinTip = 'Select time frame size';
	const txtQryTip = 'Search for keywords in selected time window';
</script>

<div class="actu-hdr">
	{#if textQueryVisible}
		<!-- svelte-ignore a11y-autofocus -->
		<textarea
			name="txtqry"
			on:keydown={takeydown}
			placeholder="Type one or more search terms separated by spaces"
			autofocus
			id="txtqry"
			cols="30"
			rows="2"
			value={activeQuery ?? ''}
		/>
		<button type="button" class="textqrysubmit" on:click|preventDefault={textQuerySubmit}
			>Submit</button
		>
		<button
			type="button"
			class="textqrycancel"
			on:click|preventDefault={() => (textQueryVisible = false)}>Cancel</button
		>
	{:else}
		<!-- <label for="twin">Window:</label> -->
		<img src={logo} alt="Nooze logo" width="40" height="40" />
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

		<div class="time">
			<button
				class="timebutton"
				type="button"
				use:tooltip={{ content: backBtnTip, theme: 'material', animation: 'fade' }}
				value="back"
				on:click|preventDefault={handleTimeBtnClick}>&#8678</button
			>
			<div class="tt">
				<span class="timetravel">Time</span>
				<span class="timetravel">Travel</span>
			</div>
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
		<button
			class="textreq"
			type="button"
			use:tooltip={{ content: txtQryTip, theme: 'material', animation: 'fade' }}
			on:click|preventDefault={handleTextReqBtnClick}>Query</button
		>
		{#if activeQuery}
			<button
				type="button"
				class="query-chip"
				use:tooltip={{ content: 'Clear this search', theme: 'material', animation: 'fade' }}
				on:click|preventDefault={clearQuery}
			>
				search: {activeQuery} <span aria-hidden="true">&#10005;</span>
			</button>
		{/if}
		<!-- help button -->
		<button class="help" type="button" on:click|preventDefault={() => goto(`${base}/about`)}
			>Help</button
		>
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
		padding: 3px;
		font-size: 0.8rem;
	}

	.textreq,
	.timebutton,
	.textqrysubmit,
	.textqrycancel,
	.help {
		height: 85%;
		border: none;
		border-radius: 8px;
		background-color: var(--accent);
		color: white;
		font-size: 0.8rem;
		padding: 4px 8px;
		cursor: pointer;
		transition-duration: 0.3s;
	}

	.timebutton {
		font-size: 0.9rem;
	}

	.timebutton:disabled,
	.timebutton:hover:disabled {
		background-color: lightgray;
		cursor: default;
	}

	.tsel {
		background-color: var(--accent);
		color: white;
		border: 1px solid var(--border);
		border-radius: 8px;
		font-size: 0.8rem;
	}

	.textqrycancel {
		background-color: #fff;
		border: 1px solid var(--border);
		color: var(--text-muted);
	}

	.textreq:hover,
	.timebutton:hover,
	.textqrysubmit:hover,
	/* .cat-button:hover, */
	.help:hover {
		background-color: var(--accent-dark);
	}

	.textqrycancel:hover {
		background-color: var(--accent-soft);
	}

	.query-chip {
		border: none;
		border-radius: 999px;
		background-color: var(--accent);
		color: #fff;
		font-size: 0.8rem;
		padding: 3px 10px;
		cursor: pointer;
		white-space: nowrap;
	}

	.query-chip:hover {
		background-color: var(--accent-dark);
	}

	.time {
		display: flex;
		flex-direction: column;
	}

	.timetravel {
		color: var(--text-muted);
		font-size: 0.7rem;
		padding: 2px;
	}
</style>
