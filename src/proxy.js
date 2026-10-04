import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Only allow access if the user has a token
        return !!token;
      },
    },
    pages: {
      signIn: '/login',
    }
  }
);

export const config = {
  matcher: [
    // Protect all routes except /login, /api/auth, and static assets
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
