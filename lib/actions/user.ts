'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { signIn } from '@/auth';
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