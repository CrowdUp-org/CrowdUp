# Quick Start: Deploy to Hugging Face Spaces

This repository is ready to deploy to Hugging Face Spaces! Follow these simple steps:

**📝 Important:** You must rename `README_SPACES.md` to `README.md` when deploying to Spaces. This file contains the metadata (sdk, port, emoji) that configures your Space.

## 1. Create a Space

1. Go to [Hugging Face Spaces](https://huggingface.co/new-space)
2. Choose **Docker** as the SDK
3. Name your Space (e.g., "crowdup")
4. Create the Space

## 2. Upload Files

Choose one of these methods:

### Option A: Git Clone & Push (Recommended)

```bash
# Clone your new Space
git clone https://huggingface.co/spaces/YOUR_USERNAME/your-space-name
cd your-space-name

# Add this repository as a remote
git remote add crowdup https://github.com/CrowdUp-org/CrowdUp.git
git pull crowdup main --allow-unrelated-histories

# IMPORTANT: Rename README_SPACES.md to README.md
mv README_SPACES.md README.md

# Push to your Space
git push origin main
```

### Option B: Direct Upload

1. Download this repository as ZIP
2. Extract files
3. In your Space, click "Files" → "Upload files"
4. Upload all files (Dockerfile, src/, package.json, etc.)

### Option C: Fork & Link

1. Fork this repository on GitHub
2. In your Space settings, connect to your forked GitHub repo
3. Enable auto-sync

## 3. Set Environment Variables

In your Space settings, add these **Secrets**:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key

**Optional (for OAuth):**
- `SUPABASE_SECRET_KEY` - Supabase service role key
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret

Get these from:
- **Supabase:** [app.supabase.com](https://app.supabase.com) → Project Settings → API
- **Google OAuth:** [console.cloud.google.com](https://console.cloud.google.com) → Credentials

## 4. Initialize Database

1. Go to your Supabase project
2. Open SQL Editor
3. Run the schema from `supabase-schema.sql` in this repo
4. Wait for tables to be created

## 5. Launch Your Space

Your Space will automatically build and deploy! This takes 5-15 minutes.

Visit your Space URL: `https://huggingface.co/spaces/YOUR_USERNAME/your-space-name`

## Need Help?

- Read the full guide: [HUGGINGFACE_SPACES_DEPLOYMENT.md](./HUGGINGFACE_SPACES_DEPLOYMENT.md)
- Check the docs: [Hugging Face Spaces Documentation](https://huggingface.co/docs/hub/spaces)
- Open an issue: [GitHub Issues](https://github.com/CrowdUp-org/CrowdUp/issues)

## Files for Spaces Deployment

This repo includes:
- ✅ `Dockerfile` - Multi-stage Docker build
- ✅ `.dockerignore` - Exclude unnecessary files
- ✅ `README_SPACES.md` - Space documentation with metadata
- ✅ `next.config.ts` - Configured with `output: 'standalone'`
- ✅ All source code and dependencies

Everything is ready to go! 🚀
