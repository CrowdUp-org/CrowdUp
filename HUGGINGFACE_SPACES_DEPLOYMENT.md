# Deploying CrowdUp to Hugging Face Spaces

This guide explains how to deploy the CrowdUp application to Hugging Face Spaces using Docker.

**Important Note:** When deploying to Hugging Face Spaces, you must rename `README_SPACES.md` to `README.md`. This file contains the metadata that Hugging Face uses to configure your Space (SDK type, port, emoji, etc.).

## Overview

Hugging Face Spaces is a platform for hosting ML demos and applications. It supports Docker-based deployments, making it perfect for running Next.js applications like CrowdUp.

## Prerequisites

Before deploying to Hugging Face Spaces, you need:

1. **Hugging Face Account**
   - Sign up at [huggingface.co](https://huggingface.co/join)
   - Free tier is sufficient for most use cases

2. **Supabase Project**
   - Create a free project at [supabase.com](https://supabase.com)
   - Initialize the database with the schema from `supabase-schema.sql`
   - Get your API credentials (URL and keys)

3. **Google OAuth Credentials** (Optional)
   - Only needed if you want Google Sign-In
   - Create credentials at [Google Cloud Console](https://console.cloud.google.com)

## Step-by-Step Deployment

### 1. Create a New Space

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces)
2. Click **"Create new Space"**
3. Fill in the details:
   - **Owner**: Your username or organization
   - **Space name**: `crowdup` (or your preferred name)
   - **License**: `cc-by-nc-nd-4.0` (same as the project)
   - **SDK**: Select **Docker**
   - **Space hardware**: CPU basic (free tier) is sufficient
   - **Visibility**: Public or Private (your choice)
4. Click **"Create Space"**

### 2. Upload Files to Your Space

You have two options for uploading the code:

#### Option A: Git Push (Recommended)

```bash
# Clone your Space repository
git clone https://huggingface.co/spaces/YOUR_USERNAME/crowdup
cd crowdup

# Copy files from CrowdUp repository
cp -r /path/to/CrowdUp/* .

# Make sure you have these essential files:
# - Dockerfile
# - .dockerignore
# - README_SPACES.md (rename to README.md)
# - next.config.ts (with output: 'standalone')
# - All src/ files
# - package.json
# - Other config files

# Rename README for Spaces
mv README_SPACES.md README.md

# Commit and push
git add .
git commit -m "Initial deployment to Hugging Face Spaces"
git push
```

#### Option B: Web Interface Upload

1. In your Space, click **"Files"** tab
2. Click **"Add file"** → **"Upload files"**
3. Upload all necessary files:
   - `Dockerfile`
   - `.dockerignore`
   - `README_SPACES.md` (rename to `README.md`)
   - `package.json`, `package-lock.json`
   - `next.config.ts`, `tsconfig.json`
   - `postcss.config.mjs`, `tailwind.config.ts`
   - `components.json`
   - Entire `src/` directory
   - `public/` directory
4. Commit the upload

### 3. Configure Environment Variables

Environment variables in Spaces are called "Secrets". Configure them through the web interface:

1. Go to your Space's page
2. Click **"Settings"** (gear icon in top right)
3. Scroll to **"Repository secrets"** or **"Variables and secrets"**
4. Click **"New secret"** for each variable:

#### Required Secrets

| Secret Name | Value | Where to Get It |
|------------|-------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `eyJ...` | Supabase Dashboard → Settings → API → `anon public` key |

#### Optional Secrets (for OAuth)

| Secret Name | Value | Where to Get It |
|------------|-------|-----------------|
| `SUPABASE_SECRET_KEY` | `eyJ...` | Supabase Dashboard → Settings → API → `service_role` key |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Google Cloud Console → Credentials |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxx` | Google Cloud Console → Credentials |

**Important:** 
- Mark all secrets as "Secret" (private) in the interface
- Do not commit secrets to your repository
- The `NEXT_PUBLIC_*` variables are safe to expose in client-side code
- The `SUPABASE_SECRET_KEY` and `GOOGLE_CLIENT_SECRET` must remain private

### 4. Initialize Supabase Database

Before your app can work, you need to set up the database:

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Create a new query
5. Copy the contents of `supabase-schema.sql` from the CrowdUp repository
6. Run the query
7. Verify tables are created under **Table Editor**

Required tables:
- `users`
- `posts`
- `comments`
- `votes`
- `conversations`
- `messages`
- `companies`
- `apps`
- `connections`

### 5. Configure OAuth Callback URLs (If Using Google OAuth)

If you enabled Google OAuth, configure the callback URL:

1. **In Google Cloud Console:**
   - Go to Credentials → Your OAuth Client
   - Add authorized redirect URIs:
     - `https://YOUR_USERNAME-crowdup.hf.space/api/auth/callback/google`
   - Save changes

2. **In Supabase Dashboard:**
   - Go to Authentication → URL Configuration
   - Add your Space URL to authorized redirect URLs:
     - `https://YOUR_USERNAME-crowdup.hf.space/**`

### 6. Wait for Build and Deploy

1. After pushing your code and configuring secrets, Hugging Face will:
   - Build your Docker image (takes 5-15 minutes)
   - Start the container
   - Make it available at your Space URL

2. Monitor build progress:
   - Go to your Space page
   - Check the **"Logs"** tab for build output
   - Look for errors if the build fails

3. Common build errors and solutions:
   - **"Module not found"**: Check that all dependencies are in `package.json`
   - **"Build failed"**: Check TypeScript/ESLint errors (though they should be ignored)
   - **"Port not exposed"**: Ensure `EXPOSE 7860` is in Dockerfile

### 7. Test Your Deployment

Once the Space is running:

1. Visit your Space URL: `https://huggingface.co/spaces/YOUR_USERNAME/crowdup`
2. Click **"View App"** or the app embed
3. Test key features:
   - [ ] Homepage loads
   - [ ] Can view posts
   - [ ] Can sign up with username/email
   - [ ] Can sign in
   - [ ] Can create a post
   - [ ] Can vote on posts
   - [ ] Can comment
   - [ ] Profile page works
   - [ ] (Optional) Google Sign-In works

## Dockerfile Explanation

The `Dockerfile` uses multi-stage builds for optimization:

```dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
# Installs all npm dependencies

# Stage 2: Build the application
FROM node:20-alpine AS builder
# Builds Next.js with standalone output
# Compiles TypeScript, bundles assets

# Stage 3: Production runtime
FROM node:20-alpine AS runner
# Minimal image with only built files
# Runs on port 7860 (Hugging Face standard)
# Uses non-root user for security
```

Key features:
- **Multi-stage build**: Reduces final image size
- **Alpine Linux**: Lightweight base image
- **Standalone output**: Next.js self-contained mode
- **Port 7860**: Hugging Face Spaces default
- **Non-root user**: Security best practice

## Space Configuration (README.md Front Matter)

The `README_SPACES.md` includes front matter that Hugging Face uses to configure your Space:

```yaml
---
title: CrowdUp
emoji: 🗣️
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: cc-by-nc-nd-4.0
app_port: 7860
---
```

- **sdk: docker**: Tells Spaces to use Docker
- **app_port: 7860**: The port your app listens on
- **emoji**: Displayed on your Space card
- **colorFrom/colorTo**: Gradient for Space card

## Troubleshooting

### Build Failures

**Problem**: Docker build fails
**Solutions**:
- Check Dockerfile syntax
- Ensure `output: 'standalone'` is in `next.config.ts`
- Verify all dependencies are in `package.json`
- Check Spaces logs for specific error messages

### Runtime Errors

**Problem**: App builds but crashes on startup
**Solutions**:
- Check that all required environment variables are set
- Verify Supabase credentials are correct
- Check Supabase database is initialized
- Review Space logs for error messages

### Database Connection Issues

**Problem**: Cannot connect to Supabase
**Solutions**:
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is valid
- Ensure Supabase project is active (not paused)
- Check Supabase project isn't over quota

### OAuth Failures

**Problem**: Google Sign-In doesn't work
**Solutions**:
- Verify OAuth credentials are set correctly
- Check callback URL is configured in Google Console
- Ensure Supabase Auth is enabled
- Check Supabase URL configuration includes your Space URL

### App is Slow

**Problem**: Space runs but is very slow
**Solutions**:
- Upgrade to a better Space hardware tier (costs credits)
- Optimize database queries in your code
- Check Supabase usage and upgrade if needed
- Consider using Vercel for better Next.js performance

## Updating Your Space

To deploy updates:

```bash
# Make changes to your code locally
# Test locally first: npm run dev

# Build Docker image locally to test
docker build -t crowdup-test .
docker run -p 7860:7860 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... \
  crowdup-test

# If working, push to Space
cd /path/to/your/space/repo
git add .
git commit -m "Update: describe your changes"
git push

# Space will rebuild automatically
```

## Performance Optimization

For better performance on Spaces:

1. **Enable Image Optimization**:
   - Already configured with `remotePatterns` in `next.config.ts`

2. **Use Static Generation Where Possible**:
   - Convert pages to static when they don't need real-time data

3. **Optimize Bundle Size**:
   - Remove unused dependencies
   - Use dynamic imports for large components

4. **Database Optimization**:
   - Add indexes to frequently queried columns
   - Use Supabase's caching features

## Alternative Deployment Options

If Hugging Face Spaces doesn't meet your needs, consider:

- **Vercel**: Optimized for Next.js, easier setup, better performance
- **Railway**: Simple Docker deployments with databases
- **Render**: Free tier with Docker support
- **Fly.io**: Global edge deployment
- **DigitalOcean App Platform**: Managed Docker hosting

## Cost Considerations

**Hugging Face Spaces:**
- Free tier: CPU basic (often sufficient)
- Paid tiers: GPU, better CPU (~$0.60-$1/hour)
- No bandwidth charges

**Supabase:**
- Free tier: 500MB database, 1GB storage, 2GB bandwidth
- Pro tier: $25/month for more resources

**Total:** Can run completely free on both platforms' free tiers!

## Security Notes

1. **Never commit secrets** to your repository
2. Use **environment variables** for all sensitive data
3. Keep **Supabase Secret Key** private (don't expose in client code)
4. Regularly **rotate API keys** if compromised
5. Enable **RLS (Row Level Security)** in Supabase for production
6. Use **HTTPS only** (automatic on Spaces)

## Support

For help with:
- **CrowdUp issues**: [GitHub Issues](https://github.com/CrowdUp-org/CrowdUp/issues)
- **Hugging Face Spaces**: [Spaces documentation](https://huggingface.co/docs/hub/spaces)
- **Supabase**: [Supabase documentation](https://supabase.com/docs)

## Resources

- [Hugging Face Spaces Documentation](https://huggingface.co/docs/hub/spaces)
- [Docker Documentation](https://docs.docker.com/)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase Quick Start](https://supabase.com/docs/guides/getting-started)
- [CrowdUp Repository](https://github.com/CrowdUp-org/CrowdUp)

---

Happy deploying! 🚀
