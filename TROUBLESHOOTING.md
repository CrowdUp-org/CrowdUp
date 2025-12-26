# CrowdUp Troubleshooting

Common Issues
- Invalid credentials: run Supabase SQL schema, verify envs
- Posts not showing: check tables, browser console, auth state
- Supabase connection errors: correct URL with https, active project
- Google OAuth not configured: set NEXT_PUBLIC_GOOGLE_CLIENT_ID, restart dev
- Redirect URI mismatch: exact URIs, protocol and no trailing slash
- Messaging not sending: user authenticated, conversation exists, policies applied
- Realtime not working: enable Supabase realtime, verify subscriptions

Environment
- Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are set
- For OAuth, set SUPABASE_SECRET_KEY, NEXT_PUBLIC_GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

Build & Deploy
- After adding envs, redeploy (Vercel) or rebuild (Docker)
- Use vercel env list to verify variables

Database
- Apply migrations: supabase-schema.sql, migration-google-oauth.sql, migration-companies-apps.sql, migration-follows.sql, migration-user-settings.sql
- Verify indexes for performance

Reset Steps
- Clear localStorage
- Restart dev server
- Re-run migrations in Supabase SQL Editor

Support
- Check Supabase logs
- Inspect browser console errors
- Open an issue with details
