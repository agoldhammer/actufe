// DOMPurify needs a real DOM to parse into; the rest of the unit suite runs in
// the default node environment.
// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { sanitizeSummary } from './sanitize';

describe('sanitizeSummary', () => {
	it('drops script elements but keeps their surrounding text', () => {
		expect(sanitizeSummary('before<script>alert(1)</script>after')).toBe('beforeafter');
	});

	it('strips event-handler attributes', () => {
		expect(sanitizeSummary('<img src="x" onerror="alert(1)">')).toBe('<img src="x">');
		expect(sanitizeSummary('<p onclick="alert(1)">text</p>')).toBe('<p>text</p>');
	});

	it('neutralizes javascript: links', () => {
		expect(sanitizeSummary('<a href="javascript:alert(1)">click</a>')).toBe('<a>click</a>');
	});

	it('removes iframes, style blocks and form controls', () => {
		expect(sanitizeSummary('<iframe src="http://evil"></iframe>ok')).toBe('ok');
		expect(sanitizeSummary('<style>body{display:none}</style>ok')).toBe('ok');
		expect(sanitizeSummary('<form action="/x"><input name="p"></form>ok')).toBe('ok');
	});

	// The point of the app is to render feed summaries, so sanitizing must not
	// eat the markup they actually use — inline images above all (ActuContent
	// styles them with `.cardbody :global(img) { max-width: 20% }`).
	it('preserves images, links and ordinary markup', () => {
		const summary =
			'<p>Lead <a href="https://example.com/story">story</a> <em>emphasis</em></p>' +
			'<img src="https://example.com/photo.jpg" alt="photo" width="600">' +
			'<ul><li>one</li></ul><blockquote>quoted</blockquote>';
		expect(sanitizeSummary(summary)).toBe(summary);
	});

	it('keeps inline styles, which some feeds use to size their images', () => {
		expect(sanitizeSummary('<img src="p.jpg" style="width:200px;">')).toContain('style');
		expect(sanitizeSummary('<img src="p.jpg" style="max-width:100%">')).toContain('max-width');
		expect(sanitizeSummary('<img src="p.jpg" style="width:200px; height:100px">')).toContain(
			'height'
		);
	});

	// Forbidding <style> while passing the `style` attribute through untouched
	// still let a summary escape its card: position/inset/z-index turn a link
	// into a full-viewport invisible overlay. Sizing is all a feed needs.
	it('strips style declarations that could position or stack an element', () => {
		expect(
			sanitizeSummary(
				'<a href="https://evil.com" style="position:fixed;inset:0;z-index:99999">z</a>'
			)
		).toBe('<a href="https://evil.com">z</a>');
		expect(sanitizeSummary('<div style="transform:scale(50)">x</div>')).toBe('<div>x</div>');
		expect(sanitizeSummary('<div style="display:none">x</div>')).toBe('<div>x</div>');
	});

	it('rejects !important, url() and expression() even on an allowed property', () => {
		expect(sanitizeSummary('<img src="p.jpg" style="width:2000px !important">')).toBe(
			'<img src="p.jpg">'
		);
		expect(sanitizeSummary('<div style="width:expression(alert(1))">x</div>')).toBe('<div>x</div>');
		expect(sanitizeSummary('<div style="width:100px;background:url(//evil/t)">x</div>')).toBe(
			'<div style="width:100px">x</div>'
		);
	});

	it('returns an empty string for a missing summary', () => {
		expect(sanitizeSummary(undefined)).toBe('');
		expect(sanitizeSummary('')).toBe('');
	});
});
