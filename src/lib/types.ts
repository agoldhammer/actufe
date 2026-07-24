// Shared types for the /api/articles contract, imported by the load function,
// the components, and the test fixtures so a single definition can't drift
// across the app (it previously lived in both routes/+page.ts and
// Components/ActuCtr.svelte, and the two copies had already diverged).

export interface Article {
	id: string;
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
