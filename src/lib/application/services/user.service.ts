/**
 * User Service
 *
 * Business logic for user operations including profile management,
 * validation, and authorization.
 */

import { userRepository } from "@/lib/infrastructure/repositories/user.repository";
import { UpdateUserSchema } from "@/lib/validators/user.validator";
import type { User, PublicUser } from "@/lib/domain/entities/user";
import type { UpdateUserDTO } from "@/lib/domain/dtos/user.dto";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} from "../errors";

/**
 * User service with business logic and validation.
 */
export const userService = {
  /**
   * Retrieves a user by ID.
   *
   * @param id - User ID
   * @returns User entity (excluding sensitive data for public access)
   * @throws NotFoundError - If user does not exist
   */
  async getUserById(id: string): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User", id);
    }
    return user;
  },

  /**
   * Retrieves a user by username.
   *
   * @param username - Username
   * @returns User entity
   * @throws NotFoundError - If user does not exist
   */
  async getUserByUsername(username: string): Promise<User> {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new NotFoundError("User", username);
    }
    return user;
  },

  /**
   * Retrieves a public-safe user profile by username.
   *
   * @param username - Username
   * @returns Public user profile (no sensitive data)
   * @throws NotFoundError - If user does not exist
   */
  async getPublicProfile(username: string): Promise<PublicUser> {
    const user = await userRepository.findByUsername(username);
    if (!user) {
      throw new NotFoundError("User", username);
    }

    // Map to public-safe user data
    const publicUser: PublicUser = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      reputationScore: user.reputationScore,
      reputationLevel: user.reputationLevel,
    };

    return publicUser;
  },

  /**
   * Updates a user's profile with authorization check.
   *
   * @param id - User ID to update
   * @param rawData - Unvalidated update data
   * @param requestingUserId - ID of user making the request
   * @returns Updated user entity
   * @throws ValidationError - If input validation fails
   * @throws NotFoundError - If user does not exist
   * @throws ForbiddenError - If user is not authorized to update
   */
  async updateProfile(
    id: string,
    rawData: unknown,
    requestingUserId: string,
  ): Promise<User> {
    // 1. Authorization check
    if (id !== requestingUserId) {
      throw new ForbiddenError("Not authorized to update this profile");
    }

    // 2. Validate input
    const parseResult = UpdateUserSchema.safeParse(rawData);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.format());
    }

    // 3. Check user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError("User", id);
    }

    // 4. Build update DTO
    const dto: UpdateUserDTO = parseResult.data;

    // 5. Update via repository
    return await userRepository.update(id, dto);
  },

  /**
   * Admin-only: Updates any user's profile.
   *
   * @param id - User ID to update
   * @param rawData - Unvalidated update data
   * @param isAdmin - Whether the requester has admin privileges
   * @returns Updated user entity
   * @throws ValidationError - If input validation fails
   * @throws NotFoundError - If user does not exist
   * @throws ForbiddenError - If requester is not an admin
   */
  async adminUpdateProfile(
    id: string,
    rawData: unknown,
    isAdmin: boolean,
  ): Promise<User> {
    // 1. Authorization check
    if (!isAdmin) {
      throw new ForbiddenError("Admin privileges required");
    }

    // 2. Validate input
    const parseResult = UpdateUserSchema.safeParse(rawData);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.format());
    }

    // 3. Check user exists
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError("User", id);
    }

    // 4. Update via repository
    return await userRepository.update(id, parseResult.data);
  },

  /**
   * Retrieves top users by reputation.
   *
   * @param limit - Maximum number of users (default 10)
   * @returns Array of public user profiles
   */
  async getLeaderboard(limit = 10): Promise<PublicUser[]> {
    const users = await userRepository.findTopByReputation(limit);
    return users.map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      reputationScore: user.reputationScore,
      reputationLevel: user.reputationLevel,
    }));
  },

  /**
   * Checks if a username is available.
   *
   * @param username - Username to check
   * @returns True if available
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    return await userRepository.isUsernameAvailable(username);
  },

  /**
   * Checks if an email is available.
   *
   * @param email - Email to check
   * @returns True if available
   */
  async isEmailAvailable(email: string): Promise<boolean> {
    return await userRepository.isEmailAvailable(email);
  },

  /**
   * Updates user reputation points.
   *
   * @param userId - User ID
   * @param points - Points to add (can be negative)
   * @returns Updated user entity
   * @throws NotFoundError - If user does not exist
   * @throws BusinessRuleError - If points would go below 0
   */
  async updateReputation(userId: string, points: number): Promise<User> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User", userId);
    }

    const newScore = user.reputationScore + points;
    if (newScore < 0) {
      throw new BusinessRuleError(
        "Reputation cannot go below 0",
        "REPUTATION_FLOOR_REACHED",
      );
    }

    // Calculate reputation level based on score
    const newLevel = this.calculateReputationLevel(newScore);

    return await userRepository.updateReputation(userId, points, newLevel);
  },

  /**
   * Calculates reputation level based on score.
   *
   * @param score - Reputation score
   * @returns Reputation level string
   */
  calculateReputationLevel(
    score: number,
  ):
    | "Newcomer"
    | "Contributor"
    | "Active Member"
    | "Trusted Voice"
    | "Community Leader"
    | "Legend" {
    if (score >= 10000) return "Legend";
    if (score >= 5000) return "Community Leader";
    if (score >= 1000) return "Trusted Voice";
    if (score >= 500) return "Active Member";
    if (score >= 100) return "Contributor";
    return "Newcomer";
  },

  /**
   * Retrieves all users with pagination.
   *
   * @param limit - Maximum number of users (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of user entities
   */
  async getAllUsers(limit = 20, offset = 0): Promise<User[]> {
    return await userRepository.findAll(limit, offset);
  },
};
