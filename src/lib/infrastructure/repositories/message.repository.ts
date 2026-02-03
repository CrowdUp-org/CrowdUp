/**
 * Message Repository
 *
 * Handles all database operations for messages and conversations.
 * Infrastructure layer - abstracts Supabase behind a clean interface.
 */

import { supabase } from '@/lib/supabase';
import type { Message, Conversation } from '@/lib/domain/entities/message';
import type { SendMessageDTO } from '@/lib/domain/dtos/message.dto';
import {
  mapRowToMessage,
  mapMessageToInsert,
  mapRowToConversation,
  mapConversationToInsert,
} from '../mappers/message.mapper';
import { buildSafeEqOr, sanitizeForPostgREST } from '@/lib/utils/safe-query';

/**
 * Builds a safe filter for finding conversations between two participants.
 * Matches either (p1=a AND p2=b) OR (p1=b AND p2=a).
 */
const buildParticipantFilter = (userId1: string, userId2: string): string => {
  const sanitized1 = sanitizeForPostgREST(userId1);
  const sanitized2 = sanitizeForPostgREST(userId2);
  return `and(participant1_id.eq.${sanitized1},participant2_id.eq.${sanitized2}),and(participant1_id.eq.${sanitized2},participant2_id.eq.${sanitized1})`;
};

/**
 * Message repository with CRUD and query operations.
 */
export const messageRepository = {
  /**
   * Creates a new message.
   *
   * @param dto - Send message DTO
   * @param senderId - Sender's user ID
   * @returns Created message entity
   * @throws Error if creation fails
   */
  async create(dto: SendMessageDTO, senderId: string): Promise<Message> {
    const insert = mapMessageToInsert(dto, senderId);
    const { data, error } = await supabase
      .from('messages')
      .insert(insert as never)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() } as never)
      .eq('id', dto.conversationId);

    return mapRowToMessage(data);
  },

  /**
   * Finds messages by conversation ID.
   *
   * @param conversationId - Conversation ID
   * @param limit - Maximum number of messages (default 50)
   * @param offset - Starting offset (default 0)
   * @returns Array of message entities (newest first)
   * @throws Error if query fails
   */
  async findByConversation(
    conversationId: string,
    limit = 50,
    offset = 0
  ): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }
    return data.map(mapRowToMessage);
  },

  /**
   * Marks messages as read.
   *
   * @param conversationId - Conversation ID
   * @param userId - User marking messages as read
   * @throws Error if update fails
   */
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ read: true } as never)
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('read', false);

    if (error) {
      throw new Error(`Failed to mark messages as read: ${error.message}`);
    }
  },

  /**
   * Marks specific messages as read.
   *
   * @param messageIds - Array of message IDs
   * @throws Error if update fails
   */
  async markMessagesAsRead(messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) return;

    const { error } = await supabase
      .from('messages')
      .update({ read: true } as never)
      .in('id', messageIds);

    if (error) {
      throw new Error(`Failed to mark messages as read: ${error.message}`);
    }
  },

  /**
   * Gets unread message count for a conversation.
   *
   * @param conversationId - Conversation ID
   * @param userId - User to check unread for
   * @returns Unread message count
   * @throws Error if query fails
   */
  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('read', false);

    if (error) {
      throw new Error(`Failed to count unread messages: ${error.message}`);
    }
    return count ?? 0;
  },

  /**
   * Gets total unread message count for a user.
   *
   * @param userId - User ID
   * @returns Total unread message count
   * @throws Error if query fails
   */
  async getTotalUnreadCount(userId: string): Promise<number> {
    // First get user's conversations
    const participantFilter = buildSafeEqOr(['participant1_id', 'participant2_id'], userId);
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .or(participantFilter);

    if (convError) {
      throw new Error(`Failed to fetch conversations: ${convError.message}`);
    }

    if (conversations.length === 0) return 0;

    const conversationIds = (conversations as Array<{ id: string }>).map((c) => c.id);

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .neq('sender_id', userId)
      .eq('read', false);

    if (error) {
      throw new Error(`Failed to count unread messages: ${error.message}`);
    }
    return count ?? 0;
  },
};

/**
 * Conversation repository with CRUD and query operations.
 */
export const conversationRepository = {
  /**
   * Creates a new conversation.
   *
   * @param participant1Id - First participant's user ID
   * @param participant2Id - Second participant's user ID
   * @returns Created conversation entity
   * @throws Error if creation fails
   */
  async create(participant1Id: string, participant2Id: string): Promise<Conversation> {
    const insert = mapConversationToInsert(participant1Id, participant2Id);
    const { data, error } = await supabase
      .from('conversations')
      .insert(insert as never)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create conversation: ${error.message}`);
    }
    return mapRowToConversation(data);
  },

  /**
   * Finds a conversation by ID.
   *
   * @param id - Conversation ID
   * @returns Conversation entity or null if not found
   * @throws Error if query fails
   */
  async findById(id: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch conversation: ${error.message}`);
    }
    return mapRowToConversation(data);
  },

  /**
   * Finds a conversation between two users.
   *
   * @param userId1 - First user ID
   * @param userId2 - Second user ID
   * @returns Conversation entity or null if not found
   */
  async findByParticipants(userId1: string, userId2: string): Promise<Conversation | null> {
    const filter = buildParticipantFilter(userId1, userId2);
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(filter)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to find conversation: ${error.message}`);
    }
    return data ? mapRowToConversation(data) : null;
  },

  /**
   * Finds or creates a conversation between two users.
   *
   * @param userId1 - First user ID
   * @param userId2 - Second user ID
   * @returns Conversation entity
   */
  async findOrCreate(userId1: string, userId2: string): Promise<Conversation> {
    const existing = await conversationRepository.findByParticipants(userId1, userId2);
    if (existing) {
      return existing;
    }
    return conversationRepository.create(userId1, userId2);
  },

  /**
   * Finds all conversations for a user.
   *
   * @param userId - User ID
   * @param limit - Maximum number of conversations (default 20)
   * @param offset - Starting offset (default 0)
   * @returns Array of conversation entities (most recent first)
   * @throws Error if query fails
   */
  async findByUser(userId: string, limit = 20, offset = 0): Promise<Conversation[]> {
    const participantFilter = buildSafeEqOr(['participant1_id', 'participant2_id'], userId);
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .or(participantFilter)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }
    return data.map(mapRowToConversation);
  },

  /**
   * Deletes a conversation and all its messages.
   *
   * @param id - Conversation ID
   * @throws Error if deletion fails
   */
  async delete(id: string): Promise<void> {
    // Messages are deleted via cascade
    const { error } = await supabase.from('conversations').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
  },
};
