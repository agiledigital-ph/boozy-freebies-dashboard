import { firestore } from '$lib/firebase/firebase.client';
import { Query, collection, getDocs, query, where, type DocumentData } from 'firebase/firestore';
import { writable } from 'svelte/store';

export type Freebie = {
	id: string;
	status: boolean;
	startDate: string;
	endDate: string;
	name: string;
	docId: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	giftItems: any[];
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	products: any[];
	minAmount: number;
	minProd: number;
	maxGift: number;
};

export type FreebiesPageState = {
	data: Freebie[];
	isLoading: boolean;
};

const createFreebiesPageStore = (freebiesPageState: FreebiesPageState) => {
	const { subscribe, update } = writable(freebiesPageState);

	const setData = (value: Freebie[]) => {
		update((freebiesPageState) => (freebiesPageState = { ...freebiesPageState, data: value }));
	};

	const seIsLoading = (value: boolean) => {
		update((freebiesPageState) => (freebiesPageState = { ...freebiesPageState, isLoading: value }));
	};

	const fetchFreebies = async (filterBy: 'All' | 'Active' | 'Draft') => {
		let q: Query<DocumentData, DocumentData>;
		switch (filterBy) {
			case 'Active':
				q = query(collection(firestore, 'freebies'), where('status', '==', true));
				break;
			case 'Draft':
				q = query(collection(firestore, 'freebies'), where('status', '==', false));
				break;
			default:
				q = query(collection(firestore, 'freebies'));
				break;
		}

		seIsLoading(true);
		const querySnapshot = await getDocs(q);
		const tempData: Freebie[] = [];
		querySnapshot.forEach((doc) => {
			const freebie: Freebie = {
				name: doc.data().name,
				giftItems: doc.data().gift_items,
				products: doc.data().products,
				minAmount: doc.data().min_amount,
				minProd: doc.data().min_prod,
				maxGift: doc.data().max_gift,
				status: doc.data().status,
				startDate: doc.data().start_date,
				endDate: doc.data().end_date,
				docId: doc.id,
				id: doc.data().id
			};
			tempData.push(freebie);
		});
		setData(tempData);
		seIsLoading(false);
	};

	return { subscribe, setData, seIsLoading, fetchFreebies };
};

export const freebiesPageStore = createFreebiesPageStore({ data: [], isLoading: false });
