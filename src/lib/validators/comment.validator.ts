/**
 * Comment Validators
 *
 * Zod schemas for validating comment-related inputs.
 */

import { z } from 'zod';

/**
 * Schema for creating a new comment.
 */
export const CreateCommentSchema = z.object({
  postId: z.string().uuid('Post ID must be a valid UUID'),
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be at most 2000 characters'),
});

/**
 * Schema for updating a comment.
 */
export const UpdateCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be at most 2000 characters'),
});

/**
 * Schema for comment list query parameters.
 */
export const CommentListQuerySchema = z.object({
  postId: z.string().uuid('Post ID must be a valid UUID'),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc').optional(),
});

// Inferred types from schemas
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;
export type CommentListQueryInput = z.infer<typeof CommentListQuerySchema>;
