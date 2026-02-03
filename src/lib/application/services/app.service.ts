/**
 * App Service
 *
 * Business logic for app/product operations including CRUD,
 * validation, and authorization.
 */

import { appRepository } from '@/lib/infrastructure/repositories/app.repository';
import { companyRepository } from '@/lib/infrastructure/repositories/company.repository';
import { CreateAppSchema, UpdateAppSchema } from '@/lib/validators/app.validator';
import type { App } from '@/lib/domain/entities/app';
import type { CreateAppDTO, UpdateAppDTO } from '@/lib/domain/dtos/app.dto';
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  BusinessRuleError,
} from '../errors';

/**
 * Maximum apps a user can create.
 */
const MAX_APPS_PER_USER = 20;

/**
 * App service with business logic and validation.
 */
export const appService = {
  /**
   * Creates a new app with validation.
   *
   * @param rawData - Unvalidated app creation data
   * @param userId - Creator's user ID
   * @returns Created app entity
   * @throws ValidationError - If input validation fails
   * @throws NotFoundError - If linked company does not exist
   * @throws BusinessRuleError - If business rules are violated
   */
  async createApp(rawData: unknown, userId: string): Promise<App> {
    // 1. Validate input
    const parseResult = CreateAppSchema.safeParse(rawData);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.format());
    }

    const dto: CreateAppDTO = parseResult.data;

    // 2. If company is linked, verify it exists and user owns it
    if (dto.companyId) {
      const company = await companyRepository.findById(dto.companyId);
      if (!company) {
        throw new NotFoundError('Company', dto.companyId);
      }
      if (company.ownerId !== userId) {
        throw new ForbiddenError('Not authorized to add apps to this company');
      }
    }

    // 3. Check user hasn't exceeded app limit
    const userApps = await appRepository.findByUser(userId, MAX_APPS_PER_USER + 1);
    if (userApps.length >= MAX_APPS_PER_USER) {
      throw new BusinessRuleError(
        `Maximum ${MAX_APPS_PER_USER} apps per user exceeded`,
        'APP_LIMIT_EXCEEDED'
      );
    }

    // 4. Create via repository
    return await appRepository.create(dto, userId);
  },

  /**
   * Retrieves an app by ID.
   *
   * @param id - App ID
   * @returns App entity
   * @throws NotFoundError - If app does not exist
   */
  async getAppById(id: string): Promise<App> {
    const app = await appRepository.findById(id);
    if (!app) {
      throw new NotFoundError('App', id);
    }
    return app;
  },

  /**
   * Updates an existing app with authorization check.
   *
   * @param id - App ID
   * @param rawData - Unvalidated update data
   * @param userId - Requesting user's ID
   * @returns Updated app entity
   * @throws ValidationError - If input validation fails
   * @throws NotFoundError - If app does not exist
   * @throws ForbiddenError - If user is not the app owner
   */
  async updateApp(id: string, rawData: unknown, userId: string): Promise<App> {
    // 1. Validate input
    const parseResult = UpdateAppSchema.safeParse(rawData);
    if (!parseResult.success) {
      throw new ValidationError(parseResult.error.format());
    }

    // 2. Check existence and ownership
    const existingApp = await appRepository.findById(id);
    if (!existingApp) {
      throw new NotFoundError('App', id);
    }

    if (existingApp.userId !== userId) {
      throw new ForbiddenError('Not authorized to update this app');
    }

    // 3. Build update DTO
    const dto: UpdateAppDTO = parseResult.data;

    // 4. Update via repository
    return await appRepository.update(id, dto);
  },

  /**
   * Deletes an app with authorization check.
   *
   * @param id - App ID
   * @param userId - Requesting user's ID
   * @param isAdmin - Whether the user has admin privileges
   * @throws NotFoundError - If app does not exist
   * @throws ForbiddenError - If user is not authorized to delete
   */
  async deleteApp(id: string, userId: string, isAdmin = false): Promise<void> {
    const app = await appRepository.findById(id);
    if (!app) {
      throw new NotFoundError('App', id);
    }

    if (app.userId !== userId && !isAdmin) {
      throw new ForbiddenError('Not authorized to delete this app');
    }

    await appRepository.delete(id);
  },

  /**
   * Retrieves apps by company ID.
   *
   * @param companyId - Company ID
   * @param limit - Maximum number of apps (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of app entities
   * @throws NotFoundError - If company does not exist
   */
  async getAppsByCompany(
    companyId: string,
    limit = 20,
    offset = 0
  ): Promise<App[]> {
    // Verify company exists
    const company = await companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError('Company', companyId);
    }

    return await appRepository.findByCompany(companyId, limit, offset);
  },

  /**
   * Retrieves apps by user ID.
   *
   * @param userId - User ID
   * @param limit - Maximum number of apps (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of app entities
   */
  async getAppsByUser(userId: string, limit = 20, offset = 0): Promise<App[]> {
    return await appRepository.findByUser(userId, limit, offset);
  },

  /**
   * Retrieves apps by category.
   *
   * @param category - App category
   * @param limit - Maximum number of apps (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of app entities
   */
  async getAppsByCategory(
    category: string,
    limit = 20,
    offset = 0
  ): Promise<App[]> {
    return await appRepository.findByCategory(category, limit, offset);
  },

  /**
   * Retrieves all apps with pagination.
   *
   * @param limit - Maximum number of apps (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of app entities
   */
  async getAllApps(limit = 20, offset = 0): Promise<App[]> {
    return await appRepository.findAll(limit, offset);
  },

  /**
   * Searches apps by name.
   *
   * @param query - Search query
   * @param limit - Maximum number of results (default 20)
   * @returns Array of matching app entities
   */
  async searchApps(query: string, limit = 20): Promise<App[]> {
    return await appRepository.search(query, limit);
  },

  /**
   * Retrieves top-rated apps.
   *
   * @param limit - Maximum number of apps (default 10)
   * @returns Array of top-rated app entities
   */
  async getTopRatedApps(limit = 10): Promise<App[]> {
    return await appRepository.findTopRated(limit);
  },

  /**
   * Updates app rating statistics.
   * Called after a review is added or updated.
   *
   * @param appId - App ID
   * @param averageRating - New average rating
   * @param totalReviews - New total reviews count
   * @returns Updated app entity
   * @throws NotFoundError - If app does not exist
   */
  async updateRatingStats(
    appId: string,
    averageRating: number,
    totalReviews: number
  ): Promise<App> {
    const app = await appRepository.findById(appId);
    if (!app) {
      throw new NotFoundError('App', appId);
    }

    return await appRepository.updateRatingStats(appId, averageRating, totalReviews);
  },

  /**
   * Checks if a user owns an app.
   *
   * @param appId - App ID
   * @param userId - User ID
   * @returns True if user is the owner
   */
  async checkOwnership(appId: string, userId: string): Promise<boolean> {
    const app = await appRepository.findById(appId);
    if (!app) {
      return false;
    }
    return app.userId === userId;
  },
};
