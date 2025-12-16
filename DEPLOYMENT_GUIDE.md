# CrowdUp Deployment Guide - Secret API Key Configuration

This guide explains how to configure the Supabase Secret API key (`SUPABASE_SECRET_KEY`) in various deployment environments.

## Overview

CrowdUp requires three Supabase environment variables for complete functionality:

| Variable | Visibility | Usage | Required |
|----------|-----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public (`NEXT_PUBLIC_`) | Client-side database queries | Yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public (`NEXT_PUBLIC_`) | Client-side authentication (replaces legacy `anon` key) | Yes |
| `SUPABASE_SECRET_KEY` | **Secret** (no prefix) | Server-side operations (OAuth, privileged actions) | Yes (for OAuth) |

**Important:** Only `SUPABASE_SECRET_KEY` should be treated as a sensitive secret. The other two public keys are safe to expose in client-side code and can be regenerated independently.

## Environment-Specific Configuration

### Local Development

#### Step 1: Get Your Secret API Key

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Project Settings** > **API**
4. Find the **Secret keys** section
5. Copy the key starting with `sb_secret_`

#### Step 2: Update `.env.local`

Create or update `.env.local` in the project root:

```bash
# Public keys (safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx...

# Secret key (keep private!)
SUPABASE_SECRET_KEY=sb_secret_your_secret_key_here...

# Optional: Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

#### Step 3: Start Development Server

```bash
npm run dev
```

The application will automatically load variables from `.env.local`.

---

## Vercel Deployment

Vercel is the recommended deployment platform for CrowdUp (Next.js optimized).

### Prerequisites

- Project deployed to Vercel
- Vercel CLI or Vercel dashboard access

### Configuration Method 1: Vercel Dashboard (Recommended)

#### Step 1: Go to Project Settings

1. Open [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your CrowdUp project
3. Go to **Settings** > **Environment Variables**

#### Step 2: Add Environment Variables

Add the following variables for each environment (Development, Preview, Production):

**For All Environments:**

| Key | Value | Type |
|-----|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Your Supabase publishable key (`sb_publishable_...`) | `NEXT_PUBLIC_` |
| `SUPABASE_SECRET_KEY` | Your Supabase secret key (`sb_secret_...`) | Standard (secret) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Your Google OAuth client ID | `NEXT_PUBLIC_` |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth secret | Standard (secret) |

**To add a variable:**

1. Click **Add New** (or **New Variable**)
2. Enter the variable name (e.g., `SUPABASE_SECRET_KEY`)
3. Enter the value (e.g., `sb_secret_...`)
4. Select environment(s) where this applies
5. Click **Add**

#### Step 3: Select Environment Targets

For each variable, choose which environments should have it:

- **Development** — Your local `vercel dev` environment
- **Preview** — Pre-production deployments (staging branches)
- **Production** — Live production deployment

**Recommended:**
- All three environments should have `SUPABASE_SECRET_KEY` to ensure consistency
- Use different Supabase projects for dev/staging/production if possible

#### Step 4: Redeploy

After adding environment variables, redeploy your project:

```bash
vercel --prod  # Deploy to production
```

Or trigger a redeploy from the Vercel dashboard.

### Configuration Method 2: Vercel CLI

If you prefer command-line setup:

```bash
# Install Vercel CLI
npm install -g vercel

# Link your project
vercel link

# Add environment variables (interactive)
vercel env add SUPABASE_SECRET_KEY
# Enter the secret key when prompted

