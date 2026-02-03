/**
 * Vote Validators
 *
 * Zod schemas for validating vote-related inputs.
 */

import { z } from 'zod';

/**
 * Valid vote types.
 */
export const VoteTypeEnum = z.enum(['up', 'down']);

/**
 * Schema for creating/updating a vote.
 */
export const CreateVoteSchema = z.object({
  postId: z.string().uuid('Post ID must be a valid UUID'),
  voteType: VoteTypeEnum,
});

/**
 * Schema for removing a vote.
 */
export const RemoveVoteSchema = z.object({
  postId: z.string().uuid('Post ID must be a valid UUID'),
});

// Inferred types from schemas
export type CreateVoteInput = z.infer<typeof CreateVoteSchema>;
export type RemoveVoteInput = z.infer<typeof RemoveVoteSchema>;
