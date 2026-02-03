/**
 * Message Entity
 *
 * Represents direct messages between users.
 * Domain layer - no external dependencies.
 */

/**
 * Core message entity.
 */
export interface Message {
  /** Unique identifier (UUID) */
  id: string;

  /** Parent conversation ID */
  conversationId: string;

  /** Sender user ID */
  senderId: string;

  /** Message content (1-5000 chars) */
  content: string;

  /** Read status */
  read: boolean;

  /** Send timestamp */
  createdAt: Date;
}

/**
 * Conversation entity (between two users).
 */
export interface Conversation {
  /** Unique identifier (UUID) */
  id: string;

  /** First participant user ID */
  participant1Id: string;

  /** Second participant user ID */
  participant2Id: string;

  /** Creation timestamp */
  createdAt: Date;

  /** Last activity timestamp */
  updatedAt: Date;
}

/**
 * Conversation with participant info and last message.
 */
export interface ConversationWithDetails extends Conversation {
  otherParticipant: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  lastMessage: {
    content: string;
    createdAt: Date;
    read: boolean;
  } | null;
  unreadCount: number;
}

/**
 * Message with sender info for display.
 */
export interface MessageWithSender extends Message {
  sender: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}
