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
    
    // async redirect({ url, baseUrl }) {
    //   // // Handles redirects after sign-in/sign-out
    //   // if (url.startsWith("/")) return `${baseUrl}${url}`;
    //   // else if (new URL(url).origin === baseUrl) return url;
    //   // return `${baseUrl}/dashboard/mapa`; // Default redirect after login

    //   // Always allow relative URLs
    //   if (url.startsWith("/")) return `${baseUrl}${url}`;

    //   const parsed = new URL(url);

    //   // Stay inside same origin
    //   if (parsed.origin === baseUrl) return url;

    //   // Default after login
    //   if (url.includes("callbackUrl")) return `${baseUrl}/`; // after signout
    //   return `${baseUrl}/dashboard/mapa`; // after login
    // },
    async redirect({ url, baseUrl }) {
      const parsedUrl = new URL(url, baseUrl);

      // Handle sign-out → always go home
      if (parsedUrl.pathname === "/") {
        return `${baseUrl}/`;
      }

      // Handle login success → dashboard
      if (parsedUrl.searchParams.get("callbackUrl")) {
        return `${baseUrl}/dashboard/mapa`;
      }

      // Relative URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      // Same-origin URLs
      if (parsedUrl.origin === baseUrl) return parsedUrl.toString();

      return baseUrl; // fallback
    }

  },
  providers: []
} satisfies NextAuthConfig;