import { writable } from 'svelte/store';

export type ResourceItem = {
	id: number;
	name: string;
	type: 'products' | 'collections';
	productsCount?: number;
};

export type ProductsDialogState = {
	isOpen: boolean;
	resourceType: 'products' | 'collections' | undefined;
	products: ResourceItem[];
	collections: ResourceItem[];
	selectedCollection: ResourceItem | undefined;
};

const createProductsDialogStore = (productsDialogState: ProductsDialogState) => {
	const { subscribe, update } = writable(productsDialogState);

	const open = (type: 'products' | 'collections') => {
		update(
			(productsDialogState) =>
				(productsDialogState = { ...productsDialogState, resourceType: type, isOpen: true })
		);
	};

	const close = () => {
		update(
			(productsDialogState) =>
				(productsDialogState = { ...productsDialogState, isOpen: false, products: [] })
		);
	};

	const setProducts = (products: ResourceItem[]) => {
		update(
			(productsDialogState) =>
				(productsDialogState = { ...productsDialogState, products, resourceType: 'products' })
		);
	};

	const setCollections = (collections: ResourceItem[]) => {
		update(
			(productsDialogState) =>
				(productsDialogState = { ...productsDialogState, collections, resourceType: 'collections' })
		);
	};

	const selectCollection = (collectionName: string) => {
		update((productsDialogState) => {
			const selectedCollection = productsDialogState.collections.find(
				(val) => val.name === collectionName
			);
			return { ...productsDialogState, selectedCollection };
		});
	};

	return { subscribe, open, close, setProducts, setCollections, selectCollection };
};

export const productsDialogStore = createProductsDialogStore({
	products: [],
	isOpen: false,
	resourceType: undefined,
	collections: [],
	selectedCollection: undefined
});
