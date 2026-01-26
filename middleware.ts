import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';

/**
 * @title Auth config to extend with basic setting
 * @returns authorized/unauthorized redirection
 */
export const authConfig = {
	pages: {
		signIn: '/login',
		newUser: '/onboarding',
	},
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user;
			const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
			const publicPaths = ['/login', '/onboarding'];
			const isPublic = publicPaths.includes(nextUrl.pathname);

			// If on dashboard and not logged in, redirect to login
			if (isOnDashboard && !isLoggedIn) {
				const loginUrl = new URL('/login', nextUrl.origin);
				loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
				return NextResponse.redirect(loginUrl);
			}

			// If logged in and on login page, redirect to dashboard
			if (isPublic && isLoggedIn) {
				return NextResponse.redirect(new URL('/dashboard/inicio', nextUrl));
			}


			// Allow everything else
			return true;
		},
	},
	providers: [],
} satisfies NextAuthConfig;


/**
 * @title Adding headers on auth config. This originated from ccip errores
 */
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
 * 
 * NOT DOING this anymore, it just checks paths that must be protected
 */
export const config = {
	// matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)',], // this has changed a few times, it is working properly but on previous github versions there was a clearer execution of this regex

	matcher: [
		'/dashboard/:path*',
		'/login',
		'/onboarding',
	],
};