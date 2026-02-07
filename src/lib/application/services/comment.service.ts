/**
 * Comment Service
 *
 * Business logic for comment operations including CRUD,
 * validation, and authorization.
 */

import { commentRepository } from "@/lib/infrastructure/repositories/comment.repository";
import { postRepository } from "@/lib/infrastructure/repositories/post.repository";
import {
  CreateCommentSchema,
  UpdateCommentSchema,
} from "@/lib/validators/comment.validator";
import type { Comment } from "@/lib/domain/entities/comment";
import type {
  CreateCommentDTO,
  UpdateCommentDTO,
} from "@/lib/domain/dtos/comment.dto";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} from "../errors";

/**
 * Maximum comments per user per hour.
 */
const MAX_COMMENTS_PER_HOUR = 30;

/**
 * Comment service with business logic and validation.
 */
export const commentService = {
  /**
   * Creates a new comment with validation.
   *
   * @param rawData - Unvalidated comment creation data
   * @param userId - Author's user ID
   * @returns Created comment entity
   * @throws ValidationError - If input validation fails
   * @throws NotFoundError - If parent post does not exist
   * @throws BusinessRuleError - If rate limit is exceeded
   */
  async createComment(rawData: unknown, userId: string): Promise<Comment> {
    // 1. Validate input
    const parseResult = CreateCommentSchema.safeParse(rawData);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.format());
    }

    const { postId, content } = parseResult.data;

    // 2. Verify post exists
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError("Post", postId);
    }

    // 3. Business rules - rate limiting (check recent comments)
    const recentComments = await commentRepository.findByUser(
      userId,
      MAX_COMMENTS_PER_HOUR,
    );
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const commentsLastHour = recentComments.filter(
      (comment) => comment.createdAt >= oneHourAgo,
    );

    if (commentsLastHour.length >= MAX_COMMENTS_PER_HOUR) {
      throw new BusinessRuleError(
        `Maximum ${MAX_COMMENTS_PER_HOUR} comments per hour exceeded`,
        "RATE_LIMIT_EXCEEDED",
      );
    }

    // 4. Create DTO and save via repository
    const dto: CreateCommentDTO = { postId, content };
    return await commentRepository.create(dto, userId);
  },

  /**
   * Retrieves a comment by ID.
   *
   * @param id - Comment ID
   * @returns Comment entity
   * @throws NotFoundError - If comment does not exist
   */
  async getCommentById(id: string): Promise<Comment> {
    const comment = await commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundError("Comment", id);
    }
    return comment;
  },

  /**
   * Updates an existing comment with authorization check.
   *
   * @param id - Comment ID
   * @param rawData - Unvalidated update data
   * @param userId - Requesting user's ID
   * @returns Updated comment entity
   * @throws ValidationError - If input validation fails
   * @throws NotFoundError - If comment does not exist
   * @throws ForbiddenError - If user is not the comment author
   */
  async updateComment(
    id: string,
    rawData: unknown,
    userId: string,
  ): Promise<Comment> {
    // 1. Validate input
    const parseResult = UpdateCommentSchema.safeParse(rawData);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.format());
    }

    // 2. Check existence and authorization
    const existingComment = await commentRepository.findById(id);
    if (!existingComment) {
      throw new NotFoundError("Comment", id);
    }

    if (existingComment.userId !== userId) {
      throw new ForbiddenError("Not authorized to update this comment");
    }

    // 3. Build update DTO
    const dto: UpdateCommentDTO = { content: parseResult.data.content };

    // 4. Update via repository
    return await commentRepository.update(id, dto);
  },

  /**
   * Deletes a comment with authorization check.
   *
   * @param id - Comment ID
   * @param userId - Requesting user's ID
   * @param isAdmin - Whether the user has admin privileges
   * @throws NotFoundError - If comment does not exist
   * @throws ForbiddenError - If user is not authorized to delete
   */
  async deleteComment(
    id: string,
    userId: string,
    isAdmin = false,
  ): Promise<void> {
    const comment = await commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundError("Comment", id);
    }

    if (comment.userId !== userId && !isAdmin) {
      throw new ForbiddenError("Not authorized to delete this comment");
    }

    await commentRepository.delete(id);
  },

  /**
   * Retrieves comments for a specific post.
   *
   * @param postId - Post ID
   * @param limit - Maximum number of comments (default 50)
   * @param offset - Starting offset (default 0)
   * @param ascending - Sort order (default oldest first)
   * @returns Array of comment entities
   * @throws NotFoundError - If post does not exist
   */
  async getCommentsByPost(
    postId: string,
    limit = 50,
    offset = 0,
    ascending = true,
  ): Promise<Comment[]> {
    // Verify post exists
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError("Post", postId);
    }

    return await commentRepository.findByPost(postId, limit, offset, ascending);
  },

  /**
   * Retrieves comments by a specific user.
   *
   * @param userId - User ID
   * @param limit - Maximum number of comments (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of comment entities
   */
  async getCommentsByUser(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<Comment[]> {
    return await commentRepository.findByUser(userId, limit, offset);
  },

  /**
   * Gets the comment count for a post.
   *
   * @param postId - Post ID
   * @returns Number of comments on the post
   */
  async getCommentCount(postId: string): Promise<number> {
    return await commentRepository.countByPost(postId);
  },
};
