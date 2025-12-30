/**
 * CSRF-Protected Fetch Utility
 *
 * Wraps fetch to automatically include CSRF tokens in headers
 * for state-changing requests (POST, PUT, DELETE, PATCH).
 *
 * Usage:
 *   import { secureFetch } from '@/lib/utils/secure-fetch';
 *   const response = await secureFetch('/api/vote', {
 *     method: 'POST',
 *     body: JSON.stringify({ postId, direction }),
 *   });
 */

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const CSRF_PROTECTED_METHODS = ["POST", "PUT", "DELETE", "PATCH"];

/**
 * Get CSRF token from cookie
 * Uses proper parsing to handle edge cases like '=' in token values
 */
export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CSRF_COOKIE_NAME}=`));

  if (!cookie) return null;

  // Slice off the cookie name and '=' to get the value
  return cookie.slice(CSRF_COOKIE_NAME.length + 1);
}

/**
 * Fetch wrapper that automatically includes CSRF token
 *
 * @param url - Request URL
 * @param options - Fetch options
 * @returns Fetch response
 */
export async function secureFetch(
  url: string | URL,
  options: RequestInit = {}
): Promise<Response> {
  const method = (options.method || "GET").toUpperCase();

  // Add CSRF token header for state-changing requests
  if (CSRF_PROTECTED_METHODS.includes(method)) {
    const csrfToken = getCsrfToken();

    if (csrfToken) {
      const headers = new Headers(options.headers);
      headers.set(CSRF_HEADER_NAME, csrfToken);
      options.headers = headers;
    }
  }

  // Ensure credentials are included for cookie-based auth
  options.credentials = options.credentials || "include";

  return fetch(url, options);
}

/**
 * JSON fetch wrapper with CSRF protection
 *
 * @param url - Request URL
 * @param options - Fetch options (body will be JSON.stringify'd if object)
 * @returns Fetch response
 */
export async function secureJsonFetch(
  url: string | URL,
  options: RequestInit & { body?: unknown } = {}
): Promise<Response> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const body =
    options.body && typeof options.body === "object"
      ? JSON.stringify(options.body)
      : (options.body as BodyInit | undefined);

  return secureFetch(url, {
    ...options,
    headers,
    body,
  });
}

/**
 * Helper to check if CSRF token is available
 */
export function hasCsrfToken(): boolean {
  return getCsrfToken() !== null;
}
