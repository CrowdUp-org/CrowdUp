/**
 * App Mapper
 *
 * Maps between database rows (snake_case) and domain entities (camelCase).
 * Infrastructure layer - depends on Domain and Database types.
 */

import type { App, AppCategory } from '@/lib/domain/entities/app';
import type { CreateAppDTO, UpdateAppDTO } from '@/lib/domain/dtos/app.dto';
import type { Database } from '@/lib/database.types';

type AppRow = Database['public']['Tables']['apps']['Row'];
type AppInsert = Database['public']['Tables']['apps']['Insert'];
type AppUpdate = Database['public']['Tables']['apps']['Update'];

/**
 * Maps a database row to an App entity.
 *
 * @param row - Database row from apps table
 * @returns App domain entity
 */
export const mapRowToApp = (row: AppRow): App => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  description: row.description,
  appUrl: row.app_url,
  logoUrl: row.logo_url,
  category: row.category as AppCategory,
  averageRating: row.average_rating,
  totalReviews: row.total_reviews,
  companyId: row.company_id,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

/**
 * Maps a CreateAppDTO to a database insert object.
 *
 * @param dto - Create app DTO
 * @param userId - Creator's user ID
 * @returns Database insert object
 */
export const mapAppToInsert = (dto: CreateAppDTO, userId: string): AppInsert => ({
  user_id: userId,
  name: dto.name,
  description: dto.description,
  app_url: dto.appUrl ?? null,
  logo_url: dto.logoUrl ?? null,
  category: dto.category,
  average_rating: 0,
  total_reviews: 0,
  company_id: dto.companyId ?? null,
});

/**
 * Maps an UpdateAppDTO to a database update object.
 *
 * @param dto - Update app DTO
 * @returns Database update object (only includes provided fields)
 */
export const mapAppToUpdate = (dto: UpdateAppDTO): AppUpdate => {
  const update: AppUpdate = {};

  if (dto.name !== undefined) {
    update.name = dto.name;
  }
  if (dto.description !== undefined) {
    update.description = dto.description;
  }
  if (dto.appUrl !== undefined) {
    update.app_url = dto.appUrl;
  }
  if (dto.logoUrl !== undefined) {
    update.logo_url = dto.logoUrl;
  }
  if (dto.category !== undefined) {
    update.category = dto.category;
  }

  return update;
};
