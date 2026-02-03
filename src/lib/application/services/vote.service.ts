/**
 * Vote Service
 *
 * Business logic for voting operations with idempotent toggle behavior.
 * Handles vote creation, updates, and removal with automatic post vote recalculation.
 */

import { voteRepository } from '@/lib/infrastructure/repositories/vote.repository';
import { postRepository } from '@/lib/infrastructure/repositories/post.repository';
import { CreateVoteSchema } from '@/lib/validators/vote.validator';
import type { Vote, VoteType } from '@/lib/domain/entities/vote';
import {
  ValidationError,
  NotFoundError,
  BusinessRuleError,
} from '../errors';

/**
 * Result of a vote toggle operation.
 */
export interface VoteToggleResult {
  /** Action performed: created new vote, updated existing, or removed vote */
  action: 'created' | 'updated' | 'removed';
  /** The vote entity (undefined if removed) */
  vote?: Vote;
  /** Updated net vote count for the post */
  netVotes: number;
}

/**
 * Vote service with idempotent toggle logic.
 */
export const voteService = {
  /**
   * Toggles a vote on a post with idempotent behavior.
   *
   * Logic:
   * - No existing vote → Create new vote
   * - Same vote type exists → Remove vote (toggle off)
   * - Different vote type exists → Update vote
   *
   * @param rawData - Unvalidated vote data { postId, voteType }
   * @param userId - Voting user's ID
   * @returns Result containing action taken and updated vote counts
   * @throws ValidationError - If input validation fails
   * @throws NotFoundError - If post does not exist
   * @throws BusinessRuleError - If user tries to vote on own post
   */
  async toggleVote(rawData: unknown, userId: string): Promise<VoteToggleResult> {
    // 1. Validate input
    const parseResult = CreateVoteSchema.safeParse(rawData);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.format());
    }

    const { postId, voteType } = parseResult.data;

    // 2. Verify post exists
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post', postId);
    }

    // 3. Business rule: Prevent self-voting
    if (post.userId === userId) {
      throw new BusinessRuleError(
        'Cannot vote on your own post',
        'SELF_VOTE_NOT_ALLOWED'
      );
    }

    // 4. Get existing vote if any
    const existingVote = await voteRepository.findByPostAndUser(postId, userId);

    let result: VoteToggleResult;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Same vote type = remove vote (toggle off)
        await voteRepository.delete(existingVote.id);
        const netVotes = await this.recalculatePostVotes(postId);
        result = { action: 'removed', netVotes };
      } else {
        // Different vote type = update
        const updatedVote = await voteRepository.update(existingVote.id, voteType);
        const netVotes = await this.recalculatePostVotes(postId);
        result = { action: 'updated', vote: updatedVote, netVotes };
      }
    } else {
      // New vote
      const newVote = await voteRepository.create({ postId, voteType }, userId);
      const netVotes = await this.recalculatePostVotes(postId);
      result = { action: 'created', vote: newVote, netVotes };
    }

    return result;
  },

  /**
   * Recalculates and updates the net vote count for a post.
   *
   * @param postId - Post ID to recalculate
   * @returns Updated net vote count
   */
  async recalculatePostVotes(postId: string): Promise<number> {
    const { upvotes, downvotes } = await voteRepository.countByPost(postId);
    const netVotes = upvotes - downvotes;

    // Get current post to calculate increment
    const post = await postRepository.findById(postId);
    if (post) {
      const increment = netVotes - post.votes;
      if (increment !== 0) {
        await postRepository.updateVoteCount(postId, increment);
      }
    }

    return netVotes;
  },

  /**
   * Gets the current user's vote status on a post.
   *
   * @param postId - Post ID
   * @param userId - User ID
   * @returns Vote type ('up' | 'down') or null if no vote
   */
  async getVoteStatus(postId: string, userId: string): Promise<VoteType | null> {
    const vote = await voteRepository.findByPostAndUser(postId, userId);
    return vote?.voteType ?? null;
  },

  /**
   * Gets vote statuses for multiple posts for a user.
   * Optimized for batch loading (e.g., post list display).
   *
   * @param userId - User ID
   * @param postIds - Array of post IDs
   * @returns Map of post ID to vote type
   */
  async getVoteStatusesForPosts(
    userId: string,
    postIds: string[]
  ): Promise<Map<string, VoteType>> {
    if (postIds.length === 0) {
      return new Map();
    }
    return await voteRepository.getVoteStatusesForPosts(userId, postIds);
  },

  /**
   * Removes a user's vote from a post.
   *
   * @param postId - Post ID
   * @param userId - User ID
   * @returns True if vote was removed, false if no vote existed
   */
  async removeVote(postId: string, userId: string): Promise<boolean> {
    const existingVote = await voteRepository.findByPostAndUser(postId, userId);
    if (!existingVote) {
      return false;
    }

    await voteRepository.delete(existingVote.id);
    await this.recalculatePostVotes(postId);
    return true;
  },

  /**
   * Gets vote counts for a post.
   *
   * @param postId - Post ID
   * @returns Object with upvotes and downvotes counts
   * @throws NotFoundError - If post does not exist
   */
  async getVoteCounts(postId: string): Promise<{ upvotes: number; downvotes: number; net: number }> {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError('Post', postId);
    }

    const { upvotes, downvotes } = await voteRepository.countByPost(postId);
    return {
      upvotes,
      downvotes,
      net: upvotes - downvotes,
    };
  },
};
