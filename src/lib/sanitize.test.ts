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
	});

	it('returns an empty string for a missing summary', () => {
		expect(sanitizeSummary(undefined)).toBe('');
		expect(sanitizeSummary('')).toBe('');
	});
});
