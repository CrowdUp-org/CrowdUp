/**
 * Post Entity
 *
 * Represents a user-submitted issue/feedback in CrowdUp.
 * Domain layer - no external dependencies.
 */

/**
 * Types of posts users can create.
 */
export type PostType =
  | 'Bug Report'
  | 'Feature Request'
  | 'Complaint'
  | 'App Review Request';

/**
 * Status of a post in its lifecycle.
 */
export type PostStatus =
  | 'open'
  | 'acknowledged'
  | 'in_progress'
  | 'resolved'
  | 'closed';

/**
 * Core post entity representing user feedback.
 */
export interface Post {
  /** Unique identifier (UUID) */
  id: string;

  /** Author's user ID */
  userId: string;

  /** Type of feedback */
  type: PostType;

  /** Target company name */
  company: string;

  /** Company brand color (hex #RRGGBB) */
  companyColor: string;

  /** Post title (10-200 chars) */
  title: string;

  /** Detailed description (20-5000 chars) */
  description: string;

  /** Net vote count (upvotes - downvotes) */
  votes: number;

  /** Optional linked app ID */
  appId: string | null;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Post with author information for display.
 */
export interface PostWithAuthor extends Post {
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    reputationScore: number;
  };
}
