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
      // console.log('IMPORTANT isLoggedIn ', isLoggedIn);

      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return Response.redirect(new URL('/', nextUrl));
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard/inicio', nextUrl));
      }

      return true;
    },
    
  },
  providers: []
} satisfies NextAuthConfig;