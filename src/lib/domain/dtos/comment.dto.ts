/**
 * Comment DTOs
 *
 * Data Transfer Objects for comment operations.
 * Domain layer - no external dependencies.
 */

/**
 * DTO for creating a new comment.
 */
export interface CreateCommentDTO {
  /** Target post ID */
  postId: string;

  /** Comment content (1-2000 chars) */
  content: string;
}

/**
 * DTO for updating a comment.
 * Only author can update their comments.
 */
export interface UpdateCommentDTO {
  /** Updated content (1-2000 chars) */
  content: string;
}

/**
 * DTO for comment listing with pagination.
 */
export interface CommentListQueryDTO {
  /** Target post ID */
  postId: string;

  /** Page number (1-based) */
  page?: number;

  /** Items per page (default 20, max 100) */
  limit?: number;

  /** Sort direction (default: oldest first) */
  sortOrder?: "asc" | "desc";
}
