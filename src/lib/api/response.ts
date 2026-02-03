/**
 * API Response Utilities
 *
 * Standardized response helpers for API routes.
 * Ensures consistent error handling and generic messages to clients.
 *
 * SECURITY: All errors are logged server-side with details,
 * but only generic messages are returned to clients.
 */

import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  BusinessRuleError,
} from '@/lib/application/errors';

/**
 * Creates a successful JSON response.
 *
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with JSON body
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Creates a created (201) JSON response.
 *
 * @param data - Created resource data
 * @returns NextResponse with JSON body and 201 status
 */
export function createdResponse<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 201 });
}

/**
 * Creates a no content (204) response.
 *
 * @returns NextResponse with 204 status and no body
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Converts an error to a client-safe JSON response.
 * Logs detailed error server-side but returns generic messages to clients.
 *
 * SECURITY: Never expose internal error details, stack traces, or
 * database errors to clients. All details are logged server-side only.
 *
 * @param error - Error to convert
 * @returns NextResponse with appropriate status and generic message
 */
export function errorResponse(error: unknown): NextResponse {
  // Log detailed error server-side (structured logging)
  logger.error('API error occurred', error instanceof Error ? error : undefined, {
    errorType: error?.constructor?.name ?? 'Unknown',
  });

  // Validation errors - include field details
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: 'Invalid input', details: error.errors },
      { status: 400 }
    );
  }

  // Not found errors - generic message
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Authentication errors - prompt login
  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Authorization errors - access denied
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Business rule violations - safe to expose message
  if (error instanceof BusinessRuleError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: 422 }
    );
  }

  // Generic error - never expose internal details
  return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
}

/**
 * Creates a bad request (400) response.
 *
 * @param message - Error message
 * @returns NextResponse with 400 status
 */
export function badRequestResponse(message = 'Bad request'): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Creates a method not allowed (405) response.
 *
 * @param allowedMethods - Array of allowed HTTP methods
 * @returns NextResponse with 405 status
 */
export function methodNotAllowedResponse(
  allowedMethods: string[]
): NextResponse {
  return NextResponse.json(
    { error: 'Method not allowed', allowed: allowedMethods },
    { status: 405, headers: { Allow: allowedMethods.join(', ') } }
  );
}
