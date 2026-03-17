import { GraphqlClient, LATEST_API_VERSION, shopifyApi } from '@shopify/shopify-api';
import '@shopify/shopify-api/adapters/node';

export type ShopifyApiClient = {
	clientGQL: GraphqlClient | undefined;
};

export const shopifyApiInit = (): ShopifyApiClient => {
	let clientGQL: GraphqlClient | undefined = undefined;

	try {
		console.log('VITE_SHOPIFY_API_ACCESS_TOKEN', import.meta.env.VITE_SHOPIFY_API_ACCESS_TOKEN);
		console.log('shopify', import.meta.env.VITE_SHOPIFY_HOSTNAME);
		console.log('shopify', import.meta.env.VITE_SHOPIFY_API_SECRET);
		console.log('shopify', import.meta.env.VITE_SHOPIFY_API_KEY);
		const shopify = shopifyApi({
			apiKey: import.meta.env.VITE_SHOPIFY_API_KEY, //'731541f012c920618d3a5022be30fe06',
			apiSecretKey: import.meta.env.VITE_SHOPIFY_API_SECRET, //'369f59ea3180604c3a944640d33b6919',
			adminApiAccessToken: import.meta.env.VITE_SHOPIFY_API_ACCESS_TOKEN, //'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',
			scopes: [
				'write_products',
				'read_products',
				'write_themes',
				'read_themes',
				'write_inventory',
				'read_inventory',
				'read_locations'
			],
			hostName: import.meta.env.VITE_SHOPIFY_HOSTNAME,
			isCustomStoreApp: true,
			apiVersion: LATEST_API_VERSION,
			isEmbeddedApp: false
		});
		console.log('shopify', shopify);
		const session = shopify.session.customAppSession(import.meta.env.VITE_SHOPIFY_HOSTNAME);

		console.log('session', session);
		clientGQL = new shopify.clients.Graphql({
			session,
			apiVersion: LATEST_API_VERSION
		});
	} catch (error) {
		console.log('Error initializing Shopify!');
	}

	return { clientGQL };
};
