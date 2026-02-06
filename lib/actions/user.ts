'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { User, UserState } from '../schemas/user';
import { z } from 'zod';
import { getSession, getMethodWithoutSession, getMethod, postMethod } from './utils';
import { errorMonitor } from 'events';
import { unstable_cache } from 'next/cache'
import { revalidateTag } from 'next/cache'
import { headers } from 'next/headers'
import { cacheTag } from 'next/dist/server/use-cache/cache-tag';

/* FormSchemas for validating each form parameter with an specific error before post on actual server */
const PostUserFormSchema = z.object({
	name: z.string().nonempty({ message: 'Ingresa un nombre' }),
	email: z.string().email({ message: 'Formato de email incorrecto' }),
	password: z
		.string()
		.min(6, { message: 'La contraseña al menos debe tener 6 caracteres' }),
	// .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
	// .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
	// .regex(/[0-9]/, { message: "Password must contain at least one number" })
	// .regex(/[\W_]/, { message: "Password must contain at least one special character" }),
});

/**
 * @title Register user! Posting to api user/register
 * @param prevState - Previous state of the form, useful for setting state
 * @param formData - Form data for registering
 * @returns error messages based on the failing form, otherwise return data, and redirects to dashboard/mapa
 */
export async function register(prevState: UserState, formData: FormData) {
	const url = 'user/register';

	const validatedData = PostUserFormSchema.safeParse({
		name: formData.get('name'),
		email: formData.get('email'),
		password: formData.get('password'),
	});

	if (!validatedData.success) {
		return {
			errors: validatedData.error.flatten().fieldErrors,
			message: 'Missing fields.',
			// Preserve the submitted values
			formData: {
				name: formData.get('name') as string,
				email: formData.get('email') as string,
				password: formData.get('password') as string,
			},
		};
	}

	try {
		await postMethod<User>(url, validatedData.data, false);

		try {
			const signInData = {
				email: formData.get('email'),
				password: formData.get('password'),
			};

			await signIn('credentials', signInData);
		} catch (error: any) {
			if (error.statusCode === 401 && error.message === 'Invalid username') {
				return {
					errors: { email: ['This email is already registered'] },
					message: 'Email already exists.',
					formData: {
						name: formData.get('name') as string,
						email: formData.get('email') as string,
						password: formData.get('password') as string,
					},
				};
			}
		}
	} catch (registrationError: any) {
		if (
			registrationError.statusCode === 401 &&
			registrationError.message === 'Invalid username'
		) {
			return {
				errors: { email: ['Este email está en uso'] },
				message: 'Email already exists.',
				formData: {
					name: formData.get('name') as string,
					email: formData.get('email') as string,
					password: formData.get('password') as string,
				},
			};
		}

		// Handle other registration errors
		return {
			errors: { email: ['Algo salió mal.'] },
			message: 'Something went wrong.',
			formData: {
				name: formData.get('name') as string,
				email: formData.get('email') as string,
				password: formData.get('password') as string,
			},
		};
	}

	// Only redirect if everything succeeded
	revalidatePath('/dashboard/mapa');
	redirect('/dashboard/mapa');
}

/**
 * @title Get user profile including Balance
 * @returns User obejct
 */
export async function getProfile(): Promise<User> {
	const url = 'user/profile';
	const session = await getSession();

	const getProfile = unstable_cache(async () => {
		return await getMethodWithoutSession<User>(url, session);
	},
		['user-profile'],
		{ revalidate: 3600, tags: ['user'] }
	);

	return await getProfile();
}


// TODO THIS IS WRONG
// Rule: Revalidate immediately after mutations that change the data, not "when you need it later."
// the user cannot be mutated yet
export async function revalidateUser() {
	revalidateTag('user'); // get user from api!
}