# Redeploy
vercel --prod
```

### Configuration Method 3: `vercel.json` (Version Control)

You can also define environment variables in a `vercel.json` file (but **never commit secrets**):

```json
{
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY": "@supabase_publishable_key",
    "SUPABASE_SECRET_KEY": "@supabase_secret_key"
  }
}
```

Then reference secrets in the Vercel dashboard without storing them in Git.

### Vercel Secrets Best Practices

✅ **Do:**
- Store `SUPABASE_SECRET_KEY` only in Vercel environment variables, never in code
- Use different secret keys for Production and Preview environments
- Rotate keys regularly (see [SUPABASE_SECRET_KEY_ROTATION.md](./SUPABASE_SECRET_KEY_ROTATION.md))

❌ **Don't:**
- Commit `.env.local` with real secrets to Git
- Hardcode secret keys in `vercel.json`
- Share secret keys in pull requests or public channels

---

## Docker Deployment

If deploying with Docker, pass environment variables at runtime.

### Step 1: Create `.env.production`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx...
SUPABASE_SECRET_KEY=sb_secret_...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Step 2: Update Dockerfile

```dockerfile
# Use official Node.js image
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build Next.js application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application with environment variables
CMD ["npm", "start"]
```

### Step 3: Run with Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}
      SUPABASE_SECRET_KEY: ${SUPABASE_SECRET_KEY}
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: ${NEXT_PUBLIC_GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
```

Then run:

```bash
docker-compose up
```

---

## GitHub Actions CI/CD

For automated deployments via GitHub Actions:

### Step 1: Add Secrets to GitHub

1. Go to your repository
2. **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each secret:
   - Name: `SUPABASE_SECRET_KEY`
   - Value: `sb_secret_...`

### Step 2: Use Secrets in Workflow

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        run: vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.SUPABASE_PUBLISHABLE_KEY }}
          SUPABASE_SECRET_KEY: ${{ secrets.SUPABASE_SECRET_KEY }}
          SUPABASE_SECRET_KEY: ${{ secrets.SUPABASE_SECRET_KEY }}
```

---

## Google Cloud Run

For Google Cloud Run deployments:

### Step 1: Build Container

```bash
gcloud builds submit --tag gcr.io/your-project/crowdup
```

### Step 2: Deploy with Secret Manager

```bash
gcloud run deploy crowdup \
  --image gcr.io/your-project/crowdup \
  --set-env-vars "NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$SUPABASE_PUBLISHABLE_KEY" \
  --set-secrets "SUPABASE_SECRET_KEY=supabase-secret-key:latest"
```

---

## AWS/Heroku/Other Platforms

### AWS Elastic Beanstalk

Add environment variables in `.ebextensions/environment.config`:

```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    NEXT_PUBLIC_SUPABASE_URL: your_url
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: your_publishable_key
    SUPABASE_SECRET_KEY: your_secret_key
```

### Heroku

```bash
heroku config:set SUPABASE_SECRET_KEY=sb_secret_...
heroku config:set NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
heroku config:set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

---

## Troubleshooting

### "Supabase authentication error" in production

**Check:**
1. Environment variables are set correctly in deployment platform
2. `SUPABASE_SECRET_KEY` value is correct (no typos, starts with `sb_secret_`)
3. Redeployed after setting environment variables
4. Supabase project is active and accessible

**Fix:**
```bash
# For Vercel
vercel env list  # View all environment variables
vercel --prod    # Redeploy

# For Docker
docker-compose down
docker-compose up --build
```

### OAuth callback fails on first deploy

**Reason:** Deployment didn't load new environment variables
**Solution:** Force rebuild/redeploy

```bash
# Vercel
vercel redeploy --prod

# Docker
docker-compose up --build --force-recreate
```

---

## Security Checklist

Before deploying to production:

- [ ] `SUPABASE_SECRET_KEY` is set in your deployment platform
- [ ] `SUPABASE_SECRET_KEY` is NOT in `.env.local` or version control
- [ ] All three public Supabase variables are set
- [ ] Google OAuth variables are configured (if using OAuth)
- [ ] Test OAuth sign-in flow in production
- [ ] Monitor error logs after deployment
- [ ] Consider setting up log alerts for authentication failures

---

## References

- [Supabase API Keys](https://supabase.com/docs/guides/api/keys)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [CrowdUp SETUP.md](./SETUP.md)
- [CrowdUp Secret Key Rotation](./SUPABASE_SECRET_KEY_ROTATION.md)
