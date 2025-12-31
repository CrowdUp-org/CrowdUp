import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Middleware to protect certain routes
// Note: Since auth is client-side (localStorage), we check for the presence of session cookies or just rely on path matching for basic redirects. For persistent auth, a cookie-based session would be better.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes
  const protectedRoutes = ["/admin", "/messages", "/settings", "/create"];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // For client-side auth, middleware can't easily read localStorage.
  // In a real production app, we would use HttpOnly cookies for sessions.
  // For now, we perform basic existence check if cookie 'userId' exists (if we implemented it)
  // or we rely on client-side protection in the layouts/pages themselves.

  // If we wanted to add a basic redirect for now:
  /*
  const userId = request.cookies.get("userId");
  if (isProtected && !userId) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
  */

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/messages/:path*", "/settings/:path*", "/create"],
};
