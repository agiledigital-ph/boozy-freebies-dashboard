import { redirect, type Handle } from '@sveltejs/kit';
import process from 'process';

export const handle: Handle = async ({ event, resolve }) => {
	const { cookies } = event;
	const user = cookies.get('user');

	if (event.url.pathname.startsWith('/freebies') && !user) {
		throw redirect(303, '/');
	}

	const response = await resolve(event);

	return response;
};

process.on('SIGINT', () => {
	process.exit();
});
process.on('SIGTERM', () => {
	process.exit();
});
