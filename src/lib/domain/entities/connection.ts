/**
 * Connection Entity
 *
 * Represents follow/connection relationships between users.
 * Domain layer - no external dependencies.
 */

/**
 * Core connection (follow) entity.
 */
export interface Connection {
  /** Unique identifier (UUID) */
  id: string;

  /** User who is following */
  followerId: string;

  /** User being followed */
  followingId: string;

  /** Follow timestamp */
  createdAt: Date;
}

/**
 * Follow status for a user pair.
 */
export interface FollowStatus {
  /** Target user ID */
  userId: string;

  /** Whether current user follows them */
  isFollowing: boolean;

  /** Whether they follow current user */
  isFollowedBy: boolean;
}

/**
 * User with follow counts.
 */
export interface UserWithFollowCounts {
  userId: string;
  followersCount: number;
  followingCount: number;
}
