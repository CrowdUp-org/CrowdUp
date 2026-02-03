/**
 * Vote Mapper
 *
 * Maps between database rows (snake_case) and domain entities (camelCase).
 * Infrastructure layer - depends on Domain and Database types.
 */

import type { Vote } from '@/lib/domain/entities/vote';
import type { CreateVoteDTO } from '@/lib/domain/dtos/vote.dto';
import type { Database } from '@/lib/database.types';

type VoteRow = Database['public']['Tables']['votes']['Row'];
type VoteInsert = Database['public']['Tables']['votes']['Insert'];

/**
 * Maps a database row to a Vote entity.
 *
 * @param row - Database row from votes table
 * @returns Vote domain entity
 */
export const mapRowToVote = (row: VoteRow): Vote => ({
  id: row.id,
  postId: row.post_id,
  userId: row.user_id,
  voteType: row.vote_type,
  createdAt: new Date(row.created_at),
});

/**
 * Maps a CreateVoteDTO to a database insert object.
 *
 * @param dto - Create vote DTO
 * @param userId - Voter's user ID
 * @returns Database insert object
 */
export const mapVoteToInsert = (dto: CreateVoteDTO, userId: string): VoteInsert => ({
  post_id: dto.postId,
  user_id: userId,
  vote_type: dto.voteType,
});
