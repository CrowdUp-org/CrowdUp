/**
 * Comment Repository
 *
 * Handles all database operations for comments.
 * Infrastructure layer - abstracts Supabase behind a clean interface.
 */

import { supabase } from '@/lib/supabase';
import type { Comment } from '@/lib/domain/entities/comment';
import type { CreateCommentDTO, UpdateCommentDTO } from '@/lib/domain/dtos/comment.dto';
import { mapRowToComment, mapCommentToInsert, mapCommentToUpdate } from '../mappers/comment.mapper';

/**
 * Comment repository with CRUD and query operations.
 */
export const commentRepository = {
  /**
   * Creates a new comment.
   *
   * @param dto - Create comment DTO
   * @param userId - Author's user ID
   * @returns Created comment entity
   * @throws Error if creation fails
   */
  async create(dto: CreateCommentDTO, userId: string): Promise<Comment> {
    const insert = mapCommentToInsert(dto, userId);
    const { data, error } = await supabase
      .from('comments')
      .insert(insert as never)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create comment: ${error.message}`);
    }
    return mapRowToComment(data);
  },

  /**
   * Finds a comment by ID.
   *
   * @param id - Comment ID
   * @returns Comment entity or null if not found
   * @throws Error if query fails
   */
  async findById(id: string): Promise<Comment | null> {
    const { data, error } = await supabase.from('comments').select('*').eq('id', id).single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch comment: ${error.message}`);
    }
    return mapRowToComment(data);
  },

  /**
   * Updates a comment.
   *
   * @param id - Comment ID
   * @param dto - Update comment DTO
   * @returns Updated comment entity
   * @throws Error if update fails
   */
  async update(id: string, dto: UpdateCommentDTO): Promise<Comment> {
    const update = mapCommentToUpdate(dto.content);
    const { data, error } = await supabase
      .from('comments')
      .update(update as never)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update comment: ${error.message}`);
    }
    return mapRowToComment(data);
  },

  /**
   * Deletes a comment.
   *
   * @param id - Comment ID
   * @throws Error if deletion fails
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('comments').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete comment: ${error.message}`);
    }
  },

  /**
   * Finds comments by post ID.
   *
   * @param postId - Post ID
   * @param limit - Maximum number of comments (default 50)
   * @param offset - Starting offset (default 0)
   * @param ascending - Sort order (default oldest first)
   * @returns Array of comment entities
   * @throws Error if query fails
   */
  async findByPost(
    postId: string,
    limit = 50,
    offset = 0,
    ascending = true
  ): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch comments: ${error.message}`);
    }
    return data.map(mapRowToComment);
  },

  /**
   * Finds comments by user ID.
   *
   * @param userId - User ID
   * @param limit - Maximum number of comments (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of comment entities
   * @throws Error if query fails
   */
  async findByUser(userId: string, limit = 20, offset = 0): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch user comments: ${error.message}`);
    }
    return data.map(mapRowToComment);
  },

  /**
   * Counts comments for a post.
   *
   * @param postId - Post ID
   * @returns Comment count
   * @throws Error if query fails
   */
  async countByPost(postId: string): Promise<number> {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);

    if (error) {
      throw new Error(`Failed to count comments: ${error.message}`);
    }
    return count ?? 0;
  },
};
