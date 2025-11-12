import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

/**
 * @title Auth config to extend with basic setting
 * @returns authorized/unauthorized redirection
 */
export const authConfig = {
	pages: {
		signIn: '/login',
		newUser: '/register',
	},
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user;
			const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
			const publicPaths = ['/login', '/register'];
			const isPublic = publicPaths.includes(nextUrl.pathname);

			// If on dashboard and not logged in, redirect to login
			if (isOnDashboard && !isLoggedIn) {
				const loginUrl = new URL('/login', nextUrl.origin);
				loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
				return Response.redirect(loginUrl);
			}

			// If logged in and on login page, redirect to dashboard
			if (isPublic && isLoggedIn) {
				return Response.redirect(new URL('/dashboard/inicio', nextUrl));
			}

			// Allow everything else
			return true;
		},
	},
	providers: [],
} satisfies NextAuthConfig;

import NextAuth from 'next-auth';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
	// Get the response from NextAuth
	const response = NextResponse.next();

	// Add CSP headers
	response.headers.set(
		'Content-Security-Policy',
		`
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
    `.replace(/\s{2,}/g, ' ').trim()
	);

	return response;
});

/**
 * Middleware that protects all routes except API, static files, and images.
 */
export const config = {
	matcher: ['/dashboard/:path*'],
};