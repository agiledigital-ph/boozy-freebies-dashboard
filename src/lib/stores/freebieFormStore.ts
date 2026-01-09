import { writable } from 'svelte/store';

export type ResourceItem = {
	id: number;
	variant_id: number;
	name: string;
	img_url?: string;
	type: 'products' | 'collections';
	productsCount?: number;
};

export type ResourceType = 'products' | 'collections' | undefined;
export type DialogType = 'freebies' | 'products' | 'collections' | undefined;

export type FreebieFormState = {
	isCollectionDialogOpen: boolean;
	isProductDialogOpen: boolean;
	isFreebieDialogOpen: boolean;
	resourceType: ResourceType;
	products: ResourceItem[];
	freebies: ResourceItem[];
	collections: ResourceItem[];
	selectedCollection: ResourceItem | undefined;
	selectedProducts: ResourceItem[] | undefined;
	selectedFreebies: ResourceItem[] | undefined;
	dialogType: DialogType;
};

const createFreebieFormStore = (freebieFormState: FreebieFormState) => {
	const { subscribe, update } = writable(freebieFormState);

	const openDialog = (type: DialogType) => {
		console.log({ type });
		update((freebieFormState) => {
			freebieFormState = {
				...freebieFormState,
				isCollectionDialogOpen: type === 'collections' ? true : false,
				isProductDialogOpen: type === 'products' ? true : false,
				isFreebieDialogOpen: type === 'freebies' ? true : false
			};
			console.log({ freebieFormState });
			return freebieFormState;
		});
	};

	const closeDialog = (type: DialogType) => {
		console.log({ type });
		update(
			(freebieFormState) =>
				(freebieFormState = {
					...freebieFormState,
					isCollectionDialogOpen: false,
					isProductDialogOpen: false,
					isFreebieDialogOpen: false
				})
		);
	};

	const setProducts = (products: ResourceItem[]) => {
		update((freebieFormState) => (freebieFormState = { ...freebieFormState, products }));
	};

	const setCollections = (collections: ResourceItem[]) => {
		update((freebieFormState) => (freebieFormState = { ...freebieFormState, collections }));
	};

	const setFreebies = (freebies: ResourceItem[]) => {
		update((freebieFormState) => (freebieFormState = { ...freebieFormState, freebies }));
	};

	const setResourceType = (resourceType: ResourceType) => {
		update((freebieFormState) => (freebieFormState = { ...freebieFormState, resourceType }));
	};

	const selectCollection = (collectionName: string) => {
		update((freebieFormState) => {
			const selectedCollection = freebieFormState.collections.find(
				(val) => val.name === collectionName
			);
			return {
				...freebieFormState,
				selectedCollection,
				selectedProducts: undefined,
				resourceType: 'collections'
			};
		});
	};

	const selectProduct = (productName: string) => {
		update((freebieFormState) => {
			const selectedProduct = freebieFormState.products.find((val) => val.name === productName);

			if (!selectedProduct) return freebieFormState;

			if (freebieFormState.selectedProducts) {
				freebieFormState.selectedProducts.push(selectedProduct);
			} else {
				freebieFormState.selectedProducts = [selectedProduct];
			}

			return {
				...freebieFormState,
				selectedProducts: freebieFormState.selectedProducts,
				selectedCollection: undefined,
				resourceType: 'products'
			};
		});
	};

	const removeProduct = (productName: string) => {
		update((freebieFormState) => {
			if (!freebieFormState.selectedProducts) {
				return freebieFormState;
			}

			const newProducts = freebieFormState.selectedProducts!.filter(
				(val) => val.name !== productName
			);
			return {
				...freebieFormState,
				selectedProducts: newProducts,
				resourceType: newProducts.length > 0 ? 'products' : undefined
			};
		});
	};

	const selectFreebie = (freebieName: string) => {
		update((freebieFormState) => {
			const selectedFreebie = freebieFormState.freebies.find((val) => val.name === freebieName);

			if (!selectedFreebie) return freebieFormState;

			if (freebieFormState.selectedFreebies) {
				freebieFormState.selectedFreebies.push(selectedFreebie);
			} else {
				freebieFormState.selectedFreebies = [selectedFreebie];
			}

			return {
				...freebieFormState,
				selectedFreebies: freebieFormState.selectedFreebies
			};
		});
	};

	const removeFreebie = (freebieName: string) => {
		update((freebieFormState) => {
			if (!freebieFormState.selectedFreebies) {
				return freebieFormState;
			}

			const newProducts = freebieFormState.selectedFreebies!.filter(
				(val) => val.name !== freebieName
			);
			return {
				...freebieFormState,
				selectedFreebies: newProducts
			};
		});
	};

	const setSelectedProducts = (products: ResourceItem[] | undefined) => {
		update((freebieFormState) => {
			return {
				...freebieFormState,
				selectedProducts: products,
				selectedCollection: undefined
			};
		});
	};

	const setSelectedCollection = (collection: ResourceItem | undefined) => {
		update((freebieFormState) => {
			return {
				...freebieFormState,
				selectedProducts: undefined,
				selectedCollection: collection
			};
		});
	};

	const setSelectedFreebies = (freebies: ResourceItem[] | undefined) => {
		update((freebieFormState) => {
			return {
				...freebieFormState,
				selectedFreebies: freebies
			};
		});
	};

	// const setProductCount = (count: number) => {
	// 	update((freebieFormState) => {
	// 		return {
	// 			...freebieFormState,
	// 			products: {
	// 				...freebieFormState.products,
	// 				productsCount: count
	// 			}
	// 		};
	// 	});
	// };

	return {
		subscribe,
		openDialog,
		closeDialog,
		setProducts,
		setCollections,
		selectCollection,
		selectProduct,
		removeProduct,
		setResourceType,
		setSelectedProducts,
		setSelectedCollection,
		setFreebies,
		selectFreebie,
		setSelectedFreebies,
		removeFreebie
		// setProductCount
	};
};

export const freebieFormStore = createFreebieFormStore({
	products: [],
	isCollectionDialogOpen: false,
	isProductDialogOpen: false,
	isFreebieDialogOpen: false,
	resourceType: undefined,
	collections: [],
	selectedCollection: undefined,
	selectedProducts: undefined,
	dialogType: undefined,
	freebies: [],
	selectedFreebies: undefined
});
