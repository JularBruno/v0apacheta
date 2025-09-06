'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { signIn } from '@/auth'; 
import { AuthError } from 'next-auth';
import { User } from '../schemas/definitions';
import { z } from 'zod';
import { postMethod } from "./utils";

const PostUserFormSchema = z.object({
    name: z.string().nonempty({ message: "Ingresa un nombre" }),
    email: z.string().email({ message: "Invalid email format" }),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters long" })
        // .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        // .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        // .regex(/[0-9]/, { message: "Password must contain at least one number" })
        // .regex(/[\W_]/, { message: "Password must contain at least one special character" }),
});
  
// const PostUser = PostUserFormSchema.omit({ userId: true });

export type UserState = {
    errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
    };
    message?: string | null;
    // Add this to preserve form data:
    formData?: {
        name?: string;
        email?: string;
        password?: string;
    };
};
  

export async function register(prevState: UserState, formData: FormData) {
    const url = 'user/register';
    
    const validatedData = PostUserFormSchema.safeParse({ 
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
    });
    
    if (!validatedData.success) {
        console.log('validatedData.error ', validatedData.error?.flatten().fieldErrors);
        return {
            errors: validatedData.error.flatten().fieldErrors,
            message: 'Missing fields.',
            // Preserve the submitted values
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

            const signInData = {
                email: formData.get('email'),
                password: formData.get('password'),
            };

            await signIn('credentials', signInData);
            
        } catch (error: any) {
            console.log(error);
            if (error.statusCode === 401 && error.message === "Invalid username") {
            return {
                errors: { email: ['This email is already registered'] },
                message: 'Email already exists.',
                formData: {
                    name: formData.get('name') as string,
                    email: formData.get('email') as string,
                    password: formData.get('password') as string,
                }
            };
        }
        }

    } catch (registrationError: any) {
        console.error('Registration failed:', registrationError);
        
        // Handle specific registration errors
        // if (registrationError.message?.includes('email already exists') || 
        //     registrationError.status === 409) {
        //     return {
        //         errors: { email: ['This email is already registered'] },
        //         message: 'Email already exists.'
        //     };
        // }

        if (registrationError.statusCode === 401 && registrationError.message === "Invalid username") {
            return {
                errors: { email: ['This email is already registered'] },
                message: 'Email already exists.',
                formData: {
                    name: formData.get('name') as string,
                    email: formData.get('email') as string,
                    password: formData.get('password') as string,
                }
            };
        }
        
        // Handle other registration errors
        // return {
        //     errors: {},
        //     message: 'Registration failed. Please try again.'
        // };
    }
    
    // Only redirect if everything succeeded

    // return validatedData;
    console.log('REDIRECT')
    revalidatePath('/dashboard/mapa');
    redirect('/dashboard/mapa');

}

  