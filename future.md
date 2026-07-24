# Future work

Deferred items from the code review (2026-07-24).

## Sanitize article summaries rendered with `{@html}`

**Where:** `src/Components/ActuContent.svelte` — `{@html article.summary}`.

**Issue:** Article summaries are injected as raw HTML. The inline comment calls
the actuproxy feed "trusted," but those summaries ultimately originate from
third-party publication RSS feeds. A summary containing `<script>` or an event
handler such as `<img src=x onerror=...>` executes in the logged-in user's
session — a stored-XSS vector.

**Current blast radius:** small — single-user dev tool behind a gate, and the
login page itself says "not a public website / development use only." But
"the feed is trusted" is a strong assumption for content the app does not
author.

**Fix when it matters (e.g. if the audience ever widens):**
- Run summaries through a sanitizer (DOMPurify) before rendering, or
- Strip `<script>` and event-handler attributes at the actuproxy layer so the
  frontend never receives active content.

Keep the `img { max-width: 20% }` styling in mind — whatever sanitization is
chosen must still allow the inline images that summaries legitimately contain.
