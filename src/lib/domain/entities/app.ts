/**
 * App Entity
 *
 * Represents an application/product in CrowdUp.
 * Domain layer - no external dependencies.
 */

/**
 * App category types.
 */
export type AppCategory =
  | 'Productivity'
  | 'Social'
  | 'Entertainment'
  | 'Education'
  | 'Finance'
  | 'Health'
  | 'Utilities'
  | 'Games'
  | 'Lifestyle'
  | 'Developer Tools'
  | 'Other';

/**
 * Core app entity.
 */
export interface App {
  /** Unique identifier (UUID) */
  id: string;

  /** Creator/owner user ID */
  userId: string;

  /** App name */
  name: string;

  /** App description */
  description: string;

  /** App URL/link */
  appUrl: string | null;

  /** App logo URL */
  logoUrl: string | null;

  /** App category */
  category: AppCategory;

  /** Average user rating (0-5) */
  averageRating: number;

  /** Total number of reviews */
  totalReviews: number;

  /** Parent company ID (if any) */
  companyId: string | null;

  /** Creation timestamp */
  createdAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * App review entity.
 */
export interface AppReview {
  id: string;
  appId: string;
  userId: string;
  rating: number;
  reviewText: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * App with owner information for display.
 */
export interface AppWithOwner extends App {
  owner: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}
