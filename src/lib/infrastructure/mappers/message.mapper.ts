/**
 * Message Mapper
 *
 * Maps between database rows (snake_case) and domain entities (camelCase).
 * Infrastructure layer - depends on Domain and Database types.
 */

import type { Message, Conversation } from "@/lib/domain/entities/message";
import type { SendMessageDTO } from "@/lib/domain/dtos/message.dto";
import type { Database } from "@/lib/database.types";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];
type ConversationInsert =
  Database["public"]["Tables"]["conversations"]["Insert"];

/**
 * Maps a database row to a Message entity.
 *
 * @param row - Database row from messages table
 * @returns Message domain entity
 */
export const mapRowToMessage = (row: MessageRow): Message => ({
  id: row.id,
  conversationId: row.conversation_id,
  senderId: row.sender_id,
  content: row.content,
  read: row.read,
  createdAt: new Date(row.created_at),
});

/**
 * Maps a SendMessageDTO to a database insert object.
 *
 * @param dto - Send message DTO
 * @param senderId - Sender's user ID
 * @returns Database insert object
 */
export const mapMessageToInsert = (
  dto: SendMessageDTO,
  senderId: string,
): MessageInsert => ({
  conversation_id: dto.conversationId,
  sender_id: senderId,
  content: dto.content,
  read: false,
});

/**
 * Maps a database row to a Conversation entity.
 *
 * @param row - Database row from conversations table
 * @returns Conversation domain entity
 */
export const mapRowToConversation = (row: ConversationRow): Conversation => ({
  id: row.id,
  participant1Id: row.participant1_id,
  participant2Id: row.participant2_id,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
});

/**
 * Creates a conversation insert object.
 *
 * @param participant1Id - First participant's user ID
 * @param participant2Id - Second participant's user ID
 * @returns Database insert object
 */
export const mapConversationToInsert = (
  participant1Id: string,
  participant2Id: string,
): ConversationInsert => ({
  participant1_id: participant1Id,
  participant2_id: participant2Id,
});
