/**
 * Vote Entity
 *
 * Represents a user's vote on a post.
 * Domain layer - no external dependencies.
 */

/**
 * Vote direction: upvote or downvote.
 */
export type VoteType = "up" | "down";

/**
 * Core vote entity - one per user per post.
 */
export interface Vote {
  /** Unique identifier (UUID) */
  id: string;

  /** Target post ID */
  postId: string;

  /** Voting user ID */
  userId: string;

  /** Vote direction */
  voteType: VoteType;

  /** Vote timestamp */
  createdAt: Date;
}

/**
 * Vote status for a user on a specific post.
 * Used for UI to show current vote state.
 */
export interface UserVoteStatus {
  postId: string;
  voteType: VoteType | null;
}
