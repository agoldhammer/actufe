<!-- <script lang="ts">
	import ActuHdr from '$comp/ActuHdr.svelte';
</script> -->

<h1>How to use this newsreader</h1>

<div>
	<h2>Time travel</h2>
	<p>
		In the navigation bar at the top, there is a time window dropdown and two time travel buttons.
	</p>

	<p>
		The time window dropdown selects the displayed timeframe. The default window starts 3 hours
		before the present time, but this can be widened to 6, 12, or 24 hours. The start and end times
		of the currently selected window are displayed in the page footer.
	</p>
	<p>
		Pressing the time travel buttons will move the display forward or backward in time by the amount
		of the time window currently selected time window. The forward button will be disabled (grayed
		out) if the display is already at the latest available time in the database. The 'hamburger'
		menu at the left of the navbar will return the display to the top of the screen.
	</p>

	<h2>Select Categories</h2>

	<p>
		Each article is classified by artificial intelligence in one of several categories. These are
		enumerated in the blue box under the navigation bar. Clicking on a category will change the
		color of the category name from white to salmon and display only articles classified in that
		category. Clicking on another category will select that category and deselect all others
		(multiple category selection is not currently available).
	</p>
	<h2>Select Publications</h2>

	<p>
		The sidebar contains a list of publication names. Checking/unchecking the box will display/hide
		articles from the named publication.
	</p>

	<p>The All/None checkbox at the top of the sidebar will display/hide all publications.</p>

	<h2>Collapse Summaries</h2>
	<p>The 'No summary' checkbox will hide article summaries for quicker scanning of headlines.</p>
</div>

<style>
	h1 {
		margin-top: 50px;
	}
</style>
