import { supabase } from "./supabase";
import { getCurrentUserId } from "./auth";

export interface ConversationWithUser {
  id: string;
  otherUser: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
  };
  lastMessage: {
    content: string;
    created_at: string;
    sender_id: string;
  } | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(
  otherUserId: string,
): Promise<{ conversationId: string | null; error: string | null }> {
  try {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      return { conversationId: null, error: "Not authenticated" };
    }

    // Order user IDs consistently
    const [participant1, participant2] = [currentUserId, otherUserId].sort();

    // Check if conversation exists
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("participant1_id", participant1)
      .eq("participant2_id", participant2)
      .single();

    if (existing) {
      return { conversationId: existing.id, error: null };
    }

    // Create new conversation
    const { data: newConv, error: createError } = await supabase
      .from("conversations")
      .insert({
        participant1_id: participant1,
        participant2_id: participant2,
      })
      .select("id")
      .single();

    if (createError || !newConv) {
      return { conversationId: null, error: "Failed to create conversation" };
    }

    return { conversationId: newConv.id, error: null };
  } catch (error) {
    return { conversationId: null, error: "An error occurred" };
  }
}

/**
 * Get all conversations for the current user with their connections
 */
export async function getUserConversations(): Promise<{
  conversations: ConversationWithUser[];
  error: string | null;
}> {
  try {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      return { conversations: [], error: "Not authenticated" };
    }

    // Get all conversations where user is a participant
    const { data: conversations, error: convError } = await supabase
      .from("conversations")
      .select("*")
      .or(
        `participant1_id.eq.${currentUserId},participant2_id.eq.${currentUserId}`,
      )
      .order("updated_at", { ascending: false });

    if (convError || !conversations) {
      return { conversations: [], error: "Failed to fetch conversations" };
    }

    // Get user details and last messages for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId =
          conv.participant1_id === currentUserId
            ? conv.participant2_id
            : conv.participant1_id;

        // Get other user details
        const { data: userData } = await supabase
          .from("users")
          .select("id, username, display_name, avatar_url")
          .eq("id", otherUserId)
          .single();

        // Get last message
        const { data: lastMessage } = await supabase
          .from("messages")
          .select("content, created_at, sender_id")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // Get unread count
        const { count: unreadCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .eq("read", false)
          .neq("sender_id", currentUserId);

        return {
          id: conv.id,
          otherUser: userData || {
            id: otherUserId,
            username: "unknown",
            display_name: "Unknown User",
            avatar_url: null,
          },
          lastMessage: lastMessage || null,
          unreadCount: unreadCount || 0,
        };
      }),
    );

    return { conversations: conversationsWithDetails, error: null };
  } catch (error) {
    return { conversations: [], error: "An error occurred" };
  }
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(
  conversationId: string,
): Promise<{ messages: Message[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      return { messages: [], error: "Failed to fetch messages" };
    }

    return { messages: data || [], error: null };
  } catch (error) {
    return { messages: [], error: "An error occurred" };
  }
}

/**
 * Send a message
 */
export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<{ success: boolean; error: string | null }> {
  try {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      return { success: false, error: "Not authenticated" };
    }

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: content.trim(),
    });

    if (error) {
      return { success: false, error: "Failed to send message" };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: "An error occurred" };
  }
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  conversationId: string,
): Promise<void> {
  try {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) return;

    await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", currentUserId)
      .eq("read", false);
  } catch (error) {
    console.error("Failed to mark messages as read:", error);
  }
}

/**
 * Get user's connections (people they can message)
 */
export async function getUserConnections(): Promise<{
  connections: any[];
  error: string | null;
}> {
  try {
    const currentUserId = getCurrentUserId();
    if (!currentUserId) {
      return { connections: [], error: "Not authenticated" };
    }

    // Get users that the current user is following
    const { data: following, error: followingError } = await supabase
      .from("connections")
      .select("following_id")
      .eq("follower_id", currentUserId);

    if (followingError) {
      return { connections: [], error: "Failed to fetch connections" };
    }

    // Get users that follow the current user
    const { data: followers, error: followersError } = await supabase
      .from("connections")
      .select("follower_id")
      .eq("following_id", currentUserId);

    if (followersError) {
      return { connections: [], error: "Failed to fetch connections" };
    }

    // Find mutual connections (users who follow each other)
    const followingIds = new Set(following?.map((f) => f.following_id) || []);
    const followerIds = new Set(followers?.map((f) => f.follower_id) || []);
    const mutualIds = [...followingIds].filter((id) => followerIds.has(id));

    if (mutualIds.length === 0) {
      return { connections: [], error: null };
    }

    // Get user details for mutual connections
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, username, display_name, avatar_url")
      .in("id", mutualIds);

    if (usersError) {
      return { connections: [], error: "Failed to fetch user details" };
    }

    return { connections: users || [], error: null };
  } catch (error) {
    return { connections: [], error: "An error occurred" };
  }
}

/**
 * Subscribe to new messages in a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (message: Message) => void,
) {
  const subscription = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(payload.new as Message);
      },
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}
