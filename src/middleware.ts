import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "crowdup-jwt-secret-change-in-production",
);

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/create",
  "/messages",
  "/settings",
  "/dashboard",
  "/admin",
];

// Routes that should redirect to home if already authenticated
const AUTH_ROUTES = ["/auth/signin", "/auth/signup"];

// API routes that don't need token validation (they handle it internally)
const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/refresh",
  "/api/auth/callback",
  "/api/auth/google",
];

async function verifyToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return false;
    }
    return payload.type === "access";
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Skip public API routes
  if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if current route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // Check if current route is an auth route
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Verify access token if present
  const isValidToken = accessToken ? await verifyToken(accessToken) : false;

  // Protected route without valid token
  if (isProtectedRoute && !isValidToken) {
    // If we have a refresh token, let the client-side handle refresh
    if (refreshToken) {
      // Allow access but token refresh will happen client-side
      return NextResponse.next();
    }
    
    // No tokens at all, redirect to signin
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Auth route with valid token - redirect to home
  if (isAuthRoute && isValidToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
