/**
 * Vote Repository
 *
 * Handles all database operations for votes.
 * Infrastructure layer - abstracts Supabase behind a clean interface.
 */

import { supabase } from '@/lib/supabase';
import type { Vote, VoteType } from '@/lib/domain/entities/vote';
import type { CreateVoteDTO } from '@/lib/domain/dtos/vote.dto';
import { mapRowToVote, mapVoteToInsert } from '../mappers/vote.mapper';

/**
 * Vote repository with CRUD and query operations.
 */
export const voteRepository = {
  /**
   * Creates a new vote.
   *
   * @param dto - Create vote DTO
   * @param userId - Voter's user ID
   * @returns Created vote entity
   * @throws Error if creation fails
   */
  async create(dto: CreateVoteDTO, userId: string): Promise<Vote> {
    const insert = mapVoteToInsert(dto, userId);
    const { data, error } = await supabase
      .from('votes')
      .insert(insert as never)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create vote: ${error.message}`);
    }
    return mapRowToVote(data);
  },

  /**
   * Finds a vote by ID.
   *
   * @param id - Vote ID
   * @returns Vote entity or null if not found
   * @throws Error if query fails
   */
  async findById(id: string): Promise<Vote | null> {
    const { data, error } = await supabase.from('votes').select('*').eq('id', id).single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch vote: ${error.message}`);
    }
    return mapRowToVote(data);
  },

  /**
   * Finds a vote by post and user.
   *
   * @param postId - Post ID
   * @param userId - User ID
   * @returns Vote entity or null if not found
   */
  async findByPostAndUser(postId: string, userId: string): Promise<Vote | null> {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch vote: ${error.message}`);
    }
    return data ? mapRowToVote(data) : null;
  },

  /**
   * Finds all votes for a post.
   *
   * @param postId - Post ID
   * @returns Array of vote entities
   * @throws Error if query fails
   */
  async findByPost(postId: string): Promise<Vote[]> {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch post votes: ${error.message}`);
    }
    return data.map(mapRowToVote);
  },

  /**
   * Finds all votes by a user.
   *
   * @param userId - User ID
   * @param limit - Maximum number of votes (default 100)
   * @param offset - Starting offset (default 0)
   * @returns Array of vote entities
   * @throws Error if query fails
   */
  async findByUser(userId: string, limit = 100, offset = 0): Promise<Vote[]> {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch user votes: ${error.message}`);
    }
    return data.map(mapRowToVote);
  },

  /**
   * Updates an existing vote's type.
   *
   * @param id - Vote ID
   * @param voteType - New vote type
   * @returns Updated vote entity
   * @throws Error if update fails
   */
  async update(id: string, voteType: VoteType): Promise<Vote> {
    const { data, error } = await supabase
      .from('votes')
      .update({ vote_type: voteType } as never)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update vote: ${error.message}`);
    }
    return mapRowToVote(data);
  },

  /**
   * Deletes a vote.
   *
   * @param id - Vote ID
   * @throws Error if deletion fails
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('votes').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete vote: ${error.message}`);
    }
  },

  /**
   * Deletes a vote by post and user.
   *
   * @param postId - Post ID
   * @param userId - User ID
   * @throws Error if deletion fails
   */
  async deleteByPostAndUser(postId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete vote: ${error.message}`);
    }
  },

  /**
   * Counts votes for a post.
   *
   * @param postId - Post ID
   * @returns Object with upvotes and downvotes counts
   * @throws Error if query fails
   */
  async countByPost(postId: string): Promise<{ upvotes: number; downvotes: number }> {
    const { data, error } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('post_id', postId);

    if (error) {
      throw new Error(`Failed to count votes: ${error.message}`);
    }

    type VoteRow = { vote_type: 'up' | 'down' };
    const votes = data as VoteRow[];
    const upvotes = votes.filter((v) => v.vote_type === 'up').length;
    const downvotes = votes.filter((v) => v.vote_type === 'down').length;

    return { upvotes, downvotes };
  },

  /**
   * Gets user's vote statuses for multiple posts.
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

    const { data, error } = await supabase
      .from('votes')
      .select('post_id, vote_type')
      .eq('user_id', userId)
      .in('post_id', postIds);

    if (error) {
      throw new Error(`Failed to fetch vote statuses: ${error.message}`);
    }

    type VoteStatusRow = { post_id: string; vote_type: VoteType };
    const statusMap = new Map<string, VoteType>();
    for (const vote of data as VoteStatusRow[]) {
      statusMap.set(vote.post_id, vote.vote_type);
    }

    return statusMap;
  },
};
