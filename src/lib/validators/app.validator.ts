/**
 * App Validators
 *
 * Zod schemas for validating app-related inputs.
 */

import { z } from 'zod';

/**
 * Valid app categories.
 */
export const AppCategoryEnum = z.enum([
  'Productivity',
  'Social',
  'Entertainment',
  'Education',
  'Finance',
  'Health',
  'Utilities',
  'Games',
  'Lifestyle',
  'Developer Tools',
  'Other',
]);

/**
 * Schema for creating a new app.
 */
export const CreateAppSchema = z.object({
  name: z
    .string()
    .min(1, 'App name is required')
    .max(100, 'App name must be at most 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  appUrl: z.string().url('App URL must be a valid URL').nullable().optional(),
  logoUrl: z.string().url('Logo must be a valid URL').nullable().optional(),
  category: AppCategoryEnum,
  companyId: z.string().uuid('Company ID must be a valid UUID').nullable().optional(),
});

/**
 * Schema for updating an app.
 */
export const UpdateAppSchema = z.object({
  name: z
    .string()
    .min(1, 'App name is required')
    .max(100, 'App name must be at most 100 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
  appUrl: z.string().url('App URL must be a valid URL').nullable().optional(),
  logoUrl: z.string().url('Logo must be a valid URL').nullable().optional(),
  category: AppCategoryEnum.optional(),
});

/**
 * Schema for app review.
 */
export const CreateAppReviewSchema = z.object({
  appId: z.string().uuid('App ID must be a valid UUID'),
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  reviewText: z
    .string()
    .max(2000, 'Review must be at most 2000 characters')
    .nullable()
    .optional(),
});

/**
 * Schema for updating an app review.
 */
export const UpdateAppReviewSchema = z.object({
  rating: z
    .number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5')
    .optional(),
  reviewText: z
    .string()
    .max(2000, 'Review must be at most 2000 characters')
    .nullable()
    .optional(),
});

/**
 * Schema for app list query.
 */
export const AppListQuerySchema = z.object({
  search: z.string().max(100).optional(),
  category: AppCategoryEnum.optional(),
  companyId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  sortBy: z
    .enum(['name', 'averageRating', 'totalReviews', 'createdAt'])
    .default('createdAt')
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

// Inferred types from schemas
export type CreateAppInput = z.infer<typeof CreateAppSchema>;
export type UpdateAppInput = z.infer<typeof UpdateAppSchema>;
export type CreateAppReviewInput = z.infer<typeof CreateAppReviewSchema>;
export type UpdateAppReviewInput = z.infer<typeof UpdateAppReviewSchema>;
export type AppListQueryInput = z.infer<typeof AppListQuerySchema>;
