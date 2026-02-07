/**
 * User DTOs
 *
 * Data Transfer Objects for user operations.
 * Domain layer - no external dependencies.
 */

import type { ReputationLevel } from "../entities/user";

/**
 * DTO for creating a new user (registration).
 */
export interface CreateUserDTO {
  /** Unique username (3-30 chars, alphanumeric + underscores) */
  username: string;

  /** Display name (1-50 chars) */
  displayName: string;

  /** Valid email address */
  email: string;

  /** Plain text password (min 8 chars) */
  password: string;
}

/**
 * DTO for updating user profile.
 */
export interface UpdateUserDTO {
  /** Display name (optional, 1-50 chars) */
  displayName?: string;

  /** Avatar URL (optional) */
  avatarUrl?: string | null;

  /** Bio (optional, max 500 chars) */
  bio?: string | null;
}

/**
 * DTO for admin user updates (includes privileged fields).
 */
export interface AdminUpdateUserDTO extends UpdateUserDTO {
  /** Reputation score override */
  reputationScore?: number;

  /** Reputation level override */
  reputationLevel?: ReputationLevel;

  /** Admin status */
  isAdmin?: boolean;
}

/**
 * DTO for user login.
 */
export interface LoginDTO {
  /** Email or username */
  identifier: string;

  /** Plain text password */
  password: string;
}

/**
 * DTO for password change.
 */
export interface ChangePasswordDTO {
  /** Current password for verification */
  currentPassword: string;

  /** New password (min 8 chars) */
  newPassword: string;
}

/**
 * DTO for public user profile display.
 */
export interface UserProfileDTO {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  reputationScore: number;
  reputationLevel: ReputationLevel;
  createdAt: Date;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}
