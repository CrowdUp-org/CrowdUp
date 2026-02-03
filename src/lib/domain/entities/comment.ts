/**
 * Comment Entity
 *
 * Represents a user comment on a post.
 * Domain layer - no external dependencies.
 */

/**
 * Core comment entity.
 */
export interface Comment {
  /** Unique identifier (UUID) */
  id: string;

  /** Parent post ID */
  postId: string;

  /** Author's user ID */
  userId: string;

  /** Comment content (1-2000 chars) */
  content: string;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Comment with author information for display.
 */
export interface CommentWithAuthor extends Comment {
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    reputationScore: number;
  };
}
