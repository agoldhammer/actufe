export class Counter {
	map = new Map<string, number>();
	constructor() {
		// this.;
	}

	inc(entry: string) {
		const val = this.map.get(entry) || 0;
		this.map.set(entry, val + 1);
	}

	getCount(entry: string): number {
		return this.map.get(entry) || 0;
	}

	getCounts() {
		return this.map;
	}
}
