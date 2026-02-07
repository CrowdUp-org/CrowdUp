/**
 * Vote DTOs
 *
 * Data Transfer Objects for vote operations.
 * Domain layer - no external dependencies.
 */

import type { VoteType } from "../entities/vote";

/**
 * DTO for creating/updating a vote.
 * User ID is derived from auth context, not provided here.
 */
export interface CreateVoteDTO {
  /** Target post ID */
  postId: string;

  /** Vote direction */
  voteType: VoteType;
}

/**
 * DTO for removing a vote.
 */
export interface RemoveVoteDTO {
  /** Target post ID */
  postId: string;
}

/**
 * DTO for vote toggle response.
 */
export interface VoteResponseDTO {
  /** Operation performed */
  action: "created" | "updated" | "removed";

  /** New vote state (null if removed) */
  voteType: VoteType | null;

  /** Updated post vote count */
  newVoteCount: number;
}
