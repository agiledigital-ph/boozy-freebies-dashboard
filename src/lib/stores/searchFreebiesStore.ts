import { writable } from 'svelte/store';

export type SearchFreebiesState = {
	query: string;
};

const createSearchFreebiesStore = (searchFreebiesState: SearchFreebiesState) => {
	const { subscribe, update } = writable(searchFreebiesState);

	const setQuery = (value: string) => {
		update(
			(SearchFreebiesState) => (SearchFreebiesState = { ...SearchFreebiesState, query: value })
		);
	};

	return { subscribe, setQuery };
};

export const searchFreebiesStore = createSearchFreebiesStore({
	query: ''
});
