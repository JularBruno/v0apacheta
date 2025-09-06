'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { signIn, signOut, lastAuthError } from '@/auth'; 

import { AuthError } from 'next-auth';
import { User } from '@/lib/schemas/definitions';
import { z } from 'zod';
import { postMethod } from "./utils";


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
    await signOut({ redirectTo: '/', });
  } catch (error: any) {
    console.error('Logout error:', error);
    throw error;
  }
}

/**
 * @title Schema of user to post and validate
 * @notes process.env.API_URL retrieves .env API_URL
 */
const PostUserFormSchema = z.object({
    name: z.string().min(1,  'Name is required'),
    userId: z.string(),
    categoryId: z.string({
      invalid_type_error: 'Please select a category.',
    }),
})
  
const PostUser = PostUserFormSchema.omit({ userId: true });

/**
 * @title url for dynamic env, based on how npm run was executed
 * @notes process.env.API_URL retrieves .env API_URL
 */
export type UserState = {
    errors?: {
        email?: string[];
        password?: string[];
    };
    message?: string | null;
    formData?: {             // Add this property
        name?: string;
        email?: string;
        password?: string;
    };
};

/** Initial state for registration form validation and error handling */
export const initialUserState: UserState = { 
  message: null, 
  errors: {},
  formData: undefined 
};

/**
 * @title Register is not an auth action, so we register and signin
 * @param prevState - Previous state of the form, useful for seting state
 * @param formData - Form data to register
 * @returns 
 */
export async function register(prevState: UserState = initialUserState, formData: FormData) {
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
            formData: {
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                password: formData.get('password') as string,
            }
        };
    }

    try {
        await postMethod<User>(url, {
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
        throw error;
    }

}

  