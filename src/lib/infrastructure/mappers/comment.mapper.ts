/**
 * Comment Mapper
 *
 * Maps between database rows (snake_case) and domain entities (camelCase).
 * Infrastructure layer - depends on Domain and Database types.
 */

import type { Comment } from "@/lib/domain/entities/comment";
import type { CreateCommentDTO } from "@/lib/domain/dtos/comment.dto";
import type { Database } from "@/lib/database.types";

type CommentRow = Database["public"]["Tables"]["comments"]["Row"];
type CommentInsert = Database["public"]["Tables"]["comments"]["Insert"];
type CommentUpdate = Database["public"]["Tables"]["comments"]["Update"];

/**
 * Maps a database row to a Comment entity.
 *
 * @param row - Database row from comments table
 * @returns Comment domain entity
 */
export const mapRowToComment = (row: CommentRow): Comment => ({
  id: row.id,
  postId: row.post_id,
  userId: row.user_id,
  content: row.content,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

/**
 * Maps a CreateCommentDTO to a database insert object.
 *
 * @param dto - Create comment DTO
 * @param userId - Author's user ID
 * @returns Database insert object
 */
export const mapCommentToInsert = (
  dto: CreateCommentDTO,
  userId: string,
): CommentInsert => ({
  post_id: dto.postId,
  user_id: userId,
  content: dto.content,
});

/**
 * Maps content update to a database update object.
 *
 * @param content - New comment content
 * @returns Database update object
 */
export const mapCommentToUpdate = (content: string): CommentUpdate => ({
  content,
});
