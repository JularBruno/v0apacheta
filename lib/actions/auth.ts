'use server';

import { signIn, signOut, lastAuthError } from '@/auth';
import { revalidatePath } from 'next/cache';

import { AuthError } from 'next-auth';

/**
 * @title Authenticate for throwing in form and reaching SIGNIN in AUTH and redirecting
 * @param prevState - Previous state of the form, useful for seting state
 * @param formData - Form data of login
 * @returns error messages based on the failing form, otherwise return data(might require to make custom type) and redirects to dashboard/mapa
 */
export async function authenticate(
	prevState: string | undefined,
	formData: FormData,
) {
	try {
		await signIn('credentials', formData);
	} catch (error) {
		if (error instanceof AuthError) {
			switch (lastAuthError) {
				case 'EMAIL_VALIDATIONERROR':
					return 'Fomato incorrecto de email';
				case 'PASSWORD_VALIDATIONERROR':
					return 'Fomato incorrecto de contraseña';
				case 'LOGIN_EMAIL_ERROR':
					return 'Ese mail no está registrado';
				case 'LOGIN_PASSWORD_ERROR':
					return 'Contraseña incorrecta';
				case 'LOGIN_ERROR':
					return 'Algo salió mal.';
				default:
					return 'Algo salió mal.';
			}
		}
		throw error;
	}
}

/**
 * @title Authenticate for throwing in form and reaching SIGN OUT in AUTH and redirecting
 * @returns error messages or just redirects
 */
export async function logOut() {
	try {
		revalidatePath('/', 'layout'); // Clears all cached data

		await signOut({ redirectTo: '/' });
	} catch (error: any) {
		console.error('Logout error:', error);
		throw error;
	}
}
