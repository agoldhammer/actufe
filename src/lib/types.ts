// Shared types for the /api/articles contract, imported by the load function,
// the components, and the test fixtures so a single definition can't drift
// across the app (it previously lived in both routes/+page.ts and
// Components/ActuCtr.svelte, and the two copies had already diverged).

// Field-for-field what actuproxy sends in /api/articles. Nothing may be added
// here that the backend does not actually send: an invented `id` field once
// made every article card render as id="card-undefined" in production while
// the fixtures (which did supply an id) kept the tests green.
export interface Article {
	title: string;
	summary: string;
	pubdate: string;
	pubname: string;
	link: string;
	hash: string;
	cat: string;
}

export interface Timespan {
	start: string;
	end: string;
}

export interface Appdata {
	arts: Article[];
	count: string;
	timeframe: string;
	timespan: Timespan;
	pubnames: string[]; // sorted array of pubnames on current page
	ndocs: string;
}
