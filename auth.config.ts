import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnHome = nextUrl.pathname === '/';


      // Redirect logged-in users away from login page
      if (isLoggedIn && (isOnLogin || isOnHome)) {
        return Response.redirect(new URL('/dashboard/inicio', nextUrl));
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }

      return true;
    },
  },
  providers: []
} satisfies NextAuthConfig;