/**
 * App DTOs
 *
 * Data Transfer Objects for app operations.
 * Domain layer - no external dependencies.
 */

import type { AppCategory } from "../entities/app";

/**
 * DTO for creating a new app.
 */
export interface CreateAppDTO {
  /** App name (1-100 chars) */
  name: string;

  /** App description (10-2000 chars) */
  description: string;

  /** App URL (optional, must be valid URL) */
  appUrl?: string | null;

  /** Logo URL (optional) */
  logoUrl?: string | null;

  /** App category */
  category: AppCategory;

  /** Parent company ID (optional) */
  companyId?: string | null;
}

/**
 * DTO for updating an app.
 * Only owner or company admin can update.
 */
export interface UpdateAppDTO {
  /** App name (optional, 1-100 chars) */
  name?: string;

  /** Description (optional, 10-2000 chars) */
  description?: string;

  /** App URL (optional) */
  appUrl?: string | null;

  /** Logo URL (optional) */
  logoUrl?: string | null;

  /** App category (optional) */
  category?: AppCategory;
}

/**
 * DTO for creating an app review.
 */
export interface CreateAppReviewDTO {
  /** Target app ID */
  appId: string;

  /** Rating (1-5) */
  rating: number;

  /** Review text (optional, max 2000 chars) */
  reviewText?: string | null;
}

/**
 * DTO for updating an app review.
 */
export interface UpdateAppReviewDTO {
  /** Updated rating (1-5) */
  rating?: number;

  /** Updated review text (optional, max 2000 chars) */
  reviewText?: string | null;
}

/**
 * DTO for app listing query.
 */
export interface AppListQueryDTO {
  /** Search query */
  search?: string;

  /** Filter by category */
  category?: AppCategory;

  /** Filter by company ID */
  companyId?: string;

  /** Page number (1-based) */
  page?: number;

  /** Items per page (default 20, max 100) */
  limit?: number;

  /** Sort field */
  sortBy?: "name" | "averageRating" | "totalReviews" | "createdAt";

  /** Sort direction */
  sortOrder?: "asc" | "desc";
}
