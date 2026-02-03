/**
 * Post Repository
 *
 * Handles all database operations for posts.
 * Infrastructure layer - abstracts Supabase behind a clean interface.
 */

import { supabase } from '@/lib/supabase';
import type { Post } from '@/lib/domain/entities/post';
import type { CreatePostDTO, UpdatePostDTO } from '@/lib/domain/dtos/post.dto';
import { mapRowToPost, mapPostToInsert, mapPostToUpdate } from '../mappers/post.mapper';

/**
 * Post repository with CRUD and query operations.
 */
export const postRepository = {
  /**
   * Creates a new post.
   *
   * @param dto - Create post DTO
   * @param userId - Author's user ID
   * @returns Created post entity
   * @throws Error if creation fails
   */
  async create(dto: CreatePostDTO, userId: string): Promise<Post> {
    const insert = mapPostToInsert(dto, userId);
    const { data, error } = await supabase
      .from('posts')
      .insert(insert as never)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }
    return mapRowToPost(data);
  },

  /**
   * Finds a post by ID.
   *
   * @param id - Post ID
   * @returns Post entity or null if not found
   * @throws Error if query fails
   */
  async findById(id: string): Promise<Post | null> {
    const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch post: ${error.message}`);
    }
    return mapRowToPost(data);
  },

  /**
   * Updates a post.
   *
   * @param id - Post ID
   * @param dto - Update post DTO
   * @returns Updated post entity
   * @throws Error if update fails
   */
  async update(id: string, dto: UpdatePostDTO): Promise<Post> {
    const update = mapPostToUpdate(dto);
    const { data, error } = await supabase
      .from('posts')
      .update(update as never)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update post: ${error.message}`);
    }
    return mapRowToPost(data);
  },

  /**
   * Deletes a post.
   *
   * @param id - Post ID
   * @throws Error if deletion fails
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete post: ${error.message}`);
    }
  },

  /**
   * Finds posts by user ID.
   *
   * @param userId - User ID
   * @param limit - Maximum number of posts (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of post entities
   * @throws Error if query fails
   */
  async findByUser(userId: string, limit = 20, offset = 0): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch user posts: ${error.message}`);
    }
    return data.map(mapRowToPost);
  },

  /**
   * Finds posts by company name.
   *
   * @param company - Company name
   * @param limit - Maximum number of posts (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of post entities
   * @throws Error if query fails
   */
  async findByCompany(company: string, limit = 20, offset = 0): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('company', company)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch company posts: ${error.message}`);
    }
    return data.map(mapRowToPost);
  },

  /**
   * Finds posts by app ID.
   *
   * @param appId - App ID
   * @param limit - Maximum number of posts (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of post entities
   * @throws Error if query fails
   */
  async findByApp(appId: string, limit = 20, offset = 0): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('app_id', appId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch app posts: ${error.message}`);
    }
    return data.map(mapRowToPost);
  },

  /**
   * Finds all posts with optional pagination.
   *
   * @param limit - Maximum number of posts (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of post entities
   * @throws Error if query fails
   */
  async findAll(limit = 20, offset = 0): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch posts: ${error.message}`);
    }
    return data.map(mapRowToPost);
  },

  /**
   * Finds trending posts by vote count.
   *
   * @param limit - Maximum number of posts (default 10)
   * @returns Array of post entities sorted by votes
   * @throws Error if query fails
   */
  async findTrending(limit = 10): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('votes', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch trending posts: ${error.message}`);
    }
    return data.map(mapRowToPost);
  },

  /**
   * Updates post vote count.
   *
   * @param id - Post ID
   * @param increment - Vote increment (+1 or -1)
   * @returns Updated post entity
   * @throws Error if update fails
   */
  async updateVoteCount(id: string, increment: number): Promise<Post> {
    // First get current vote count
    const { data: current, error: fetchError } = await supabase
      .from('posts')
      .select('votes')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch post: ${fetchError.message}`);
    }

    const newVotes = (current as { votes: number }).votes + increment;

    const { data, error } = await supabase
      .from('posts')
      .update({ votes: newVotes } as never)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update vote count: ${error.message}`);
    }
    return mapRowToPost(data);
  },
};
