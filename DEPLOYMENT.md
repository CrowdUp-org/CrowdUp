# CrowdUp Deployment Guide

Comprehensive guide to deploying CrowdUp to production environments.

## Table of Contents

- [Overview](#overview)
- [Environment Setup](#environment-setup)
- [Vercel Deployment](#vercel-deployment)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Security Checklist](#security-checklist)
- [Secret Key Rotation](#secret-key-rotation)
- [Troubleshooting](#troubleshooting)

---

## Overview

CrowdUp requires three Supabase environment variables for complete functionality:

| Variable | Visibility | Usage | Required |
|----------|-----------|-------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Client-side queries | Yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | Client-side auth | Yes |
| `SUPABASE_SECRET_KEY` | Secret | Server-side operations | Yes (OAuth) |

**Important:** Only `SUPABASE_SECRET_KEY` is sensitive. Other keys are safe to expose in client code.

---

## Environment Setup

### Local Development

1. Create `.env.local` in project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
   SUPABASE_SECRET_KEY=sb_secret_xxx
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

---

## Vercel Deployment

**Recommended for Next.js applications.**

### Step 1: Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select `main` branch

### Step 2: Configure Environment Variables
1. Go to "Settings" → "Environment Variables"
2. Add for each environment (Development, Preview, Production):

**Public Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = Your publishable key
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = Your Google OAuth client ID

**Secret Variables:**
- `SUPABASE_SECRET_KEY` = Your Supabase secret key
- `GOOGLE_CLIENT_SECRET` = Your Google OAuth secret

### Step 3: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Visit deployment URL

---

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}
      - SUPABASE_SECRET_KEY=${SUPABASE_SECRET_KEY}
      - NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
```

Run with:
```bash
docker-compose up
```

---

## Environment Variables

### Required Variables

**Client-Side (Public):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Publishable API key

**Server-Side (Secret):**
- `SUPABASE_SECRET_KEY` - Secret API key for privileged operations

### Optional Variables

**Google OAuth:**
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret

---

## Security Checklist

Before deploying to production:

- [ ] `SUPABASE_SECRET_KEY` is set only in deployment platform, never in code
- [ ] All three Supabase variables are configured
- [ ] Google OAuth variables are set (if using OAuth)
- [ ] Environment variables are different for dev/staging/production
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Database backups are enabled
- [ ] Monitoring/alerts are configured
- [ ] Security headers are set
- [ ] Rate limiting is enabled

---

## Secret Key Rotation

### Why Rotate Keys?

Regularly rotating secret keys improves security by:
- Reducing impact of potential key exposure
- Limiting timeframe of compromised access
- Following security best practices

### How to Rotate

1. **Generate New Key in Supabase**
   - Go to Project Settings > API > Secret keys
   - Click "New" to generate new secret key

2. **Update Deployment Platforms**
   - Vercel: Update environment variable
   - Docker: Update secret in orchestration platform
   - Other: Update in your deployment system

3. **Deploy New Version**
   - Trigger redeploy with new key
   - Verify deployment works

4. **Monitor Logs**
   - Check for authentication errors
   - Confirm requests are using new key

5. **Delete Old Key**
   - Wait 24 hours for all requests to use new key
   - Delete old key from Supabase

---

## Troubleshooting

### "Supabase authentication error" in production

**Cause:** Incorrect environment variables

**Solution:**
1. Verify `SUPABASE_SECRET_KEY` is set correctly
2. Confirm all three variables are configured
3. Redeploy after updating variables
4. Check server logs for detailed errors

### OAuth callback fails

**Cause:** Redirect URI mismatch

**Solution:**
1. Go to Google Cloud Console
2. Update authorized redirect URIs:
   - Dev: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
3. Redeploy application

### Connection timeout

**Cause:** Supabase project not responding

**Solution:**
1. Verify Supabase project is active
2. Check internet connection
3. Confirm `NEXT_PUBLIC_SUPABASE_URL` is correct
4. Check Supabase status page

---

## Performance Optimization

- Enable caching headers for static assets
- Use CDN for static files
- Configure database connection pooling
- Monitor build size and optimize bundles
- Set up logging and error tracking

---

## Monitoring & Maintenance

- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor application performance
- Set up uptime monitoring
- Regular security audits
- Keep dependencies updated

---

## References

- [Supabase Deployment](https://supabase.com/docs/guides/hosting/overview)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Docker Documentation](https://docs.docker.com/)
- [SETUP.md](./SETUP.md) - Local setup instructions
