"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send, MessageCircle, UserPlus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToMessages,
  getUserConnections,
  getOrCreateConversation,
  type ConversationWithUser,
  type Message,
} from "@/lib/messaging";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function MessagesPage() {
  const router = useRouter();
  const currentUser = getCurrentUser();
  const [conversations, setConversations] = useState<ConversationWithUser[]>(
    [],
  );
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) {
      router.push("/auth/signin");
      return;
    }
    loadConversations();
    loadConnections();
  }, [currentUser, router]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      markMessagesAsRead(selectedConversation);

      // Subscribe to new messages
      const unsubscribe = subscribeToMessages(
        selectedConversation,
        (newMessage) => {
          setMessages((prev) => [...prev, newMessage]);
          if (newMessage.sender_id !== currentUser?.id) {
            markMessagesAsRead(selectedConversation);
          }
        },
      );

      return () => unsubscribe();
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    setLoading(true);
    const { conversations: convs, error } = await getUserConversations();
    if (!error && convs) {
      setConversations(convs);
    }
    setLoading(false);
  };

  const loadMessages = async (conversationId: string) => {
    const { messages: msgs, error } =
      await getConversationMessages(conversationId);
    if (!error && msgs) {
      setMessages(msgs);
    }
  };

  const loadConnections = async () => {
    const { connections: conns, error } = await getUserConnections();
    if (!error && conns) {
      setConnections(conns);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    setSending(true);
    const { success } = await sendMessage(selectedConversation, messageText);
    if (success) {
      setMessageText("");
      // Message will be added via subscription
    }
    setSending(false);
  };

  const handleStartNewChat = async (userId: string) => {
    const { conversationId, error } = await getOrCreateConversation(userId);
    if (!error && conversationId) {
      setNewChatDialogOpen(false);
      await loadConversations();
      setSelectedConversation(conversationId);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.otherUser.display_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedConvData = conversations.find(
    (c) => c.id === selectedConversation,
  );

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-7xl px-6 pt-24 pb-8">
        <div
          className="bg-white rounded-2xl border shadow-sm overflow-hidden"
          style={{ height: "calc(100vh - 140px)" }}
        >
          <div className="grid grid-cols-12 h-full">
            {/* Conversations List */}
            <div className="col-span-4 border-r flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Messages</h2>
                  <Dialog
                    open={newChatDialogOpen}
                    onOpenChange={setNewChatDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="gap-2 bg-gradient-to-br from-yellow-400 to-orange-500"
                      >
                        <UserPlus className="h-4 w-4" />
                        New
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Start New Conversation</DialogTitle>
                        <DialogDescription>
                          Select a connection to start chatting
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {connections.length === 0 ? (
                          <div className="text-center text-gray-500 py-8">
                            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p className="font-medium mb-2">
                              No connections yet
                            </p>
                            <p className="text-sm mb-4">
                              Connect with users to start chatting
                            </p>
                            <Button
                              onClick={() => {
                                setNewChatDialogOpen(false);
                                router.push("/search?tab=users");
                              }}
                              className="bg-gradient-to-br from-yellow-400 to-orange-500"
                            >
                              Find Users
                            </Button>
                          </div>
                        ) : (
                          connections.map((conn) => (
                            <button
                              key={conn.id}
                              onClick={() => handleStartNewChat(conn.id)}
                              className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <Avatar className="h-10 w-10 bg-gradient-to-br from-yellow-400 to-orange-500">
                                {conn.avatar_url ? (
                                  <img
                                    src={conn.avatar_url}
                                    alt={conn.display_name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-semibold">
                                    {conn.display_name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="text-left">
                                <p className="font-semibold">
                                  {conn.display_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  @{conn.username}
                                </p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>Loading conversations...</p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No conversations yet</p>
                    <p className="text-sm mt-2">
                      Click "New" to start chatting
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b ${
                        selectedConversation === conv.id ? "bg-orange-50" : ""
                      }`}
                    >
                      <Avatar className="h-12 w-12 bg-gradient-to-br from-yellow-400 to-orange-500">
                        {conv.otherUser.avatar_url ? (
                          <img
                            src={conv.otherUser.avatar_url}
                            alt={conv.otherUser.display_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-semibold">
                            {conv.otherUser.display_name
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold">
                            {conv.otherUser.display_name}
                          </p>
                          {conv.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(
                                new Date(conv.lastMessage.created_at),
                                { addSuffix: true },
                              )}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm truncate ${
                            conv.unreadCount > 0
                              ? "font-medium text-gray-900"
                              : "text-gray-600"
                          }`}
                        >
                          {conv.lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="flex items-center justify-center h-5 w-5 rounded-full bg-orange-500 text-white text-xs font-bold mt-2">
                          {conv.unreadCount}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-8 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b flex items-center gap-3">
                    <Avatar className="h-10 w-10 bg-gradient-to-br from-yellow-400 to-orange-500">
                      {selectedConvData?.otherUser.avatar_url ? (
                        <img
                          src={selectedConvData.otherUser.avatar_url}
                          alt={selectedConvData.otherUser.display_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-semibold">
                          {selectedConvData?.otherUser.display_name
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {selectedConvData?.otherUser.display_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        @{selectedConvData?.otherUser.username}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-sm text-gray-500 py-12">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No messages yet</p>
                        <p className="text-xs mt-1">Start the conversation!</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-center text-sm text-gray-500 mb-4">
                          This is the beginning of your conversation
                        </div>
                        {messages.map((msg) => {
                          const isOwn = msg.sender_id === currentUser?.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                  isOwn
                                    ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-tr-none"
                                    : "bg-gray-100 text-gray-900 rounded-tl-none"
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {msg.content}
                                </p>
                                <span
                                  className={`text-xs mt-1 block ${
                                    isOwn ? "text-white/80" : "text-gray-500"
                                  }`}
                                >
                                  {formatDistanceToNow(
                                    new Date(msg.created_at),
                                    { addSuffix: true },
                                  )}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!messageText.trim() || sending}
                        className="bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-lg shadow-orange-500/30"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Select a conversation</p>
                    <p className="text-sm">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
