# Google OAuth Setup Guide

This guide will walk you through setting up Google Sign-In for CrowdUp.

## Overview

CrowdUp now supports Google OAuth 2.0 authentication, allowing users to sign in with their Google account. This feature is optional and works alongside the traditional username/password authentication.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com)
- CrowdUp project already set up with Supabase

## Step-by-Step Setup

### 1. Update Database Schema

Run the OAuth migration to add support for OAuth accounts:

```bash
# In your Supabase SQL Editor, run:
cat migration-google-oauth.sql
```

Or manually run these SQL commands in Supabase SQL Editor:

```sql
-- Make password_hash optional for OAuth users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Create oauth_accounts table
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_provider ON oauth_accounts(provider);
CREATE INDEX IF NOT EXISTS idx_oauth_accounts_email ON oauth_accounts(email);
```

### 2. Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit https://console.cloud.google.com
   - Create a new project or select an existing one

2. **Enable Google+ API** (if not already enabled)
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Name it (e.g., "CrowdUp Web")

4. **Configure Authorized Redirect URIs**
   
   Add the following URIs:
   
   **For Development:**
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   
   **For Production:**
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
   
   Replace `yourdomain.com` with your actual domain.

5. **Save and Copy Credentials**
   - Click "Create"
   - Copy the **Client ID**
   - Copy the **Client Secret**
   - Store these securely - you'll need them in the next step

### 3. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

**Important Notes:**
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is public and used in the browser
- `GOOGLE_CLIENT_SECRET` is private and only used server-side
- Never commit `.env.local` to version control

### 4. Restart Development Server

After adding the environment variables:

```bash
npm run dev
# or
bun dev
```

## Usage

### For Users

Once configured, users will see a "Sign in with Google" button on:
- `/auth/signin` - Sign In page
- `/auth/signup` - Sign Up page

**Sign In Flow:**
1. Click "Sign in with Google"
2. Choose or sign in to Google account
3. Grant permissions to CrowdUp
4. Automatically redirected back and signed in

### For Developers

**Account Linking:**
- If a user signs in with Google and the email already exists in the database, the Google account is linked to the existing user
- If the email is new, a new user account is created automatically

**Username Generation:**
- For new Google sign-ins, username is derived from the email address
- If username conflicts exist, a number is appended (e.g., `john1`, `john2`)

**OAuth Data Storage:**
- User data stored in `users` table
- OAuth connection stored in `oauth_accounts` table
- Avatar from Google is automatically set as user's avatar

## Troubleshooting

### "Google OAuth is not configured" Error
- Ensure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`
- Restart your development server after adding environment variables

### Redirect URI Mismatch Error
- Check that your redirect URI in Google Cloud Console matches exactly:
  - `http://localhost:3000/api/auth/callback/google` for development
  - `https://yourdomain.com/api/auth/callback/google` for production
- No trailing slashes
- Protocol (http/https) must match

### "Failed to get user info from Google" Error
- Ensure Google+ API is enabled in your Google Cloud project
- Check that your OAuth consent screen is properly configured

### OAuth Works in Development but Not Production
- Make sure to add your production domain to authorized redirect URIs
- Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in production environment variables
- Check that your domain uses HTTPS (required for OAuth in production)

## Security Considerations

1. **Keep Secrets Safe**
   - Never commit `.env.local` to version control
   - Use environment variables in production (Vercel, Netlify, etc.)

2. **Redirect URI Validation**
   - Only add trusted domains to authorized redirect URIs
   - Google validates the redirect URI server-side

3. **Session Management**
   - OAuth users follow the same session management as regular users
   - Sessions stored in localStorage (consider server-side sessions for production)

4. **Scopes**
   - Current implementation requests: `openid`, `email`, `profile`
   - These are minimal scopes for basic authentication

## Production Deployment

When deploying to production:

1. **Update Google OAuth Credentials**
   - Add production redirect URI: `https://yourdomain.com/api/auth/callback/google`
   
2. **Set Environment Variables**
   - Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in your hosting platform
   - Set `GOOGLE_CLIENT_SECRET` in your hosting platform
   - Most platforms (Vercel, Netlify) have environment variable settings in dashboard

3. **Verify HTTPS**
   - OAuth requires HTTPS in production
   - Most modern hosting platforms provide this automatically

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com)
- [OAuth 2.0 Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
