/**
 * Notification Mapper
 *
 * Maps between database rows (snake_case) and domain entities (camelCase).
 * Infrastructure layer - depends on Domain and Database types.
 */

import type { Notification, NotificationType } from '@/lib/domain/entities/notification';
import type { Database } from '@/lib/database.types';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

/**
 * DTO for creating a notification.
 */
export interface CreateNotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  link?: string | null;
}

/**
 * Maps a database row to a Notification entity.
 *
 * @param row - Database row from notifications table
 * @returns Notification domain entity
 */
export const mapRowToNotification = (row: NotificationRow): Notification => ({
  id: row.id,
  userId: row.user_id,
  type: row.type,
  title: row.title,
  content: row.content,
  link: row.link,
  isRead: row.is_read,
  createdAt: new Date(row.created_at),
});

/**
 * Maps a CreateNotificationDTO to a database insert object.
 *
 * @param dto - Create notification DTO
 * @returns Database insert object
 */
export const mapNotificationToInsert = (dto: CreateNotificationDTO): NotificationInsert => ({
  user_id: dto.userId,
  type: dto.type,
  title: dto.title,
  content: dto.content,
  link: dto.link ?? null,
  is_read: false,
});
