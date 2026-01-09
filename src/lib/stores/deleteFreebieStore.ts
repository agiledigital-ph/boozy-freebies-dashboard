import { writable } from 'svelte/store';
import type { Freebie } from './freebiesPageStore';

export type DeleteFreebieState = {
	freebie: Freebie | null;
	isOpen: boolean;
};

const createDeleteFreebieStore = (deleteFreebieState: DeleteFreebieState) => {
	const { subscribe, update } = writable(deleteFreebieState);

	const open = (value: Freebie) => {
		update(
			(deleteFreebieState) =>
				(deleteFreebieState = { ...deleteFreebieState, freebie: value, isOpen: true })
		);
	};

	const close = () => {
		update(
			(deleteFreebieState) =>
				(deleteFreebieState = { ...deleteFreebieState, isOpen: false, freebie: null })
		);
	};

	return { subscribe, open, close };
};

export const deleteFreebieStore = createDeleteFreebieStore({
	freebie: null,
	isOpen: false
});
