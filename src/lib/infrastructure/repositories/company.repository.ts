/**
 * Company Repository
 *
 * Handles all database operations for companies.
 * Infrastructure layer - abstracts Supabase behind a clean interface.
 */

import { supabase } from '@/lib/supabase';
import type { Company } from '@/lib/domain/entities/company';
import type { CreateCompanyDTO, UpdateCompanyDTO } from '@/lib/domain/dtos/company.dto';
import { mapRowToCompany, mapCompanyToInsert, mapCompanyToUpdate } from '../mappers/company.mapper';

/**
 * Company repository with CRUD and query operations.
 */
export const companyRepository = {
  /**
   * Creates a new company.
   *
   * @param dto - Create company DTO
   * @param ownerId - Owner's user ID (optional)
   * @returns Created company entity
   * @throws Error if creation fails
   */
  async create(dto: CreateCompanyDTO, ownerId?: string): Promise<Company> {
    const insert = mapCompanyToInsert(dto, ownerId);
    const { data, error } = await supabase
      .from('companies')
      .insert(insert as never)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create company: ${error.message}`);
    }
    return mapRowToCompany(data);
  },

  /**
   * Finds a company by ID.
   *
   * @param id - Company ID
   * @returns Company entity or null if not found
   * @throws Error if query fails
   */
  async findById(id: string): Promise<Company | null> {
    const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch company: ${error.message}`);
    }
    return mapRowToCompany(data);
  },

  /**
   * Finds a company by name (URL slug).
   *
   * @param name - Company name/slug
   * @returns Company entity or null if not found
   * @throws Error if query fails
   */
  async findByName(name: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('name', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch company: ${error.message}`);
    }
    return mapRowToCompany(data);
  },

  /**
   * Finds companies by owner ID.
   *
   * @param ownerId - Owner's user ID
   * @returns Array of company entities
   * @throws Error if query fails
   */
  async findByOwner(ownerId: string): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch owner companies: ${error.message}`);
    }
    return data.map(mapRowToCompany);
  },

  /**
   * Updates a company.
   *
   * @param id - Company ID
   * @param dto - Update company DTO
   * @returns Updated company entity
   * @throws Error if update fails
   */
  async update(id: string, dto: UpdateCompanyDTO): Promise<Company> {
    const update = mapCompanyToUpdate(dto);
    const { data, error } = await supabase
      .from('companies')
      .update(update as never)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update company: ${error.message}`);
    }
    return mapRowToCompany(data);
  },

  /**
   * Deletes a company.
   *
   * @param id - Company ID
   * @throws Error if deletion fails
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('companies').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete company: ${error.message}`);
    }
  },

  /**
   * Finds all companies with optional pagination.
   *
   * @param limit - Maximum number of companies (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of company entities
   * @throws Error if query fails
   */
  async findAll(limit = 20, offset = 0): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('display_name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch companies: ${error.message}`);
    }
    return data.map(mapRowToCompany);
  },

  /**
   * Searches companies by display name.
   *
   * @param query - Search query
   * @param limit - Maximum number of results (default 20)
   * @returns Array of matching company entities
   * @throws Error if query fails
   */
  async search(query: string, limit = 20): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .ilike('display_name', `%${query}%`)
      .order('display_name', { ascending: true })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search companies: ${error.message}`);
    }
    return data.map(mapRowToCompany);
  },

  /**
   * Finds companies by category.
   *
   * @param category - Company category
   * @param limit - Maximum number of companies (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of company entities
   * @throws Error if query fails
   */
  async findByCategory(category: string, limit = 20, offset = 0): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('category', category)
      .order('display_name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch companies by category: ${error.message}`);
    }
    return data.map(mapRowToCompany);
  },

  /**
   * Checks if a company name is available.
   *
   * @param name - Company name/slug to check
   * @returns True if name is available
   */
  async isNameAvailable(name: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('companies')
      .select('id')
      .eq('name', name)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to check company name: ${error.message}`);
    }
    return data === null;
  },
};
