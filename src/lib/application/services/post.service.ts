/**
 * Post Service
 *
 * Business logic for post operations including CRUD, validation,
 * authorization, and trending post algorithms.
 */

import { postRepository } from "@/lib/infrastructure/repositories/post.repository";
import {
  CreatePostSchema,
  UpdatePostSchema,
  TrendingPostsQuerySchema,
} from "@/lib/validators/post.validator";
import type { Post } from "@/lib/domain/entities/post";
import type { CreatePostDTO, UpdatePostDTO } from "@/lib/domain/dtos/post.dto";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} from "../errors";

/**
 * Maximum posts a user can create per day.
 */
const MAX_POSTS_PER_DAY = 10;

/**
 * Post service with business logic and validation.
 */
export const postService = {
  /**
   * Creates a new post with validation.
   *
   * @param rawData - Unvalidated post creation data
   * @param userId - Author's user ID
   * @returns Created post entity
   * @throws ValidationError - If input validation fails
   * @throws BusinessRuleError - If business rules are violated
   */
  async createPost(rawData: unknown, userId: string): Promise<Post> {
    // 1. Validate input
    const parseResult = CreatePostSchema.safeParse(rawData);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.format());
    }

    const dto: CreatePostDTO = parseResult.data;

    // 2. Business rules - check rate limiting (optional enhancement)
    const recentPosts = await postRepository.findByUser(
      userId,
      MAX_POSTS_PER_DAY,
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const postsToday = recentPosts.filter((post) => post.createdAt >= today);

    if (postsToday.length >= MAX_POSTS_PER_DAY) {
      throw new BusinessRuleError(
        `Maximum ${MAX_POSTS_PER_DAY} posts per day exceeded`,
        "RATE_LIMIT_EXCEEDED",
      );
    }

    // 3. Create via repository
    return await postRepository.create(dto, userId);
  },

  /**
   * Retrieves a post by ID.
   *
   * @param id - Post ID
   * @returns Post entity
   * @throws NotFoundError - If post does not exist
   */
  async getPostById(id: string): Promise<Post> {
    const post = await postRepository.findById(id);
    if (!post) {
      throw new NotFoundError("Post", id);
    }
    return post;
  },

  /**
   * Updates an existing post with authorization check.
   *
   * @param id - Post ID
   * @param rawData - Unvalidated update data
   * @param userId - Requesting user's ID
   * @returns Updated post entity
   * @throws ValidationError - If input validation fails
   * @throws NotFoundError - If post does not exist
   * @throws ForbiddenError - If user is not the post author
   */
  async updatePost(
    id: string,
    rawData: unknown,
    userId: string,
  ): Promise<Post> {
    // 1. Validate input
    const parseResult = UpdatePostSchema.safeParse(rawData);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.format());
    }

    // 2. Check existence and authorization
    const existingPost = await postRepository.findById(id);
    if (!existingPost) {
      throw new NotFoundError("Post", id);
    }

    if (existingPost.userId !== userId) {
      throw new ForbiddenError("Not authorized to update this post");
    }

    // 3. Build update DTO
    const dto: UpdatePostDTO = parseResult.data;

    // 4. Update via repository
    return await postRepository.update(id, dto);
  },

  /**
   * Deletes a post with authorization check.
   *
   * @param id - Post ID
   * @param userId - Requesting user's ID
   * @param isAdmin - Whether the user has admin privileges
   * @throws NotFoundError - If post does not exist
   * @throws ForbiddenError - If user is not authorized to delete
   */
  async deletePost(id: string, userId: string, isAdmin = false): Promise<void> {
    const post = await postRepository.findById(id);
    if (!post) {
      throw new NotFoundError("Post", id);
    }

    if (post.userId !== userId && !isAdmin) {
      throw new ForbiddenError("Not authorized to delete this post");
    }

    await postRepository.delete(id);
  },

  /**
   * Retrieves posts by a specific user.
   *
   * @param userId - User ID to fetch posts for
   * @param limit - Maximum number of posts (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of post entities
   */
  async getPostsByUser(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<Post[]> {
    return await postRepository.findByUser(userId, limit, offset);
  },

  /**
   * Retrieves posts by company name.
   *
   * @param company - Company name
   * @param limit - Maximum number of posts (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of post entities
   */
  async getPostsByCompany(
    company: string,
    limit = 20,
    offset = 0,
  ): Promise<Post[]> {
    return await postRepository.findByCompany(company, limit, offset);
  },

  /**
   * Retrieves posts by app ID.
   *
   * @param appId - App ID
   * @param limit - Maximum number of posts (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of post entities
   */
  async getPostsByApp(appId: string, limit = 20, offset = 0): Promise<Post[]> {
    return await postRepository.findByApp(appId, limit, offset);
  },

  /**
   * Retrieves trending posts with validation.
   *
   * @param rawQuery - Unvalidated query parameters
   * @returns Array of trending post entities
   * @throws ValidationError - If query parameters are invalid
   */
  async getTrendingPosts(rawQuery: unknown = {}): Promise<Post[]> {
    const parseResult = TrendingPostsQuerySchema.safeParse(rawQuery);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.format());
    }

    const { limit } = parseResult.data;
    return await postRepository.findTrending(limit ?? 10);
  },

  /**
   * Retrieves all posts with pagination.
   *
   * @param limit - Maximum number of posts (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of post entities
   */
  async getAllPosts(limit = 20, offset = 0): Promise<Post[]> {
    return await postRepository.findAll(limit, offset);
  },

  /**
   * Updates vote count on a post.
   * Called internally by voteService after vote changes.
   *
   * @param postId - Post ID
   * @param netVotes - New net vote count
   * @returns Updated post entity
   * @throws NotFoundError - If post does not exist
   */
  async updateVoteCount(postId: string, netVotes: number): Promise<Post> {
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError("Post", postId);
    }

    // Calculate the increment needed
    const increment = netVotes - post.votes;
    return await postRepository.updateVoteCount(postId, increment);
  },
};
