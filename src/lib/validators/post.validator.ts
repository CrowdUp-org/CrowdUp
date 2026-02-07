/**
 * Post Validators
 *
 * Zod schemas for validating post-related inputs.
 */

import { z } from "zod";

/**
 * Valid post types.
 */
export const PostTypeEnum = z.enum([
  "Bug Report",
  "Feature Request",
  "Complaint",
  "App Review Request",
]);

/**
 * Hex color validation regex.
 */
const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

/**
 * Schema for creating a new post.
 */
export const CreatePostSchema = z.object({
  type: PostTypeEnum,
  company: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name must be at most 100 characters"),
  companyColor: z
    .string()
    .regex(
      hexColorRegex,
      "Company color must be a valid hex color (e.g., #FF5733)",
    ),
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be at most 5000 characters"),
  appId: z.string().uuid("App ID must be a valid UUID").optional().nullable(),
});

/**
 * Schema for updating an existing post.
 */
export const UpdatePostSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(200, "Title must be at most 200 characters")
    .optional(),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be at most 5000 characters")
    .optional(),
  type: PostTypeEnum.optional(),
});

/**
 * Schema for post list query parameters.
 */
export const PostListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  type: PostTypeEnum.optional(),
  company: z.string().max(100).optional(),
  userId: z.string().uuid().optional(),
  sortBy: z
    .enum(["votes", "createdAt", "updatedAt"])
    .default("createdAt")
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
});

/**
 * Schema for trending posts query.
 */
export const TrendingPostsQuerySchema = z.object({
  timeWindow: z.coerce.number().int().min(1).max(720).default(24).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10).optional(),
});

// Inferred types from schemas
export type CreatePostInput = z.infer<typeof CreatePostSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>;
export type PostListQueryInput = z.infer<typeof PostListQuerySchema>;
export type TrendingPostsQueryInput = z.infer<typeof TrendingPostsQuerySchema>;
