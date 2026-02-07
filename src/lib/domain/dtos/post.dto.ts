/**
 * Post DTOs
 *
 * Data Transfer Objects for post operations.
 * Domain layer - no external dependencies.
 */

import type { PostType } from "../entities/post";

/**
 * DTO for creating a new post.
 */
export interface CreatePostDTO {
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

  /** Optional linked app ID */
  appId?: string | null;
}

/**
 * DTO for updating an existing post.
 * Only author or admin can update posts.
 */
export interface UpdatePostDTO {
  /** Updated title (optional, 10-200 chars) */
  title?: string;

  /** Updated description (optional, 20-5000 chars) */
  description?: string;

  /** Updated type (optional) */
  type?: PostType;
}

/**
 * DTO for post listing with pagination.
 */
export interface PostListQueryDTO {
  /** Page number (1-based) */
  page?: number;

  /** Items per page (default 20, max 100) */
  limit?: number;

  /** Filter by post type */
  type?: PostType;

  /** Filter by company name */
  company?: string;

  /** Filter by author user ID */
  userId?: string;

  /** Sort field */
  sortBy?: "votes" | "createdAt" | "updatedAt";

  /** Sort direction */
  sortOrder?: "asc" | "desc";
}

/**
 * DTO for trending posts query.
 */
export interface TrendingPostsQueryDTO {
  /** Time window in hours (default 24) */
  timeWindow?: number;

  /** Maximum number of posts to return */
  limit?: number;
}
