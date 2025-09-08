'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/auth'; 
import type { Session } from 'next-auth';

/**
 * @title url for dynamic env, based on how npm run was executed
 * @notes process.env.API_URL retrieves .env API_URL
 */
const urlDev = process.env.API_URL;

// session is auth method way of reaching its callbacks (auth from auth.config.ts) has some ways of retrieving user logged
export async function getSession(): Promise<Session | null> {
    return await auth();
};

// what to do when user not logged? Redirect!
export async function unauthorized(): Promise<Session | null> {
    // throw new Error("Unauthorized");
    return redirect("/login");
};

/**
 * @title Default getMethod
 * @param url - url to get from
 * @param id - id to add to url if required
 * @returns response or error
 */
export async function getMethod<T>(url: string, id?: string | number): Promise<T> {
    const session = await getSession();

    if (!session?.user?.id || !session?.accessToken) {
        throw new Error("Unauthorized");
    }

    try {
        const response = await fetch(`${urlDev}/${url}/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session?.accessToken}`,
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
      throw error;
    }
};

/**
 * @title Default postMethod
 * @param url - url to post to
 * @param body - body to post
 * @param requiresAuth - IF requires authentication, default true but for registering it was required to false
 * @returns response or error
 */
export async function postMethod<T>(
    url: string, 
    body?: object, 
    requiresAuth: boolean = true // Add flag for auth requirement
): Promise<T> {
    
    // Only check session for authenticated endpoints
    if (requiresAuth) {
        const session = await getSession();
        if (!session?.user?.id || !session?.accessToken) {
            unauthorized();
        }
    }

    try {
        // Build headers conditionally
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        
        if (requiresAuth) {
            const session = await getSession();
            headers['Authorization'] = `Bearer ${session?.accessToken}`;
        }

        const response = await fetch(`${urlDev}/${url}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            
            // Create proper error object with all data
            const error = new Error(errorData.message || 'API Error') as any;
            error.statusCode = errorData.statusCode || response.status;
            error.status = response.status;
            error.response = errorData;
            
            throw error;
        }

        return await response.json();
        
    } catch (error: any) {
        // Don't modify the error, just re-throw it
        throw error;
    }
}

/**
 * @title Default deleteMethod
 * @param url - url to object for deletion
 * @param id - id to identify object
 * @returns response or error
 */
export async function deleteMethod<T>(url: string, id: string): Promise<T> {
    const session = await getSession();

    if (!session?.user?.id || !session?.accessToken) {
    //   throw new Error("Unauthorized");
        unauthorized();
    }

    try {
        const response = await fetch(`${urlDev}/${url}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session?.accessToken}`,
            'Content-Type': 'application/json',
          }
        });

        const data = await response.json();
        return data;
    } catch (error) {
      throw error;
    }
};
