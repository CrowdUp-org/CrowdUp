/**
 * Notification Entity
 *
 * Represents user notifications in CrowdUp.
 * Domain layer - no external dependencies.
 */

/**
 * Types of notifications.
 */
export type NotificationType = "badge" | "level" | "verification" | "milestone";

/**
 * Core notification entity.
 */
export interface Notification {
  /** Unique identifier (UUID) */
  id: string;

  /** Target user ID */
  userId: string;

  /** Notification type */
  type: NotificationType;

  /** Notification title */
  title: string;

  /** Notification body content */
  content: string;

  /** Optional action link */
  link: string | null;

  /** Read status */
  isRead: boolean;

  /** Creation timestamp */
  createdAt: Date;
}

/**
 * Badge entity.
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirementType: BadgeRequirementType;
  requirementValue: number;
  createdAt: Date;
}

/**
 * Badge requirement types.
 */
export type BadgeRequirementType =
  | "posts_count"
  | "upvotes_received"
  | "reputation_score"
  | "days_active"
  | "implementations"
  | "comments_count";

/**
 * User badge (awarded badge to user).
 */
export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
}

/**
 * User badge with full badge info for display.
 */
export interface UserBadgeWithInfo extends UserBadge {
  badge: Badge;
}
