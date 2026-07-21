import { describe, it, expect } from 'vitest';
import { Counter } from '$lib/counter';

describe('Counter', () => {
	it('returns 0 for an entry that was never incremented', () => {
		const counter = new Counter();
		expect(counter.getCount('missing')).toBe(0);
	});

	it('counts a single increment', () => {
		const counter = new Counter();
		counter.inc('politics');
		expect(counter.getCount('politics')).toBe(1);
	});

	it('accumulates repeated increments of the same entry', () => {
		const counter = new Counter();
		counter.inc('sports');
		counter.inc('sports');
		counter.inc('sports');
		expect(counter.getCount('sports')).toBe(3);
	});

	it('tracks entries independently', () => {
		const counter = new Counter();
		counter.inc('a');
		counter.inc('b');
		counter.inc('b');
		expect(counter.getCount('a')).toBe(1);
		expect(counter.getCount('b')).toBe(2);
	});

	it('exposes all counts via getCounts', () => {
		const counter = new Counter();
		counter.inc('x');
		counter.inc('y');
		counter.inc('y');
		const counts = counter.getCounts();
		expect(counts.size).toBe(2);
		expect(counts.get('x')).toBe(1);
		expect(counts.get('y')).toBe(2);
	});
});
