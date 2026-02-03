/**
 * Application Layer Error Classes
 *
 * Custom error types for handling validation, authorization,
 * and business rule violations in the application layer.
 */

/**
 * Error thrown when input validation fails.
 *
 * @example
 * throw new ValidationError(parseResult.error.format());
 */
export class ValidationError extends Error {
  /** Structured validation error details */
  public readonly errors: unknown;

  /**
   * Creates a ValidationError.
   *
   * @param errors - Zod error format or custom error object
   */
  constructor(errors: unknown) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Error thrown when a requested resource is not found.
 *
 * @example
 * throw new NotFoundError('Post', '123e4567-e89b-12d3-a456-426614174000');
 */
export class NotFoundError extends Error {
  /** Type of resource that was not found */
  public readonly resource: string;
  /** ID of the resource that was not found */
  public readonly resourceId: string;

  /**
   * Creates a NotFoundError.
   *
   * @param resource - Resource type (e.g., 'Post', 'User')
   * @param id - Resource identifier
   */
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`);
    this.name = 'NotFoundError';
    this.resource = resource;
    this.resourceId = id;
  }
}

/**
 * Error thrown when authentication is required but not provided.
 *
 * @example
 * throw new UnauthorizedError('Token expired');
 */
export class UnauthorizedError extends Error {
  /**
   * Creates an UnauthorizedError.
   *
   * @param message - Error message (default: 'Authentication required')
   */
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Error thrown when user lacks permission to perform an action.
 *
 * @example
 * throw new ForbiddenError('Not authorized to delete this post');
 */
export class ForbiddenError extends Error {
  /**
   * Creates a ForbiddenError.
   *
   * @param message - Error message (default: 'Access denied')
   */
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Error thrown when a business rule is violated.
 *
 * @example
 * throw new BusinessRuleError('Cannot vote on own post', 'SELF_VOTE_NOT_ALLOWED');
 */
export class BusinessRuleError extends Error {
  /** Machine-readable error code */
  public readonly code: string;

  /**
   * Creates a BusinessRuleError.
   *
   * @param message - Human-readable error message
   * @param code - Machine-readable error code
   */
  constructor(message: string, code: string) {
    super(message);
    this.name = 'BusinessRuleError';
    this.code = code;
  }
}
