import DOMPurify from 'dompurify';
import type { Config } from 'dompurify';

// Article summaries are HTML fragments that originate in third-party
// publication RSS feeds, not in this app, so they are rendered with {@html}
// only after sanitization: a summary carrying <script> or an event handler
// (`<img src=x onerror=...>`) would otherwise run in the reader's session.
//
// The stock html profile already drops <script>, on* handlers, javascript:
// URLs, <iframe> and everything outside plain HTML (SVG/MathML), while keeping
// what summaries legitimately use: <img> (see the img sizing rule in
// ActuContent), links, lists, tables and inline markup. On top of that:
//
//  - form controls are forbidden — a feed has no business rendering an input
//    the reader might type into;
//  - <style> is forbidden because a summary must not restyle the page around
//    it (inline `style` attributes are kept: some feeds size their images
//    that way).
const CONFIG: Config = {
	USE_PROFILES: { html: true },
	FORBID_TAGS: ['style', 'form', 'input', 'button', 'select', 'textarea']
};

/** Sanitize one feed-supplied summary for rendering with {@html}. */
export function sanitizeSummary(summary: string | undefined | null): string {
	if (!summary) return '';
	return DOMPurify.sanitize(summary, CONFIG);
}
