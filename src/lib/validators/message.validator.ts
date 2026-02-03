/**
 * Message Validators
 *
 * Zod schemas for validating messaging-related inputs.
 */

import { z } from 'zod';

/**
 * Schema for starting a new conversation / sending first message.
 */
export const CreateMessageSchema = z.object({
  recipientId: z.string().uuid('Recipient ID must be a valid UUID'),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message must be at most 5000 characters'),
});

/**
 * Schema for sending a message in existing conversation.
 */
export const SendMessageSchema = z.object({
  conversationId: z.string().uuid('Conversation ID must be a valid UUID'),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message must be at most 5000 characters'),
});

/**
 * Schema for marking messages as read.
 */
export const MarkMessagesReadSchema = z.object({
  conversationId: z.string().uuid('Conversation ID must be a valid UUID'),
  messageIds: z.array(z.string().uuid()).optional(),
});

/**
 * Schema for conversation list query.
 */
export const ConversationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
});

/**
 * Schema for message history query.
 */
export const MessageHistoryQuerySchema = z.object({
  conversationId: z.string().uuid('Conversation ID must be a valid UUID'),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
  beforeId: z.string().uuid().optional(),
});

// Inferred types from schemas
export type CreateMessageInput = z.infer<typeof CreateMessageSchema>;
export type SendMessageInput = z.infer<typeof SendMessageSchema>;
export type MarkMessagesReadInput = z.infer<typeof MarkMessagesReadSchema>;
export type ConversationListQueryInput = z.infer<typeof ConversationListQuerySchema>;
export type MessageHistoryQueryInput = z.infer<typeof MessageHistoryQuerySchema>;
