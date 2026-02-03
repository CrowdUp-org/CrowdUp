/**
 * User Repository
 *
 * Handles all database operations for users.
 * Infrastructure layer - abstracts Supabase behind a clean interface.
 */

import { supabase } from '@/lib/supabase';
import type { User } from '@/lib/domain/entities/user';
import type { CreateUserDTO, UpdateUserDTO } from '@/lib/domain/dtos/user.dto';
import { mapRowToUser, mapUserToInsert, mapUserToUpdate } from '../mappers/user.mapper';

/**
 * User repository with CRUD and query operations.
 */
export const userRepository = {
  /**
   * Creates a new user.
   *
   * @param dto - Create user DTO
   * @param passwordHash - Pre-hashed password
   * @returns Created user entity
   * @throws Error if creation fails
   */
  async create(dto: CreateUserDTO, passwordHash: string): Promise<User> {
    const insert = mapUserToInsert(dto, passwordHash);
    const { data, error } = await supabase
      .from('users')
      .insert(insert as never)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
    return mapRowToUser(data);
  },

  /**
   * Finds a user by ID.
   *
   * @param id - User ID
   * @returns User entity or null if not found
   * @throws Error if query fails
   */
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
    return mapRowToUser(data);
  },

  /**
   * Finds a user by username.
   *
   * @param username - Username
   * @returns User entity or null if not found
   * @throws Error if query fails
   */
  async findByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
    return mapRowToUser(data);
  },

  /**
   * Finds a user by email.
   *
   * @param email - Email address
   * @returns User entity or null if not found
   * @throws Error if query fails
   */
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }
    return mapRowToUser(data);
  },

  /**
   * Updates a user.
   *
   * @param id - User ID
   * @param dto - Update user DTO
   * @returns Updated user entity
   * @throws Error if update fails
   */
  async update(id: string, dto: UpdateUserDTO): Promise<User> {
    const update = mapUserToUpdate(dto);
    const { data, error } = await supabase
      .from('users')
      .update(update as never)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
    return mapRowToUser(data);
  },

  /**
   * Deletes a user.
   *
   * @param id - User ID
   * @throws Error if deletion fails
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  },

  /**
   * Finds all users with optional pagination.
   *
   * @param limit - Maximum number of users (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of user entities
   * @throws Error if query fails
   */
  async findAll(limit = 20, offset = 0): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
    return data.map(mapRowToUser);
  },

  /**
   * Finds top users by reputation score.
   *
   * @param limit - Maximum number of users (default 10)
   * @returns Array of user entities sorted by reputation
   * @throws Error if query fails
   */
  async findTopByReputation(limit = 10): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('reputation_score', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch top users: ${error.message}`);
    }
    return data.map(mapRowToUser);
  },

  /**
   * Updates user reputation.
   *
   * @param id - User ID
   * @param points - Points to add (can be negative)
   * @param newLevel - Optional new reputation level
   * @returns Updated user entity
   * @throws Error if update fails
   */
  async updateReputation(id: string, points: number, newLevel?: string): Promise<User> {
    // First get current reputation
    const { data: current, error: fetchError } = await supabase
      .from('users')
      .select('reputation_score')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch user: ${fetchError.message}`);
    }

    const newScore = Math.max(0, (current as { reputation_score: number }).reputation_score + points);

    const updatePayload: { reputation_score: number; reputation_level?: string } = {
      reputation_score: newScore,
    };

    if (newLevel) {
      updatePayload.reputation_level = newLevel;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updatePayload as never)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update reputation: ${error.message}`);
    }
    return mapRowToUser(data);
  },

  /**
   * Checks if a username is available.
   *
   * @param username - Username to check
   * @returns True if username is available
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to check username: ${error.message}`);
    }
    return data === null;
  },

  /**
   * Checks if an email is available.
   *
   * @param email - Email to check
   * @returns True if email is available
   */
  async isEmailAvailable(email: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to check email: ${error.message}`);
    }
    return data === null;
  },
};
