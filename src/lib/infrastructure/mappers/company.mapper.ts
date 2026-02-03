/**
 * Company Mapper
 *
 * Maps between database rows (snake_case) and domain entities (camelCase).
 * Infrastructure layer - depends on Domain and Database types.
 */

import type { Company, CompanyCategory } from '@/lib/domain/entities/company';
import type { CreateCompanyDTO, UpdateCompanyDTO } from '@/lib/domain/dtos/company.dto';
import type { Database } from '@/lib/database.types';

type CompanyRow = Database['public']['Tables']['companies']['Row'];
type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

/**
 * Maps a database row to a Company entity.
 *
 * @param row - Database row from companies table
 * @returns Company domain entity
 */
export const mapRowToCompany = (row: CompanyRow): Company => ({
  id: row.id,
  name: row.name,
  displayName: row.display_name,
  description: row.description,
  logoUrl: row.logo_url,
  website: row.website,
  category: row.category as CompanyCategory | null,
  ownerId: row.owner_id,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

/**
 * Maps a CreateCompanyDTO to a database insert object.
 *
 * @param dto - Create company DTO
 * @param ownerId - Owner's user ID (optional)
 * @returns Database insert object
 */
export const mapCompanyToInsert = (
  dto: CreateCompanyDTO,
  ownerId?: string | null
): CompanyInsert => ({
  name: dto.name,
  display_name: dto.displayName,
  description: dto.description ?? null,
  logo_url: dto.logoUrl ?? null,
  website: dto.website ?? null,
  category: dto.category ?? null,
  owner_id: ownerId ?? null,
});

/**
 * Maps an UpdateCompanyDTO to a database update object.
 *
 * @param dto - Update company DTO
 * @returns Database update object (only includes provided fields)
 */
export const mapCompanyToUpdate = (dto: UpdateCompanyDTO): CompanyUpdate => {
  const update: CompanyUpdate = {};

  if (dto.displayName !== undefined) {
    update.display_name = dto.displayName;
  }
  if (dto.description !== undefined) {
    update.description = dto.description;
  }
  if (dto.logoUrl !== undefined) {
    update.logo_url = dto.logoUrl;
  }
  if (dto.website !== undefined) {
    update.website = dto.website;
  }
  if (dto.category !== undefined) {
    update.category = dto.category;
  }

  return update;
};
