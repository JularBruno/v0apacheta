'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { signIn, signOut } from '@/auth';
import { User, UserState, NotificationFrequency } from '../schemas/user';
import { z } from 'zod';
import { getSession, getMethodWithoutSession, postMethod, putMethod } from './utils';

const PostUserFormSchema = z.object({
	name: z.string().nonempty({ message: 'Ingresa un nombre' }),
	email: z.string().email({ message: 'Formato de email incorrecto' }),
	password: z
		.string()
		.min(6, { message: 'La contraseña al menos debe tener 6 caracteres' })
		.max(50, { message: 'La contraseña debe tener 50 caracteres o menos' }),
});

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
			formData: {
				name: formData.get('name') as string,
				email: formData.get('email') as string,
				password: formData.get('password') as string,
			},
		};
	}

	const notificationFrequency = (formData.get('notificationFrequency') as NotificationFrequency) ?? 'daily';
	const mapLevel = (formData.get('mapLevel') as string) ?? '1.0';

	try {
		await postMethod<User>(url, { ...validatedData.data, notificationFrequency, mapLevel }, false);

		try {
			await signIn('credentials', {
				email: formData.get('email'),
				password: formData.get('password'),
			});
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
		console.log('registrationError ', registrationError);

		if (
			registrationError.statusCode === 409
			|| registrationError.message === 'NEXT_REDIRECT'
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

		return {
			errors: { email: ['Algo salió mal.'] },
			message: 'Something went wrong. ',
			formData: {
				name: formData.get('name') as string,
				email: formData.get('email') as string,
				password: formData.get('password') as string,
			},
		};
	}

	revalidatePath('/dashboard/mapa');
	redirect('/dashboard/mapa');
}

/** State for the "forgot password" form — no field errors, just a message. */
export type ForgotPasswordState = {
	message?: string | null;
	success?: boolean;
};

/**
 * @title Request a password-reset email
 * @notes POST /v1/user/forgot-password — no auth. The API always answers 201
 *   with the same generic message whether or not the email is registered, so
 *   the frontend must never distinguish the two cases (that would leak which
 *   emails exist). Only a real transport/server failure gets a different message.
 */
export async function forgotPassword(
	prevState: ForgotPasswordState,
	formData: FormData,
): Promise<ForgotPasswordState> {
	const email = formData.get('email') as string;

	try {
		await postMethod('user/forgot-password', { email }, false);
	} catch (error) {
		console.error('forgotPassword failed:', error);
		return {
			message: 'No pudimos procesar la solicitud. Probá de nuevo en unos minutos.',
			success: false,
		};
	}

	return {
		message: 'Si ese email está registrado, te enviamos un link para restablecer tu contraseña.',
		success: true,
	};
}

/** State for the "reset password" form. */
export type ResetPasswordState = {
	error?: string | null;
};

/**
 * @title Set a new password from the token in the reset-password email link
 * @param token - raw token from the `?token=` query param, single-use, 1h TTL
 * @param password - new password, 6-50 chars (same rule as registration)
 * @notes POST /v1/user/reset-password — no auth. 201 clears the token on the
 *   API side and this redirects to /login (throws, never returns). A 400
 *   means the token is invalid/expired/already used — returned as `{ error }`
 *   so the page can point the user back to /recover-password.
 */
export async function resetPassword(
	token: string,
	password: string,
): Promise<ResetPasswordState | void> {
	try {
		await postMethod('user/reset-password', { token, password }, false);
	} catch (error: any) {
		if (error?.status === 400) {
			return { error: 'Este link es inválido o venció. Pedí uno nuevo.' };
		}
		console.error('resetPassword failed:', error);
		return { error: 'No se pudo actualizar la contraseña. Volvé a intentarlo.' };
	}

	redirect('/login');
}

/**
 * @title Permanently delete the logged-in user and every record tied to them
 * @param password - the user's current password, re-checked by the API (bcrypt)
 * @notes DELETE /v1/user/me — the API hard-deletes all the user's rows in one
 *   transaction, then this signs out and redirects home. Irreversible.
 *   Returns `{ error }` for a wrong password so the dialog can show it; on
 *   success it throws the redirect (never returns).
 */
export async function deleteAccount(
	password: string,
): Promise<{ error: string } | void> {
	const session = await getSession();

	if (!session?.user?.id || !session?.accessToken) {
		await signOut({ redirect: false });
		redirect('/login?expired=true');
	}

	const apiUrl = process.env.API_URL;

	const response = await fetch(`${apiUrl}/user/me`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${session!.accessToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ password }),
	});

	// 401 on this route means only a dead session (the AuthGuard), never a bad
	// password — bounce to login like the other actions do.
	if (response.status === 401) {
		await signOut({ redirect: false });
		redirect('/login?expired=true');
	}

	// wrong password — keep the user here so they can retry
	if (response.status === 403) {
		return { error: 'Contraseña incorrecta.' };
	}

	// token valid but the user record is already gone — nothing left to delete
	if (response.status === 404) {
		await signOut({ redirect: false });
		redirect('/login');
	}

	// 500 — the API rolled the transaction back, nothing was deleted
	if (!response.ok) {
		return { error: 'No se pudo eliminar la cuenta. Volvé a intentarlo.' };
	}

	try {
		revalidatePath('/', 'layout'); // drop every cached page for the gone user
		await signOut({ redirectTo: '/' });
	} catch (error: any) {
		if (error?.digest?.startsWith('NEXT_REDIRECT')) {
			throw error;
		}
		console.error('Sign out after account deletion failed:', error);
		throw error;
	}
}

export async function getProfile(): Promise<User> {
	const session = await getSession();
	if (!session?.user?.id) throw new Error('Unauthorized');

	return await getMethodWithoutSession<User>('user/profile', session);
}

export async function putUser(
	data: {
		name?: string;
		totalBudget?: number;
		balance?: number;
		notificationFrequency?: NotificationFrequency;
		mapLevel?: string;
		preferredCurrency?: string;
	},
): Promise<User> {
	const session = await getSession();
	if (!session?.user.id) throw new Error('User ID is missing');

	return await putMethod<User>('user', session.user?.id, { ...data });
}