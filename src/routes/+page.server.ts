import { auth } from '$lib/firebase/firebase.client.js';
import { loginFormSchema } from '$lib/schema/loginSchema.js';
import { redirect } from '@sveltejs/kit';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad, RequestEvent } from './$types.js';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod(loginFormSchema))
	};
};

const signInUser = async (email: string, password: string, event: RequestEvent) => {
	const { cookies } = event;
	const { user } = await signInWithEmailAndPassword(auth, email, password);

	const userIdToken = await user.getIdToken();

	cookies.set('user', userIdToken, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 60 * 24 * 7 // 1 week
	});

	redirect(303, '/freebies');
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, zod(loginFormSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}
		const { email, password } = form.data;
		await signInUser(email, password, event);
		return {
			form
		};
	}
};
