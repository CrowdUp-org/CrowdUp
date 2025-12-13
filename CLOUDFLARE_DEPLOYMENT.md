# Cloudflare Pages Deployment Configuration

This project can be deployed to Cloudflare Pages using **npm** as the package manager.

## Build Configuration

In your Cloudflare Pages project settings, use the following configuration:

### Build Settings
- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Install command**: `npm ci` (recommended) or `npm install`

### Environment Variables
Make sure to set the following environment variables in your Cloudflare Pages project settings:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (optional) - For Google OAuth
- `GOOGLE_CLIENT_SECRET` (optional) - For Google OAuth

### Framework Preset
- Select **Next.js** as the framework preset

## Why npm instead of bun?

This project previously used Bun, but due to compatibility issues with certain dependencies in the Bun 1.2.x versions (causing lockfile resolution errors), we've switched to npm for production deployments. 

The repository now uses `package-lock.json` instead of `bun.lock` or `bun.lockb`.

You can still use Bun locally for development once the compatibility issues are resolved in newer Bun versions.

## Troubleshooting

### Deployment fails with "lockfile had changes"
- This error occurs when using Bun with `--frozen-lockfile` flag
- Solution: Use npm as shown above

### Build fails with missing dependencies
- Ensure `npm ci` is used in the install command
- This ensures dependencies are installed exactly as specified in `package-lock.json`

### Environment variables not working
- Double-check that all required environment variables are set in Cloudflare Pages settings
- Environment variable names must match exactly (case-sensitive)
