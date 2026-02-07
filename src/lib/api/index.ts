/**
 * API Utilities
 *
 * Barrel export for API helper functions.
 */

// Response helpers
export {
  successResponse,
  createdResponse,
  noContentResponse,
  errorResponse,
  badRequestResponse,
  methodNotAllowedResponse,
} from "./response";

// Auth helpers
export {
  getUserFromRequest,
  getOptionalUserFromRequest,
  isAuthenticated,
  type AuthenticatedUser,
} from "./auth";
