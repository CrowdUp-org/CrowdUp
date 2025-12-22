# Messaging Feature Setup Guide

## Overview
The messaging feature allows users to chat with their mutual connections (users who follow each other) in real-time using Supabase.

## Database Setup

### Step 1: Run the SQL Migration

Execute the SQL migration file to create the necessary tables:

```bash
# Connect to your Supabase project and run:
psql -h your-supabase-host -U postgres -d postgres -f supabase_migrations/messages.sql
```

Or copy the contents of `supabase_migrations/messages.sql` and run it in the Supabase SQL Editor.

### Step 2: Verify Tables Created

The migration creates two tables:
1. **conversations** - Stores conversation metadata between two users
2. **messages** - Stores individual messages

### Tables Structure:

#### `conversations`
- `id` (UUID, Primary Key)
- `participant1_id` (UUID, Foreign Key to users)
- `participant2_id` (UUID, Foreign Key to users)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

#### `messages`
- `id` (UUID, Primary Key)
- `conversation_id` (UUID, Foreign Key to conversations)
- `sender_id` (UUID, Foreign Key to users)
- `content` (Text)
- `read` (Boolean)
- `created_at` (Timestamp)

## Features

### 1. **Mutual Connections Only**
- Users can only message people they have mutual connections with
- Both users must follow each other to chat

### 2. **Real-time Messaging**
- Messages appear instantly using Supabase real-time subscriptions
- Auto-scrolls to latest message
- Shows typing indicator when sending

### 3. **Conversation Management**
- View all conversations sorted by most recent
- Search conversations by user name or username
- See unread message counts
- Last message preview

### 4. **Message Features**
- Send text messages
- Press Enter to send (Shift+Enter for new line)
- Message timestamps (relative time)
- Read/unread status
- Auto-mark messages as read when viewing

### 5. **New Chat Dialog**
- Start conversations with any mutual connection
- Shows list of available connections
- Creates conversation if it doesn't exist

## How to Use

### For Users:

1. **Follow Users**: Go to user profiles and follow them
2. **Wait for Follow Back**: They need to follow you back
3. **Start Chatting**: 
   - Go to Messages page
   - Click "New" button
   - Select a connection
   - Start messaging!

### For Developers:

#### Key Files:
- `/src/lib/messaging.ts` - Messaging utility functions
- `/src/app/messages/page.tsx` - Messages UI component
- `/src/lib/database.types.ts` - Updated with new table types
- `/supabase_migrations/messages.sql` - Database migration

#### API Functions:

```typescript
// Get user's conversations
getUserConversations()

// Get messages for a conversation
getConversationMessages(conversationId)

// Send a message
sendMessage(conversationId, content)

// Mark messages as read
markMessagesAsRead(conversationId)

// Get mutual connections
getUserConnections()

// Create or get conversation
getOrCreateConversation(otherUserId)

// Subscribe to real-time messages
subscribeToMessages(conversationId, callback)
```

## Security

### Row Level Security (RLS)
All tables have RLS enabled with policies that ensure:
- Users can only see their own conversations
- Users can only send messages in conversations they're part of
- Users can only read messages from their conversations
- Users can only update their own messages

### Policies Applied:
1. **Conversations**:
   - Users can view conversations they're part of
   - Users can create conversations with connections

2. **Messages**:
   - Users can view messages in their conversations
   - Users can send messages in their conversations
   - Users can update their own messages

## Performance Optimizations

1. **Indexes**: Created on frequently queried columns
2. **Triggers**: Auto-update conversation timestamp on new message
3. **Real-time**: Uses Supabase channels for instant updates
4. **Lazy Loading**: Messages loaded only when conversation is opened

## Troubleshooting

### No Connections Showing
- Make sure users have mutual follows (both follow each other)
- Check the `connections` table for entries

### Messages Not Sending
- Verify user is authenticated
- Check conversation exists
- Ensure RLS policies are applied correctly

### Real-time Not Working
- Verify Supabase real-time is enabled in project settings
- Check browser console for subscription errors
- Ensure proper channel naming

## Future Enhancements

Potential features to add:
- [ ] Image/file attachments
- [ ] Message reactions
- [ ] Message editing/deletion
- [ ] Typing indicators
- [ ] Online/offline status
- [ ] Message search
- [ ] Group chats
- [ ] Voice messages
- [ ] Video calls

## Support

For issues or questions:
1. Check Supabase logs for errors
2. Verify database tables and policies
3. Check browser console for client-side errors
4. Ensure environment variables are set correctly
