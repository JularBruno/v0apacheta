import NextAuth, { DefaultSession } from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import 'next-auth/jwt';
import { Router } from "next/router";


/**
 * @title url for dynamic env, based on how npm run was executed
 * @notes process.env.API_URL retrieves .env API_URL
 */
const apiUrl = process.env.API_URL;

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    user: {
      id: string;
    } & DefaultSession['user'];
  }

  interface User {
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
  }
}

// Create a global error store
export let lastAuthError: string | null = null;

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Validate the credentials
          const parsedCredentials = z
            .object({ 
              email: z.string().email(), 
              password: z.string().min(6) 
            })
            // .safeParse(credentials);
            .safeParse({ email: credentials?.email, password: credentials?.password });

          if (!parsedCredentials.success) { // TODO this can be done on form
            const firstError = parsedCredentials.error.issues[0];
            console.log('Field:', firstError.path[0]); // 'email' or 'password'
            console.log('Message:', firstError.message); // 'Invalid email' or 'String must contain at least 6 character(s)'
            
            lastAuthError = `${firstError.path[0].toString().toUpperCase()}_VALIDATIONERROR`;
            return null;
          }

          const { email, password } = parsedCredentials.data;
          
          const response = await fetch(apiUrl + '/user/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              password,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            console.log('Login failed:', response.status, errorData);
            switch (errorData.message) {
              case 'Invalid username':
                lastAuthError = 'LOGIN_EMAIL_ERROR';
                break;
            
              default:
                lastAuthError = 'LOGIN_PASSWORD_ERROR';
                break;
            }
            return null;
          }

          const data = await response.json();

          // Return a user object that NextAuth can use
          // Adjust the fields based on your API response
          console.log('before return login 200')

          return {
            id: data.user.id, // Adjust based on your API response
            email: data.user.email,
            // name: data.user.name, // If available
            // Store the token if you need it for other API calls
            accessToken: data.accessToken, // If your API returns a token
          };
        } catch (error: any) {
          console.error('Login error:', error);
          lastAuthError = 'LOGIN_ERROR';
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    // access the token in your application
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
});