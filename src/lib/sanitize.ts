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
//    it (inline `style` attributes are kept, but filtered — see below: some
//    feeds size their images that way).
const CONFIG: Config = {
	USE_PROFILES: { html: true },
	FORBID_TAGS: ['style', 'form', 'input', 'button', 'select', 'textarea']
};

// Forbidding the <style> *tag* while allowing the `style` *attribute* left the
// hole open: DOMPurify's html profile passes inline styles through untouched,
// so a summary containing
//     <a href="//evil" style="position:fixed;inset:0;z-index:99999;opacity:0">
// covers the whole viewport with an invisible link — clickjacking with no
// script involved, and nothing in .cardbody traps it (no ancestor establishes
// a containing block, so position:fixed escapes the card). The same trick with
// an inline width defeats `.cardbody :global(img) { max-width: 20% }`, since an
// inline declaration outranks a class selector.
//
// Sizing is the only thing feeds legitimately need inline styles for, so the
// attribute survives with just those declarations and nothing else. Anything
// that can position, stack, or detach an element is dropped.
const ALLOWED_STYLE_PROPS = new Set([
	'width',
	'height',
	'max-width',
	'max-height',
	'min-width',
	'min-height'
]);

// Splitting on ';' mis-parses a value that legally contains one (inside url()
// or a quoted string). That is fine here and deliberately so: a mangled
// fragment fails the allowlist and is dropped, so the parse errs closed.
function filterStyle(style: string): string {
	return style
		.split(';')
		.map((declaration) => declaration.trim())
		.filter((declaration) => {
			const colon = declaration.indexOf(':');
			if (colon < 0) return false;
			const prop = declaration.slice(0, colon).trim().toLowerCase();
			if (!ALLOWED_STYLE_PROPS.has(prop)) return false;
			// An allowed property can still be abused: `!important` beats the
			// app's own rules, and url()/expression() reach outside the value.
			const value = declaration.slice(colon + 1).toLowerCase();
			return !/!important|url\(|expression\(/.test(value);
		})
		.join('; ');
}

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
	const style = node.getAttribute('style');
	if (style === null) return;
	const filtered = filterStyle(style);
	if (filtered) node.setAttribute('style', filtered);
	else node.removeAttribute('style');
});

/** Sanitize one feed-supplied summary for rendering with {@html}. */
export function sanitizeSummary(summary: string | undefined | null): string {
	if (!summary) return '';
	return DOMPurify.sanitize(summary, CONFIG);
}
