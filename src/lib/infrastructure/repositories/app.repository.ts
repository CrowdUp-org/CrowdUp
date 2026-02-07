/**
 * App Repository
 *
 * Handles all database operations for apps.
 * Infrastructure layer - abstracts Supabase behind a clean interface.
 */

import { supabase } from "@/lib/supabase";
import type { App } from "@/lib/domain/entities/app";
import type { CreateAppDTO, UpdateAppDTO } from "@/lib/domain/dtos/app.dto";
import {
  mapRowToApp,
  mapAppToInsert,
  mapAppToUpdate,
} from "../mappers/app.mapper";

/**
 * App repository with CRUD and query operations.
 */
export const appRepository = {
  /**
   * Creates a new app.
   *
   * @param dto - Create app DTO
   * @param userId - Creator's user ID
   * @returns Created app entity
   * @throws Error if creation fails
   */
  async create(dto: CreateAppDTO, userId: string): Promise<App> {
    const insert = mapAppToInsert(dto, userId);
    const { data, error } = await supabase
      .from("apps")
      .insert(insert as never)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create app: ${error.message}`);
    }
    return mapRowToApp(data);
  },

  /**
   * Finds an app by ID.
   *
   * @param id - App ID
   * @returns App entity or null if not found
   * @throws Error if query fails
   */
  async findById(id: string): Promise<App | null> {
    const { data, error } = await supabase
      .from("apps")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch app: ${error.message}`);
    }
    return mapRowToApp(data);
  },

  /**
   * Updates an app.
   *
   * @param id - App ID
   * @param dto - Update app DTO
   * @returns Updated app entity
   * @throws Error if update fails
   */
  async update(id: string, dto: UpdateAppDTO): Promise<App> {
    const update = mapAppToUpdate(dto);
    const { data, error } = await supabase
      .from("apps")
      .update(update as never)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update app: ${error.message}`);
    }
    return mapRowToApp(data);
  },

  /**
   * Deletes an app.
   *
   * @param id - App ID
   * @throws Error if deletion fails
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("apps").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete app: ${error.message}`);
    }
  },

  /**
   * Finds apps by company ID.
   *
   * @param companyId - Company ID
   * @param limit - Maximum number of apps (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of app entities
   * @throws Error if query fails
   */
  async findByCompany(
    companyId: string,
    limit = 20,
    offset = 0,
  ): Promise<App[]> {
    const { data, error } = await supabase
      .from("apps")
      .select("*")
      .eq("company_id", companyId)
      .order("name", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch company apps: ${error.message}`);
    }
    return data.map(mapRowToApp);
  },

  /**
   * Finds apps by category.
   *
   * @param category - App category
   * @param limit - Maximum number of apps (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of app entities
   * @throws Error if query fails
   */
  async findByCategory(
    category: string,
    limit = 20,
    offset = 0,
  ): Promise<App[]> {
    const { data, error } = await supabase
      .from("apps")
      .select("*")
      .eq("category", category)
      .order("average_rating", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch apps by category: ${error.message}`);
    }
    return data.map(mapRowToApp);
  },

  /**
   * Finds apps by user ID.
   *
   * @param userId - User ID
   * @param limit - Maximum number of apps (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of app entities
   * @throws Error if query fails
   */
  async findByUser(userId: string, limit = 20, offset = 0): Promise<App[]> {
    const { data, error } = await supabase
      .from("apps")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch user apps: ${error.message}`);
    }
    return data.map(mapRowToApp);
  },

  /**
   * Finds all apps with optional pagination.
   *
   * @param limit - Maximum number of apps (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of app entities
   * @throws Error if query fails
   */
  async findAll(limit = 20, offset = 0): Promise<App[]> {
    const { data, error } = await supabase
      .from("apps")
      .select("*")
      .order("average_rating", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch apps: ${error.message}`);
    }
    return data.map(mapRowToApp);
  },

  /**
   * Searches apps by name.
   *
   * @param query - Search query
   * @param limit - Maximum number of results (default 20)
   * @returns Array of matching app entities
   * @throws Error if query fails
   */
  async search(query: string, limit = 20): Promise<App[]> {
    const { data, error } = await supabase
      .from("apps")
      .select("*")
      .ilike("name", `%${query}%`)
      .order("average_rating", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search apps: ${error.message}`);
    }
    return data.map(mapRowToApp);
  },

  /**
   * Finds top-rated apps.
   *
   * @param limit - Maximum number of apps (default 10)
   * @returns Array of top-rated app entities
   * @throws Error if query fails
   */
  async findTopRated(limit = 10): Promise<App[]> {
    const { data, error } = await supabase
      .from("apps")
      .select("*")
      .gte("total_reviews", 5) // Only apps with at least 5 reviews
      .order("average_rating", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch top-rated apps: ${error.message}`);
    }
    return data.map(mapRowToApp);
  },

  /**
   * Updates app rating stats.
   *
   * @param id - App ID
   * @param averageRating - New average rating
   * @param totalReviews - New total reviews count
   * @returns Updated app entity
   * @throws Error if update fails
   */
  async updateRatingStats(
    id: string,
    averageRating: number,
    totalReviews: number,
  ): Promise<App> {
    const { data, error } = await supabase
      .from("apps")
      .update({
        average_rating: averageRating,
        total_reviews: totalReviews,
      } as never)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update app rating: ${error.message}`);
    }
    return mapRowToApp(data);
  },
};
