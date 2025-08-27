import NextAuth, { DefaultSession } from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
// import { JWT } from 'next-auth/jwt';
import 'next-auth/jwt';


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


          if (!parsedCredentials.success) {
            console.log('Invalid credentials format');
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
            console.log('Login failed:', response.status);
            return null;
          }

          const data = await response.json();

          // Return a user object that NextAuth can use
          // Adjust the fields based on your API response
          return {
            id: data.user.id, // Adjust based on your API response
            email: data.user.email,
            // name: data.user.name, // If available
            // Store the token if you need it for other API calls
            accessToken: data.accessToken, // If your API returns a token
          };
          
        } catch (error) {
          console.error('Login error:', error);
          return null;
        }
      },
    }),
  ],
  // access the token in your application
  callbacks: {
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