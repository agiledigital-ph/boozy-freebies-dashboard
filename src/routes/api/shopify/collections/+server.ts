import { shopifyApiInit, type ShopifyApiClient } from '$lib/shopify/shopify.api.js';
import type { ResourceItem } from '$lib/stores/productsDialogStore';
import { error, json, type RequestHandler } from '@sveltejs/kit';
import { inspect } from 'util';

const { clientGQL }: ShopifyApiClient = shopifyApiInit();

const searchCollections = async (
	search: string,
	cursor: string | null = null,
	move: boolean = false,
	rows: number = 10
) => {
	console.log('cursor', cursor);
	console.log('search', search);
	const collectionQuery = move
		? 'first: $numProducts, after: $cursor'
		: 'last: $numProducts, before: $cursor';
	const QUERY = `
      query ($numProducts: Int!, $cursor: String) {     
        collections(${collectionQuery}, query: "title:*${search}* AND NOT product_type:Freebie")  {
          edges {
            node {
              id
              title
              productsCount {
                count
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
            startCursor
            hasPreviousPage
          }
        }
      }
    `;

	const variables = {
		numProducts: rows,
		cursor
	};
	const productsQuery = await clientGQL?.request(QUERY, { variables });

	return productsQuery?.data;
};

export const POST: RequestHandler = async (event) => {
	const { searchTxt, cursor, isNext } = await event.request.json();
	let collections: ResourceItem[] = [];

	const result = await searchCollections(searchTxt, cursor, isNext);

	console.log(`getSearchCollections result ${inspect(result)}`);

	if (!result) {
		return error(500, { message: 'Internal server error' });
	}

	if (result.collections.edges.length) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		collections = result.collections.edges.map((val: any) => {
			const splittedId = val.node['id'].split('/');
			return {
				name: val.node['title'],
				id: parseInt(splittedId[splittedId.length - 1]),
				type: 'collections',
				productsCount: val.node['productsCount']['count']
			};
		});
	}
	return json({
		collections
	});
};
