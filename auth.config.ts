import type { NextAuthConfig } from 'next-auth';

/**
 * @title Auth config to extend with basic setting
 * @returns authorized/unauthorized redirection. (could also include more redirection parameters and more handling)
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
      const publicPaths = ['/login'];
      const isPublic = publicPaths.includes(nextUrl.pathname);

      if (isOnDashboard && !isLoggedIn) {
        return false; // Redirects to signIn page (/login)
      }

      // If logged in and trying to access login, redirect to dashboard
      if (isPublic && isLoggedIn) {
        return Response.redirect(new URL('/dashboard/inicio', nextUrl));
      }

      // Allow everything else
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
