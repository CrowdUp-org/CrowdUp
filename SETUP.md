# CrowdUp Setup & Installation Guide

A comprehensive guide to setting up and deploying CrowdUp locally and in production environments.

## Table of Contents

- [Quick Start (5 minutes)](#quick-start-5-minutes)
- [Detailed Setup Instructions](#detailed-setup-instructions)
- [Environment Variables](#environment-variables)
- [Features Overview](#features-overview)
- [First Steps](#first-steps)
- [Troubleshooting](#troubleshooting)
- [Important Notes](#important-notes)

---

## Quick Start (5 minutes)

For the impatient developer, get CrowdUp running in 5 minutes:

### Step 1: Supabase Setup (2 minutes)

1. Go to [https://supabase.com](https://supabase.com/) → Create new project
2. Copy your project URL and **Publishable key** from Settings > API > Publishable keys (new format: `sb_publishable_...`)
3. Go to SQL Editor → New Query
4. Copy/paste ALL content from `supabase-schema.sql` → Run

### Step 2: Environment Setup (30 seconds)

Create `.env.local` file in project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx...
```

### Step 3: Install & Run (1 minute)

```bash
npm install
npm run dev
```

### Step 4: Test (1 minute)

1. Open [http://localhost:3000](http://localhost:3000/)
2. Click "Sign up"
3. Create account
4. Create a post
5. Vote on it!

✅ **Done!** Your CrowdUp platform is now live.

---

## Detailed Setup Instructions

### Prerequisites

- Node.js 18+ or Bun
- A Supabase account (free tier works)
- Git (for version control)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com/) and create a new project
2. Wait for the project to be provisioned

### Step 2: Set Up Database

1. In your Supabase project dashboard, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql` from this project
3. Paste and run the SQL in the Supabase SQL Editor
4. This will create all necessary tables, indexes, and security policies
5. (Optional) If you want Google Sign-In, also run `migration-google-oauth.sql` to add OAuth support

### Step 3: Configure Environment Variables

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

### Step 4: Install Dependencies

```bash
npm install
# or
bun install
```

### Step 5: Run Development Server

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000/) in your browser.

---

## Environment Variables

### Public Variables (Safe to expose)

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Supabase publishable key (modern format)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID

### Secret Variables (Keep private!)

- `SUPABASE_SECRET_KEY` - Supabase secret key for server-side operations
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret

---

## First Steps

After setup is complete:

1. Navigate to `/auth/signup` to create an account
2. Sign in with your credentials
3. Create your first post (Bug Report, Feature Request, or Complaint)
4. Start voting and engaging with content!

---

## Features Overview

✅ **Core Features:**
- Custom authentication (username/email + password)
- Google Sign-In (OAuth 2.0)
- Create posts (Bug Reports, Feature Requests, Complaints)
- Upvote/downvote system with real-time updates
- User profiles with post history
- Settings page for profile management
- Real-time data from Supabase
- Comment system
- Search and discovery
- Category browsing
- Post sharing

For a complete feature list, see [FEATURES.md](./FEATURES.md).

---

## Troubleshooting

### "Invalid credentials" error

**Problem:** Authentication fails during signup/signin

**Solution:**
- Make sure you've run the SQL schema in Supabase
- Check that your environment variables are correct
- Verify the Supabase project is active and accessible

### Posts not showing

**Problem:** No posts appear on the home page

**Solution:**
- Verify the database tables were created successfully
- Check browser console (F12) for any errors
- Ensure you have created at least one post

### Authentication issues

**Problem:** Can't sign in or stay logged in

**Solution:**
- Clear localStorage and try again: `localStorage.clear()`
- Check browser console for error messages
- Verify environment variables are set correctly
- Note: RLS (Row Level Security) is disabled by default since we're using custom auth

### Google OAuth not working

**Problem:** "Redirect URI mismatch" error

**Solution:**
- Verify the authorized redirect URIs in Google Cloud Console match your deployment URL
- For local development, use `http://localhost:3000/api/auth/callback/google`
- For production, use your actual domain: `https://yourdomain.com/api/auth/callback/google`

### Supabase connection timeout

**Problem:** "Connection refused" or "Timeout" errors

**Solution:**
- Check your internet connection
- Verify Supabase project is running
- Confirm `NEXT_PUBLIC_SUPABASE_URL` is correct
- Try restarting the development server

---

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

---

## Next Steps

After you have CrowdUp running:

1. Explore the Features: Check out [FEATURES.md](./FEATURES.md) for a complete list of capabilities
2. Deployment: When ready to go live, see [DEPLOYMENT.md](./DEPLOYMENT.md)
3. API Documentation: For backend details, see [API.md](./API.md)
4. Issues? Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** + shadcn/ui for styling
- **Supabase** for database and storage
- **bcryptjs** for password hashing

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
