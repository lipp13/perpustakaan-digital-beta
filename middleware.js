import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Middleware logic akan di-handle di masing-masing route
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Basic auth check - detail authorization di handle per route
        return !!token;
      }
    }
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/petugas/:path*',
    '/api/books/:path*',
    '/api/borrows/:path*',
    '/api/admin/:path*'
  ]
};