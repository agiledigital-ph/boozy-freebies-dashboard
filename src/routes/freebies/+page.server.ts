import { auth } from '$lib/firebase/firebase.client';
import { redirect, type Actions } from '@sveltejs/kit';
import { signOut } from 'firebase/auth';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		if (request.url.includes('logout')) {
			await signOut(auth);

			cookies.delete('user', { path: '/' });

			redirect(303, '/');
		}
	}
};
