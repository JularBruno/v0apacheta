'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { signIn, signOut, lastAuthError } from '@/auth'; 

import { AuthError } from 'next-auth';
import { Category } from '@/lib/definitions';
import { z } from 'zod';
import { postMethod } from "./utils";


// Authenticate for throwing in form and reaching sign-in in auth
export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
  ) {
    try {
      console.log('🚀 2. About to call signIn()');

      await signIn('credentials', formData);

    } catch (error) {
      // this broke redirection not idea why
      // if (error instanceof AuthError && error.type === 'CredentialsSignin') {
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

export async function logOut() {
  try {
    await signOut({ redirectTo: '/', });
  } catch (error: any) {
    console.error('Logout error:', error);
    throw error;
  }
}

const PostUserFormSchema = z.object({
    userId: z.string(),
    name: z.string().min(1, 'Name is required'),
    categoryId: z.string({
      invalid_type_error: 'Please select a category.',
    }),
})
  
const PostUser = PostUserFormSchema.omit({ userId: true });

export type UserState = {
    errors?: {
        email?: string[];
        password?: string[];
    };
    message?: string | null;
};
  
export async function register(prevState: UserState, formData: FormData) {
    // const session = await getSession();
    const url = 'user/register';

    const validatedData = PostUser.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!validatedData.success) {
        return {
            errors: validatedData.error.flatten().fieldErrors,
            message: 'Missing fields.',
        };
    }

    try {
        await postMethod<Category>(url, {
            ...validatedData.data
        });

        try {
            await signIn('credentials', formData);
            revalidatePath('/dashboard/mapa');
            redirect('/dashboard/mapa');
        } catch (error) {
            if (error instanceof AuthError) {
                switch (error.type) {
                    case 'CredentialsSignin':
                    return 'Invalid credentials.';
                    default:
                    return 'Something went wrong.';
                }
            }
            throw error;
        }

    } catch (error) {
        console.log(error);
    }

}

  