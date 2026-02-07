/**
 * Notification Repository
 *
 * Handles all database operations for notifications.
 * Infrastructure layer - abstracts Supabase behind a clean interface.
 */

import { supabase } from "@/lib/supabase";
import type { Notification } from "@/lib/domain/entities/notification";
import {
  mapRowToNotification,
  mapNotificationToInsert,
  type CreateNotificationDTO,
} from "../mappers/notification.mapper";

/**
 * Notification repository with CRUD and query operations.
 */
export const notificationRepository = {
  /**
   * Creates a new notification.
   *
   * @param dto - Create notification DTO
   * @returns Created notification entity
   * @throws Error if creation fails
   */
  async create(dto: CreateNotificationDTO): Promise<Notification> {
    const insert = mapNotificationToInsert(dto);
    const { data, error } = await supabase
      .from("notifications")
      .insert(insert as never)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
    return mapRowToNotification(data);
  },

  /**
   * Finds a notification by ID.
   *
   * @param id - Notification ID
   * @returns Notification entity or null if not found
   * @throws Error if query fails
   */
  async findById(id: string): Promise<Notification | null> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Failed to fetch notification: ${error.message}`);
    }
    return mapRowToNotification(data);
  },

  /**
   * Finds notifications for a user.
   *
   * @param userId - User ID
   * @param limit - Maximum number of notifications (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of notification entities (newest first)
   * @throws Error if query fails
   */
  async findByUser(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<Notification[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
    return data.map(mapRowToNotification);
  },

  /**
   * Finds unread notifications for a user.
   *
   * @param userId - User ID
   * @param limit - Maximum number of notifications (default 20)
   * @returns Array of unread notification entities
   * @throws Error if query fails
   */
  async findUnreadByUser(userId: string, limit = 20): Promise<Notification[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch unread notifications: ${error.message}`);
    }
    return data.map(mapRowToNotification);
  },

  /**
   * Marks a notification as read.
   *
   * @param id - Notification ID
   * @returns Updated notification entity
   * @throws Error if update fails
   */
  async markAsRead(id: string): Promise<Notification> {
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true } as never)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
    return mapRowToNotification(data);
  },

  /**
   * Marks all notifications as read for a user.
   *
   * @param userId - User ID
   * @throws Error if update fails
   */
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true } as never)
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      throw new Error(
        `Failed to mark all notifications as read: ${error.message}`,
      );
    }
  },

  /**
   * Gets unread notification count for a user.
   *
   * @param userId - User ID
   * @returns Unread count
   * @throws Error if query fails
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      throw new Error(`Failed to count unread notifications: ${error.message}`);
    }
    return count ?? 0;
  },

  /**
   * Deletes a notification.
   *
   * @param id - Notification ID
   * @throws Error if deletion fails
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  },

  /**
   * Deletes old notifications for a user.
   *
   * @param userId - User ID
   * @param olderThanDays - Delete notifications older than this many days
   * @throws Error if deletion fails
   */
  async deleteOld(userId: string, olderThanDays: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", userId)
      .lt("created_at", cutoffDate.toISOString());

    if (error) {
      throw new Error(`Failed to delete old notifications: ${error.message}`);
    }
  },
};
