/**
 * User Entity
 *
 * Represents a user in the CrowdUp platform.
 * Domain layer - no external dependencies.
 */

/**
 * Reputation levels based on score thresholds.
 */
export type ReputationLevel =
  | 'Newcomer'
  | 'Contributor'
  | 'Active Member'
  | 'Trusted Voice'
  | 'Community Leader'
  | 'Legend';

/**
 * Core user entity with all profile and reputation data.
 */
export interface User {
  /** Unique identifier (UUID) */
  id: string;

  /** Unique username for @mentions and profile URL */
  username: string;

  /** Display name shown in UI */
  displayName: string;

  /** Email address (unique) */
  email: string;

  /** Hashed password - never expose in DTOs */
  passwordHash: string;

  /** Profile avatar URL */
  avatarUrl: string | null;

  /** User bio/description */
  bio: string | null;

  /** Current reputation score (0+) */
  reputationScore: number;

  /** Reputation level derived from score */
  reputationLevel: ReputationLevel;

  /** Admin privileges flag */
  isAdmin: boolean;

  /** Account creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Public-safe user data without sensitive fields.
 * Used for user lists, author info, etc.
 */
export interface PublicUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  reputationScore: number;
  reputationLevel: ReputationLevel;
}
