/**
 * User Mapper
 *
 * Maps between database rows (snake_case) and domain entities (camelCase).
 * Infrastructure layer - depends on Domain and Database types.
 */

import type { User, ReputationLevel, PublicUser } from '@/lib/domain/entities/user';
import type { CreateUserDTO, UpdateUserDTO } from '@/lib/domain/dtos/user.dto';
import type { Database } from '@/lib/database.types';

type UserRow = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

/**
 * Maps a database row to a User entity.
 *
 * @param row - Database row from users table
 * @returns User domain entity
 */
export const mapRowToUser = (row: UserRow): User => ({
  id: row.id,
  username: row.username,
  displayName: row.display_name,
  email: row.email,
  passwordHash: row.password_hash,
  avatarUrl: row.avatar_url,
  bio: row.bio,
  reputationScore: row.reputation_score,
  reputationLevel: row.reputation_level as ReputationLevel,
  isAdmin: row.is_admin,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

/**
 * Maps a User entity to a PublicUser (without sensitive data).
 *
 * @param user - Full user entity
 * @returns Public-safe user data
 */
export const mapUserToPublic = (user: User): PublicUser => ({
  id: user.id,
  username: user.username,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
  reputationScore: user.reputationScore,
  reputationLevel: user.reputationLevel,
});

/**
 * Maps a CreateUserDTO to a database insert object.
 *
 * @param dto - Create user DTO
 * @param passwordHash - Pre-hashed password
 * @returns Database insert object
 */
export const mapUserToInsert = (dto: CreateUserDTO, passwordHash: string): UserInsert => ({
  username: dto.username,
  display_name: dto.displayName,
  email: dto.email,
  password_hash: passwordHash,
  reputation_score: 0,
  reputation_level: 'Newcomer',
  is_admin: false,
});

/**
 * Maps an UpdateUserDTO to a database update object.
 *
 * @param dto - Update user DTO
 * @returns Database update object (only includes provided fields)
 */
export const mapUserToUpdate = (dto: UpdateUserDTO): UserUpdate => {
  const update: UserUpdate = {};

  if (dto.displayName !== undefined) {
    update.display_name = dto.displayName;
  }
  if (dto.avatarUrl !== undefined) {
    update.avatar_url = dto.avatarUrl;
  }
  if (dto.bio !== undefined) {
    update.bio = dto.bio;
  }

  return update;
};
