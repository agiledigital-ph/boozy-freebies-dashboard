import { shopifyApiInit, type ShopifyApiClient } from '$lib/shopify/shopify.api.js';
import type { ResourceItem } from '$lib/stores/freebieFormStore';
import { json, type RequestHandler } from '@sveltejs/kit';

const { clientGQL }: ShopifyApiClient = shopifyApiInit();

const searchProduct = async (search: string, rows: number = 10) => {
	const prodQuery = 'first: $numProducts';
	const QUERY = `
      query ($numProducts: Int!) {
        products(${prodQuery}, query: "title:*${search}* AND NOT product_type:Freebie")  {
          nodes {
            id
            title
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

const getProducts = async (rows: number = 10) => {
	const prodQuery = 'first: $numProducts';
	const QUERY = `
      query ($numProducts: Int!) {     
        products(${prodQuery}, query: "NOT product_type:Freebie")  {
          nodes {
            id
            title
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
	let products: ResourceItem[] = [];
	const limit = Number(url.searchParams.get('limit')) ?? 10;
	const searchQuery = url.searchParams.get('searchQuery');

	if (searchQuery) {
		result = await searchProduct(searchQuery, limit);
	} else {
		result = await getProducts(limit);
	}

	const productsNodes = result?.products?.nodes ?? [];

	if (productsNodes.length > 0) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		products = productsNodes.map((val: any) => {
			const splittedId = val['id'].split('/');
			return {
				name: val['title'],
				id: parseInt(splittedId[splittedId.length - 1]),
				type: 'products'
			};
		});
	}
	return json({ products });
};
