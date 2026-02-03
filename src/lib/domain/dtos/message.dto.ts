/**
 * Message DTOs
 *
 * Data Transfer Objects for messaging operations.
 * Domain layer - no external dependencies.
 */

/**
 * DTO for sending a new message.
 */
export interface CreateMessageDTO {
  /** Recipient user ID */
  recipientId: string;

  /** Message content (1-5000 chars) */
  content: string;
}

/**
 * DTO for sending a message in existing conversation.
 */
export interface SendMessageDTO {
  /** Target conversation ID */
  conversationId: string;

  /** Message content (1-5000 chars) */
  content: string;
}

/**
 * DTO for marking messages as read.
 */
export interface MarkMessagesReadDTO {
  /** Conversation ID */
  conversationId: string;

  /** Optional: specific message IDs (if empty, mark all) */
  messageIds?: string[];
}

/**
 * DTO for conversation listing query.
 */
export interface ConversationListQueryDTO {
  /** Page number (1-based) */
  page?: number;

  /** Items per page (default 20, max 100) */
  limit?: number;
}

/**
 * DTO for message history query.
 */
export interface MessageHistoryQueryDTO {
  /** Conversation ID */
  conversationId: string;

  /** Page number (1-based) */
  page?: number;

  /** Items per page (default 50, max 100) */
  limit?: number;

  /** Load messages before this ID (for infinite scroll) */
  beforeId?: string;
}
