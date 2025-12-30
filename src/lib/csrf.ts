/**
 * CSRF Token Utilities
 *
 * Implements Double Submit Cookie pattern for CSRF protection.
 * - Token is stored in a non-httpOnly cookie (client-readable)
 * - Client sends token back in x-csrf-token header
 * - Middleware validates cookie token matches header token
 *
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
 */

import { cookies } from "next/headers";
import crypto from "crypto";

export const CSRF_COOKIE_NAME = "csrf_token";
export const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Cookie options for CSRF token
 * - httpOnly: false - Client JS must read this to send in header
 * - secure: true in production
 * - sameSite: strict - Prevents cross-site requests
 */
export function getCsrfCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";

  return {
    httpOnly: false, // Client must read this to send in header
    secure: isProd,
    sameSite: "strict" as const,
    path: "/",
    maxAge: 60 * 60, // 1 hour
  };
}

/**
 * Set CSRF cookie (for use in API routes/server components)
 */
export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_COOKIE_NAME, token, getCsrfCookieOptions());

  return token;
}

/**
 * Validate CSRF token using timing-safe comparison
 * @param cookieToken - Token from cookie
 * @param headerToken - Token from x-csrf-token header
 * @returns true if tokens match, false otherwise
 */
export function validateCsrfToken(
  cookieToken: string | undefined,
  headerToken: string | null
): boolean {
  if (!cookieToken || !headerToken) {
    return false;
  }

  // Tokens must be same length for timingSafeEqual
  if (cookieToken.length !== headerToken.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken),
      Buffer.from(headerToken)
    );
  } catch {
    return false;
  }
}

/**
 * Get CSRF token from cookies (for use in API routes)
 */
export async function getCsrfTokenFromCookies(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value;
}
