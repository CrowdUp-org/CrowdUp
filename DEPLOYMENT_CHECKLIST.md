# Hugging Face Spaces Deployment Checklist

Use this checklist when deploying CrowdUp to Hugging Face Spaces.

## Pre-Deployment

- [ ] Have a Hugging Face account ([sign up](https://huggingface.co/join))
- [ ] Have a Supabase account ([sign up](https://supabase.com))
- [ ] Created Supabase project
- [ ] Initialized Supabase database with schema
  - Get schema from: [supabase-schema.sql](https://raw.githubusercontent.com/CrowdUp-org/CrowdUp/main/supabase-schema.sql)
  - Run in Supabase SQL Editor
- [ ] Copied Supabase credentials:
  - [ ] Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
  - [ ] Anon/Public key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)
  - [ ] (Optional) Service role key (`SUPABASE_SECRET_KEY`)

## Space Creation

- [ ] Created new Space on Hugging Face
- [ ] Selected **Docker** as SDK
- [ ] Named the Space
- [ ] Set visibility (Public/Private)

## File Upload

Choose one method:

### Method 1: Git (Recommended)
- [ ] Cloned Space repository
- [ ] Added CrowdUp remote
- [ ] Pulled CrowdUp code
- [ ] **IMPORTANT:** Renamed `README_SPACES.md` to `README.md`
- [ ] Committed changes
- [ ] Pushed to Space

### Method 2: Web Upload
- [ ] Uploaded all files via web interface
- [ ] **IMPORTANT:** Renamed `README_SPACES.md` to `README.md` during upload
- [ ] Verified all files present:
  - [ ] `Dockerfile`
  - [ ] `.dockerignore`
  - [ ] `README.md` (was README_SPACES.md)
  - [ ] `package.json` & `package-lock.json`
  - [ ] `next.config.ts`
  - [ ] `src/` directory
  - [ ] `public/` directory

## Environment Variables

In Space Settings → Variables and secrets:

### Required
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxx.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = `eyJhbG...`

### Optional (for OAuth)
- [ ] `SUPABASE_SECRET_KEY` = `eyJhbG...`
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = `xxxxx.apps.googleusercontent.com`
- [ ] `GOOGLE_CLIENT_SECRET` = `GOCSPX-xxxxx`

All secrets marked as "Secret" (not visible)?
- [ ] Yes

## OAuth Configuration (if using Google Sign-In)

### Google Cloud Console
- [ ] Added redirect URI: `https://YOUR_USERNAME-crowdup.hf.space/api/auth/callback/google`
- [ ] Saved changes

### Supabase Dashboard
- [ ] Added Space URL to authorized redirect URLs
- [ ] Enabled Email provider (if using email/password auth)

## Build & Deploy

- [ ] Waited for Space to build (5-15 minutes)
- [ ] Checked build logs for errors
- [ ] Build completed successfully

## Testing

Visit your Space and test:

- [ ] Homepage loads
- [ ] Can view posts
- [ ] Can sign up with username/email
- [ ] Can sign in
- [ ] Can create a post
- [ ] Can vote on posts
- [ ] Can comment on posts
- [ ] Profile page works
- [ ] Settings page works
- [ ] (Optional) Google Sign-In works
- [ ] (Optional) Direct messaging works

## Post-Deployment

- [ ] Shared Space URL with team
- [ ] Updated documentation with Space URL
- [ ] Monitored for errors in first 24 hours
- [ ] Tested on mobile devices
- [ ] Considered upgrading hardware if slow (optional)

## Troubleshooting

If issues occur:

- [ ] Checked Space logs for errors
- [ ] Verified all environment variables are set
- [ ] Verified Supabase database is initialized
- [ ] Checked Supabase project is active (not paused)
- [ ] Reviewed [HUGGINGFACE_SPACES_DEPLOYMENT.md](./HUGGINGFACE_SPACES_DEPLOYMENT.md) troubleshooting section

## Success! 🎉

Your CrowdUp instance is live at:
`https://huggingface.co/spaces/YOUR_USERNAME/your-space-name`

Share it with the world! 🚀

---

**Need help?** See the full guide: [HUGGINGFACE_SPACES_DEPLOYMENT.md](./HUGGINGFACE_SPACES_DEPLOYMENT.md)
