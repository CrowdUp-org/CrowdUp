# CrowdUp API & Backend

Overview
- Client-first access via supabase-js in client components
- Server used minimally (e.g., Google OAuth callback)

Data Access
- Supabase client configured in src/lib/supabase.ts
- Tables typed in src/lib/database.types.ts
- Auth helpers in src/lib/auth.ts

Server Routes
- /api/auth/callback/google uses SUPABASE_SECRET_KEY

Tables (public schema)
- users: profiles; password_hash optional for OAuth
- posts: Bug Report, Feature Request, Complaint, App Review Request
- votes: up/down votes
- connections: follower/following pairs
- apps: app pages with ratings
- app_reviews: per-user reviews (1-5)
- conversations: chat metadata
- messages: chat messages
- oauth_accounts: linked OAuth identities

Client Utilities
- Auth: signUp, signIn, signOut, getCurrentUser, getCurrentUserId
- Messaging: getUserConversations, getConversationMessages, sendMessage, markMessagesAsRead, getUserConnections, getOrCreateConversation, subscribeToMessages
- Algorithm: rankPosts, getTrendingPosts, calculateCompanyTrending

Realtime
- Uses supabase channel postgres_changes for live messages

Environment Variables
- NEXT_PUBLIC_SUPABASE_URL (public)
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (public)
- SUPABASE_SECRET_KEY (server-only)
- NEXT_PUBLIC_GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (optional)

Security
- Custom auth; RLS disabled by default
- bcryptjs password hashing
- Sessions stored in localStorage (dev bootstrap)
- For production: enable RLS, server sessions, or Supabase Auth

Result Shapes
- Prefer { success, data?, error? } for operations

References
- supabase-schema.sql
- migration-google-oauth.sql
- migration-follows.sql, migration-companies-apps.sql
- src/lib/database.types.ts