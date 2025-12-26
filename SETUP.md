# CrowdUp Setup Guide

## Quick Start (5 minutes)

1. Go to https://supabase.com → Create a new project
2. SQL Editor → New Query → Paste contents of `supabase-schema.sql` → Run
3. Create `.env.local` with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx...
   ```
4. Install & run:
   ```
   npm install
   npm run dev
   ```
5. Open http://localhost:3000 → Sign up → Create a post → Vote

---

## Prerequisites

- Node.js 18+ or Bun
- A Supabase account (free tier works)

## Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

### 2. Set Up Database

1. In your Supabase project dashboard, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql` from this project
3. Paste and run the SQL in the Supabase SQL Editor
4. This will create all necessary tables, indexes, and security policies
5. (Optional) If you want Google Sign-In, also run `migration-google-oauth.sql` to add OAuth support

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to Project Settings > API
   - Copy the Project URL
   - Copy the `Publishable key` (from the Publishable key section - new format, can be regenerated)
   - **NEW:** Copy the Secret API key (from Project Settings > API > Secret keys) - this is required for server-side operations

3. Update `.env.local` with required values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   SUPABASE_SECRET_KEY=your_secret_key
   ```

4. (Optional) Set up Google OAuth for "Sign in with Google":
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new OAuth 2.0 Client ID (or use existing)
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - For production, also add: `https://yourdomain.com/api/auth/callback/google`
   - Copy the Client ID and Client Secret
   - Add to `.env.local`:
     ```
     NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
     GOOGLE_CLIENT_SECRET=your_client_secret
     ```

 Tip: See Google OAuth details in [docs/archive/GOOGLE_OAUTH_SETUP.md](docs/archive/GOOGLE_OAUTH_SETUP.md).

### 4. Install Dependencies

```bash
npm install
# or
bun install
```

### 5. Run Development Server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Steps

1. Navigate to `/auth/signup` to create an account
2. Sign in with your credentials
3. Create your first post
4. Start voting and engaging with content!

## Features

- ✅ Custom authentication (username/email + password)
- ✅ Google Sign-In (OAuth 2.0)
- ✅ Create posts (Bug Reports, Feature Requests, Complaints)
- ✅ Upvote/downvote system
- ✅ User profiles
- ✅ Settings page
- ✅ Real-time data from Supabase

## Troubleshooting

### "Invalid credentials" error
- Make sure you've run the SQL schema in Supabase
- Check that your environment variables are correct

### Posts not showing
- Verify the database tables were created successfully
- Check browser console for any errors

### Authentication issues
- Clear localStorage and try again
- Note: RLS (Row Level Security) is disabled by default since we're using custom auth

## Important Notes

### Supabase API Keys (Migration from Legacy JWT Keys)
CrowdUp uses **Supabase Secret API keys** (`sb_secret_...`) and **Publishable keys** (`sb_publishable_...`) which are the modern, recommended way to authenticate:
- **`SUPABASE_PUBLISHABLE_KEY`** (public, `NEXT_PUBLIC_` prefix): Replaces the legacy `anon` JWT key. Used by client-side code for general database queries. This is safe to expose in client-side code and can be individually regenerated.
- **`SUPABASE_SECRET_KEY`** (secret, no `NEXT_PUBLIC_` prefix): Replaces the legacy `service_role` JWT key. Used only by server-side API routes (e.g., Google OAuth callback) for privileged operations. **Keep this key secure and never expose it in client-side code or version control.**

**Why migrate from legacy JWT keys (`anon`/`service_role`)?**
- Legacy JWT keys cannot be individually rotated without affecting the global JWT secret
- Individual Secret API keys can be rotated independently and regenerated easily
- Publishable keys can be regenerated without downtime (unlike legacy `anon` keys)
- Better security boundaries between client and server operations
- Clearer access control model for backend tasks

See [SUPABASE_SECRET_KEY_ROTATION.md](./SUPABASE_SECRET_KEY_ROTATION.md) for instructions on rotating Secret API keys.
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for environment setup on various platforms.

### Row Level Security (RLS)
This project uses **custom authentication** (not Supabase Auth), so Row Level Security is **disabled by default** in the SQL schema. This means:
- All authenticated operations are handled client-side
- Database tables are accessible with the anon key
- For production, consider migrating to Supabase Auth or implementing server-side API routes

### Security Considerations
- Passwords are hashed with bcryptjs before storage
- Auth state is stored in localStorage (client-side)
- Server-side operations use the Secret API key for elevated privileges
- For production apps, consider:
  - Server-side session management
  - HTTP-only cookies
  - Supabase Auth integration
  - Regular Secret API key rotation
