import { shopifyApiInit, type ShopifyApiClient } from '$lib/shopify/shopify.api';
import type { ResourceItem } from '$lib/stores/productsDialogStore';
import type { PageServerLoad } from './$types';

const { clientGQL }: ShopifyApiClient = shopifyApiInit();

const getCollections = async (rows: number = 10) => {
	const collectionQuery = 'first: $numProducts';
	const QUERY = `
      query ($numProducts: Int!) {     
        collections(${collectionQuery})  {
          edges {
            node {
              id
              title
              productsCount {
                count
              }
            }
          }
        }
      }
    `;

	const variables = {
		numProducts: rows
	};
	const productsQuery = await clientGQL?.request(QUERY, { variables });

	return productsQuery?.data;
};

export const load: PageServerLoad = async ({ fetch }) => {
	let collections: ResourceItem[] = [];
	let products: ResourceItem[] = [];
	let freebies: ResourceItem[] = [];
	const collectionsResult = await getCollections();
	const productsResult = await fetch('/api/shopify/products?limit=10');
	const freebiesResult = await fetch('/api/shopify/freebies?limit=10');

	if (productsResult) {
		const productsResultData = await productsResult.json();
		products = productsResultData.products ?? [];
	}

	if (freebiesResult) {
		const freebiesResultData = await freebiesResult.json();
		freebies = freebiesResultData.freebies ?? [];
	}

	const collectionsEdges = collectionsResult?.collections?.edges ?? [];
	if (collectionsEdges.length > 0) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		collections = collectionsEdges.map((val: any) => {
			const splittedId = val.node['id'].split('/');
			return {
				name: val.node['title'],
				id: parseInt(splittedId[splittedId.length - 1]),
				type: 'collections',
				productsCount: val.node['productsCount']['count']
			};
		});
	}
	return {
		collections,
		products,
		freebies
	};
};
