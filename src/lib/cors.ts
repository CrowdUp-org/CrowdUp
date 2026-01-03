/**
 * CORS Configuration
 *
 * Configures allowed origins for Cross-Origin Resource Sharing.
 * Uses environment variable CORS_ALLOWED_ORIGINS for production flexibility.
 */

// Default allowed origins - localhost for development
const DEFAULT_ORIGINS = ["http://localhost:3000"];

/**
 * Get allowed origins from environment variable or defaults
 */
export function getAllowedOrigins(): string[] {
  const envOrigins = process.env.CORS_ALLOWED_ORIGINS;

  if (envOrigins) {
    return envOrigins.split(",").map((origin) => origin.trim());
  }

  // In production, also allow the public app URL if set
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && !DEFAULT_ORIGINS.includes(appUrl)) {
    return [...DEFAULT_ORIGINS, appUrl];
  }

  return DEFAULT_ORIGINS;
}

/**
 * Check if an origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
}

/**
 * CORS headers for responses
 */
export function getCorsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-csrf-token",
  };
}

/**
 * Methods that require CSRF validation
 */
export const CSRF_PROTECTED_METHODS = ["POST", "PUT", "DELETE", "PATCH"];

/**
 * API routes exempt from CSRF (e.g., OAuth callbacks, webhooks with signatures)
 */
export const CSRF_EXEMPT_ROUTES = [
  "/api/auth/callback", // OAuth callbacks use state parameter
  "/api/webhooks", // Webhooks use signature verification
];

/**
 * Check if a route is exempt from CSRF protection
 */
export function isCsrfExemptRoute(pathname: string): boolean {
  return CSRF_EXEMPT_ROUTES.some((route) => pathname.startsWith(route));
}
