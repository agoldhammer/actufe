# UI improvement suggestions

Analysis from a review of the front-end components (`ActuCtr`, `ActuHdr`, `ActuContent`,
`ActuSidebar`, `ActuCats`, `ActuFtr`), 2026-07-20. Roughly ordered by impact.

## 1. Unify the color scheme

Every region has its own border color (blue pagewrapper, magenta sidebar, orange header and
footer, black cats bar), and text colors are scattered — lightsalmon sidebar labels, red
timespan, cyan pubdates, red categories, green content. It reads like layout scaffolding left
visible. Pick one accent color (e.g. the `#9a031e` from card titles, or the header-bar blue)
plus a neutral gray for borders. Several current combinations also fail contrast: lightsalmon
and xx-small text on a light background is genuinely hard to read.

## 2. Bump the small font sizes

Almost all the chrome (sidebar, footer, cats bar, header) is `xx-small`/`x-small` (~9–10px) —
below comfortable reading size, especially on a phone. Card headers are `x-large`. Flatten to
roughly 0.75rem–1.15rem, using `rem` so the user's browser font-size setting is respected.

## 3. Make selected categories visibly selected

In `ActuCats.svelte`, a selected chip is lightsalmon-on-blue vs. white-on-blue — easy to miss,
and `cursor: zoom-in` is an unusual affordance. Use styled toggle pills (filled background when
selected, an ✕ or checkmark). Two related fixes:

- The click handler sets `style.color` directly, which fights Svelte-driven rendering.
- The chips are plain `div`s with click handlers (hence the `svelte-ignore a11y` comments);
  making them `<button>`s gets keyboard support for free.

## 4. Search needs an exit and a visible state

Clicking Query replaces the whole header with a textarea with no Cancel or Escape — you must
submit something. Once a text query is active, nothing shows what was searched or lets you
clear it. An active-query chip ("search: macron ✕") near the header fixes both.

## 5. Show the timespan where the time controls are

The Start/End of the current window lives in the footer in xx-small red text, but it's the key
context for the Time Travel buttons. Move a compact "Jul 20, 06:00 – 09:00" next to the
arrows; the footer keeps doc counts and version.

## 6. Add an empty state

If category + publisher filters exclude everything (or a query matches nothing), the content
pane goes blank. Add "No articles match the current filters" with a reset link.

## Smaller items

- **Sidebar All/None desync**: unchecking individual publishers leaves the "All/None" box
  checked; derive it from `$selected_pubs_store.length === pubnames.length`.
- **Make the headline the link.** Titles sit next to a small "↪ Continue reading…" link;
  making the title itself clickable matches news-site convention (keep the small link too).
- **Soften the card shadows** — `8px 8px #c1bebe` hard-edged shadows on header and body are
  heavy; `box-shadow: 0 2px 6px rgba(0,0,0,0.15)` looks lighter without losing the card feel.
- **Scope the image rule.** `:global(img) { max-width: 20% }` in `ActuContent.svelte` applies
  to every image in the app, including the header logo; use `.cardbody :global(img)`.
- **Mobile layout**: the two-column grid keeps the sidebar as a permanent left rail. On narrow
  screens, hide it behind a "Filters" toggle via media query so the article column gets full
  width.

## Suggested first batch

Color/typography cleanup plus the category chips — that's where the visual payoff is
concentrated. Only the search-cancel and All/None items change behavior.
