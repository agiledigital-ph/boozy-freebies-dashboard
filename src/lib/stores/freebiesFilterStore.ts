import { writable } from 'svelte/store';

export type FreebiesFilterState = {
	filterBy: 'All' | 'Active' | 'Draft';
	isLoading: boolean;
};

const createFreebiesFilterStore = (freebiesFilterState: FreebiesFilterState) => {
	const { subscribe, update } = writable(freebiesFilterState);

	const setFilterBy = (value: 'All' | 'Active' | 'Draft') => {
		update(
			(freebiesFilterState) => (freebiesFilterState = { ...freebiesFilterState, filterBy: value })
		);
	};

	const seIsLoading = (value: boolean) => {
		update(
			(freebiesFilterState) => (freebiesFilterState = { ...freebiesFilterState, isLoading: value })
		);
	};

	return { subscribe, setFilterBy, seIsLoading };
};

export const freebiesFilterStore = createFreebiesFilterStore({
	filterBy: 'Active',
	isLoading: false
});
