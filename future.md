# Future work

Deferred items from the code review (2026-07-24).

## ~~Sanitize article summaries rendered with `{@html}`~~ — done 2026-07-24

Summaries reaching `src/Components/ActuContent.svelte` from third-party RSS
feeds were injected as raw HTML, so a summary containing `<script>` or an event
handler such as `<img src=x onerror=...>` would have run in the logged-in
user's session — a stored-XSS vector.

They now go through `sanitizeSummary()` in `src/lib/sanitize.ts` (DOMPurify,
html profile, with form controls and `<style>` additionally forbidden) before
being rendered. Inline images — which summaries legitimately contain, and which
ActuContent styles with `max-width: 20%` — are preserved, as are links, lists,
tables and inline markup.

Covered by unit tests in `src/lib/sanitize.test.ts` and an end-to-end check in
`tests/test.ts` ("summary sanitization") that a hostile summary is defused in
the real render path.
