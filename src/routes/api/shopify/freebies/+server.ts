import { shopifyApiInit, type ShopifyApiClient } from '$lib/shopify/shopify.api.js';
import type { ResourceItem } from '$lib/stores/freebieFormStore';
import { formatId } from '$lib/utils';
import { json, type RequestHandler } from '@sveltejs/kit';

const { clientGQL }: ShopifyApiClient = shopifyApiInit();

const getSearchFreebie = async (
	search: string,
	cursor: string | null = null,
	move: boolean = false,
	rows: number = 10
) => {
	const prodQuery = move
		? 'first: $numProducts, after: $cursor'
		: 'last: $numProducts, before: $cursor';
	const QUERY = `
      query ($numProducts: Int!, $cursor: String) {     
        products(${prodQuery}, query: "title:*${search}* AND product_type:Freebie")  {
          nodes {
            id
            title
						featuredImage{
              url
            }  
						productType
						variants(first: 1) {
              nodes { 
								id
								sku 
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

const searchFreebie = async (search: string, rows: number = 10) => {
	const prodQuery = 'first: $numProducts';
	const QUERY = `
      query ($numProducts: Int!) {
        products(${prodQuery}, query: "title:*${search}* AND product_type:Freebie")  {
          nodes {
            id
            title
						featuredImage{
							url
						}
						variants(first: 1){
              nodes {
                id
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

const getFreebies = async (rows: number = 10) => {
	const prodQuery = 'first: $numProducts';
	const QUERY = `
      query ($numProducts: Int!) {     
        products(${prodQuery}, query: "product_type:Freebie")  {
          nodes {
            id
            title
						featuredImage{
							url
						}
						variants(first: 1){
              nodes {
                id
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

export const GET: RequestHandler = async ({ url }) => {
	let result;
	let freebies: ResourceItem[] = [];
	const limit = Number(url.searchParams.get('limit')) ?? 10;
	const searchQuery = url.searchParams.get('searchQuery');

	if (searchQuery) {
		result = await searchFreebie(searchQuery, limit);
	} else {
		result = await getFreebies(limit);
	}

	console.log({ result: result.products['nodes'] });

	if (result.products['nodes'].length > 0) {
		const productsResultData = result.products.nodes;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		freebies = productsResultData.map((val: any) => {
			const splittedId = val['id'].split('/');
			const splittedVariantId = formatId(val['variants']['nodes'][0]['id']);

			return {
				name: val['title'],
				id: parseInt(splittedId[splittedId.length - 1]),
				type: 'freebies',
				variant_id: splittedVariantId,
				img_url: val['featuredImage'] ? val['featuredImage']['url'] : ''
			};
		});
	}
	return json({ freebies });
};

export const POST: RequestHandler = async (event) => {
	const { searchTxt, cursor, isNext } = await event.request.json();
	const result = await getSearchFreebie(searchTxt, cursor, isNext);
	let data;
	if (result.products.nodes.length) {
		data = {
			products: result.products.nodes,
			pageInfo: result.products.pageInfo
		};
	}
	return json(data);
};
