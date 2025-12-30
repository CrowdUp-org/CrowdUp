import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================================================
// Configuration
// ============================================================================

/**
 * Routes that require authentication
 */
const PROTECTED_ROUTES = [
  "/create",
  "/messages",
  "/settings",
  "/dashboard",
  "/admin",
];

/**
 * Auth routes that redirect to home if already authenticated
 */
const AUTH_ROUTES = ["/auth/signin", "/auth/signup"];

/**
 * HTTP methods that require CSRF protection
 */
const CSRF_PROTECTED_METHODS = ["POST", "PUT", "DELETE", "PATCH"];

/**
 * Routes exempt from CSRF protection (OAuth, webhooks with signatures)
 */
const CSRF_EXEMPT_ROUTES = ["/api/auth/callback", "/api/webhooks"];

/**
 * CSRF token cookie and header names
 */
const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get allowed origins from environment or defaults
 */
function getAllowedOrigins(): string[] {
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(",").map((origin) => origin.trim());
  }

  const origins = ["http://localhost:3000"];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && !origins.includes(appUrl)) {
    origins.push(appUrl);
  }
  return origins;
}

/**
 * Validate CSRF token using constant-time comparison
 * Uses TextEncoder for Edge Runtime compatibility
 */
function validateCsrfToken(
  cookieToken: string | undefined,
  headerToken: string | null,
): boolean {
  if (!cookieToken || !headerToken) return false;
  if (cookieToken.length !== headerToken.length) return false;

  // Constant-time string comparison for Edge Runtime
  const encoder = new TextEncoder();
  const a = encoder.encode(cookieToken);
  const b = encoder.encode(headerToken);

  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

/**
 * Check if route requires CSRF protection
 */
function requiresCsrfProtection(pathname: string, method: string): boolean {
  if (!pathname.startsWith("/api/")) return false;
  if (!CSRF_PROTECTED_METHODS.includes(method)) return false;
  if (CSRF_EXEMPT_ROUTES.some((route) => pathname.startsWith(route)))
    return false;
  return true;
}

/**
 * Check if user has valid auth cookie
 */
function hasAuthCookie(request: NextRequest): boolean {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  return !!(accessToken || refreshToken);
}

// ============================================================================
// Middleware
// ============================================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const allowedOrigins = getAllowedOrigins();

  // Create response with potential modifications
  let response = NextResponse.next();

  // ---------------------------------------------------------------------------
  // CORS Headers
  // ---------------------------------------------------------------------------
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-csrf-token",
    );
    // Prevent cache poisoning with CORS responses
    response.headers.set("Vary", "Origin");
  }

  // Handle CORS preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  // ---------------------------------------------------------------------------
  // Origin/Referer Validation for API Routes
  // ---------------------------------------------------------------------------
  if (
    pathname.startsWith("/api/") &&
    CSRF_PROTECTED_METHODS.includes(request.method)
  ) {
    // Validate Origin header if present
    if (origin && !allowedOrigins.includes(origin)) {
      return NextResponse.json(
        { error: "Origin not allowed" },
        { status: 403 },
      );
    }

    // If no Origin, validate Referer header
    if (!origin && referer) {
      try {
        const refererUrl = new URL(referer);
        const refererOrigin = refererUrl.origin;
        if (!allowedOrigins.includes(refererOrigin)) {
          return NextResponse.json(
            { error: "Referer not allowed" },
            { status: 403 },
          );
        }
      } catch {
        return NextResponse.json({ error: "Invalid referer" }, { status: 403 });
      }
    }

    // If neither Origin nor Referer, rely on CSRF token validation below
    // (same-site requests from older browsers may not send either)
  }

  // ---------------------------------------------------------------------------
  // CSRF Protection for API Routes
  // ---------------------------------------------------------------------------
  if (requiresCsrfProtection(pathname, request.method)) {
    const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
    const headerToken = request.headers.get(CSRF_HEADER_NAME);

    if (!validateCsrfToken(cookieToken, headerToken)) {
      return NextResponse.json(
        { error: "Invalid or missing CSRF token" },
        { status: 403 },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // CSRF Token Generation (ensure token exists for authenticated users)
  // ---------------------------------------------------------------------------
  if (!request.cookies.get(CSRF_COOKIE_NAME)?.value && hasAuthCookie(request)) {
    // Generate CSRF token using Web Crypto API (Edge compatible)
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const csrfToken = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const isProd = process.env.NODE_ENV === "production";

    response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: false, // Client must read this
      secure: isProd,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });
  }

  // ---------------------------------------------------------------------------
  // Route Protection (check auth for protected routes)
  // ---------------------------------------------------------------------------
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !hasAuthCookie(request)) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthRoute && hasAuthCookie(request)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
