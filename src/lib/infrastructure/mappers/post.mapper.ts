/**
 * Post Mapper
 *
 * Maps between database rows (snake_case) and domain entities (camelCase).
 * Infrastructure layer - depends on Domain and Database types.
 */

import type { Post } from "@/lib/domain/entities/post";
import type { CreatePostDTO, UpdatePostDTO } from "@/lib/domain/dtos/post.dto";
import type { Database } from "@/lib/database.types";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];

/**
 * Maps a database row to a Post entity.
 *
 * @param row - Database row from posts table
 * @returns Post domain entity
 */
export const mapRowToPost = (row: PostRow): Post => ({
  id: row.id,
  userId: row.user_id,
  type: row.type,
  company: row.company,
  companyColor: row.company_color,
  title: row.title,
  description: row.description,
  votes: row.votes,
  appId: row.app_id,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

/**
 * Maps a CreatePostDTO to a database insert object.
 *
 * @param dto - Create post DTO
 * @param userId - Author's user ID
 * @returns Database insert object
 */
export const mapPostToInsert = (
  dto: CreatePostDTO,
  userId: string,
): PostInsert => ({
  user_id: userId,
  type: dto.type,
  company: dto.company,
  company_color: dto.companyColor,
  title: dto.title,
  description: dto.description,
  app_id: dto.appId ?? null,
});

/**
 * Maps an UpdatePostDTO to a database update object.
 *
 * @param dto - Update post DTO
 * @returns Database update object (only includes provided fields)
 */
export const mapPostToUpdate = (dto: UpdatePostDTO): PostUpdate => {
  const update: PostUpdate = {};

  if (dto.title !== undefined) {
    update.title = dto.title;
  }
  if (dto.description !== undefined) {
    update.description = dto.description;
  }
  if (dto.type !== undefined) {
    update.type = dto.type;
  }

  return update;
};
