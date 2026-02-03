/**
 * Application Layer
 *
 * Contains business logic, validation, and authorization.
 * This layer uses validators for input validation and repositories
 * for data access. It implements all business rules and use cases.
 *
 * Architecture:
 * - Errors: Custom error classes for different failure modes
 * - Services: Business logic with validation and authorization
 *
 * @example
 * import { postService, ValidationError } from '@/lib/application';
 *
 * try {
 *   const post = await postService.createPost(rawData, userId);
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     // Handle validation errors
 *   }
 * }
 */

// Error classes
export {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  BusinessRuleError,
} from './errors';

// Services
export {
  postService,
  voteService,
  commentService,
  userService,
  companyService,
  appService,
} from './services';

// Types
export type { VoteToggleResult } from './services';
