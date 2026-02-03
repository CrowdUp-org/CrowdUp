/**
 * API Authentication Utilities
 *
 * Helpers for extracting and validating user authentication in API routes.
 */

import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { UnauthorizedError } from '@/lib/application/errors';

/**
 * Authenticated user context.
 */
export interface AuthenticatedUser {
  /** User ID from JWT */
  userId: string;
}

/**
 * Extracts and validates user authentication from request cookies.
 * Throws UnauthorizedError if no valid token is present.
 *
 * @returns Authenticated user context with userId
 * @throws UnauthorizedError - If no token or invalid token
 *
 * @example
 * const { userId } = await getUserFromRequest();
 */
export async function getUserFromRequest(): Promise<AuthenticatedUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    throw new UnauthorizedError('No access token');
  }

  const payload = await verifyAccessToken(token);
  if (!payload?.sub) {
    throw new UnauthorizedError('Invalid token');
  }

  return { userId: payload.sub };
}

/**
 * Optionally extracts user authentication from request cookies.
 * Returns null if no valid token is present (does not throw).
 *
 * @returns Authenticated user context or null
 *
 * @example
 * const user = await getOptionalUserFromRequest();
 * if (user) {
 *   // User is authenticated
 * }
 */
export async function getOptionalUserFromRequest(): Promise<AuthenticatedUser | null> {
  try {
    return await getUserFromRequest();
  } catch {
    return null;
  }
}

/**
 * Checks if the current request is from an authenticated user.
 *
 * @returns True if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getOptionalUserFromRequest();
  return user !== null;
}
