# Deployment Guide

This Next.js application requires a Node.js runtime and cannot be deployed as a static site to GitHub Pages due to:
- API routes (`/api/auth/google`, `/api/auth/callback/google`)
- Dynamic routes with server-side rendering
- Middleware for request handling
- Server-side features

## Recommended Deployment: Vercel

[Vercel](https://vercel.com) is the recommended deployment platform for Next.js applications.

### Deploy to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Website**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js configuration

3. **Configure Environment Variables**:
   In Vercel project settings, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id (optional)
   GOOGLE_CLIENT_SECRET=your_google_client_secret (optional)
   ```

4. **Deploy**:
   - Push to your main branch, and Vercel will automatically deploy
   - Or run `vercel` from the command line

### Deploy via CLI

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow the prompts to configure your project
```

## Alternative Deployment Options

### 1. Netlify

Netlify supports Next.js applications with their Next.js Runtime:

1. Connect your GitHub repository to Netlify
2. Netlify will automatically detect Next.js and configure the runtime
3. Add environment variables in Netlify dashboard
4. Deploy

Note: Netlify will automatically use their Next.js Runtime plugin which handles server-side features and API routes.

### 2. Self-Hosted (Node.js)

For self-hosting on a VPS or cloud instance:

```bash
# Build the application
npm run build

# Start the production server
npm start
```

The app will run on port 3000 by default. Use a reverse proxy (nginx, Apache) and process manager (PM2, systemd) for production.

**Example with PM2**:
```bash
npm install -g pm2
pm2 start npm --name "crowdup" -- start
pm2 save
pm2 startup
```

### 3. Docker

Create a `Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t crowdup .
docker run -p 3000:3000 -e NEXT_PUBLIC_SUPABASE_URL=your_url -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key crowdup
```

### 4. AWS Amplify

AWS Amplify supports Next.js with SSR:

1. Connect your repository to AWS Amplify
2. Configure build settings (auto-detected for Next.js)
3. Add environment variables
4. Deploy

### 5. Railway

[Railway](https://railway.app) provides easy deployment:

1. Connect your GitHub repository
2. Railway will detect Next.js automatically
3. Add environment variables
4. Deploy

## Important Notes

### Environment Variables

Ensure all required environment variables are set in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

Optional for Google OAuth:
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

### Build Configuration

The application is configured in `next.config.ts`:
- TypeScript errors are ignored during build (`ignoreBuildErrors: true`)
- ESLint is skipped during build (`ignoreDuringBuilds: true`)
- Images from any remote domain are allowed

For production, consider:
- Enabling TypeScript validation
- Enabling ESLint checks
- Restricting remote image domains to specific hostnames

### Database Setup

Before deploying, ensure:
1. Your Supabase project is set up
2. The schema from `supabase-schema.sql` has been run
3. Database is accessible from your deployment

### Google OAuth

If using Google Sign-In:
1. Add your production domain to authorized redirect URIs in Google Cloud Console
2. Update the redirect URI to: `https://yourdomain.com/api/auth/callback/google`

## Troubleshooting

### Build Fails
- Check that all dependencies are installed
- Verify environment variables are set correctly
- Review build logs for specific errors

### Runtime Errors
- Verify database connection (Supabase URL and key)
- Check that database schema has been applied
- Ensure environment variables are available at runtime

### API Routes Not Working
- Confirm your deployment platform supports API routes (serverless functions)
- Check function logs for errors
- Verify environment variables are accessible to API routes

## Why Not GitHub Pages?

GitHub Pages only supports static sites and cannot run:
- Server-side code (API routes)
- Dynamic server-side rendering
- Middleware
- Server components

This Next.js application requires a Node.js runtime, making platforms like Vercel, Netlify, or self-hosted solutions necessary.
