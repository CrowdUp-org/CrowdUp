# CrowdUp Deployment Guide

This consolidates deployment strategies and environment configuration.

Overview
- Requires NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY
- Public keys are safe in client; Secret key is server-only

Local Development
- Set .env.local with required variables
- Run npm run dev

Vercel
- Add environment variables in Settings → Environment Variables
- Include NEXT_PUBLIC_* keys and SUPABASE_SECRET_KEY
- Redeploy after changes

CLI Setup
- Install vercel CLI, link project, add envs, deploy

Docker
- Use .env.production, pass envs via compose
- Build and run container

GitHub Actions
- Store secrets in repository → Actions secrets
- Use in workflows to deploy

Google Cloud Run
- Deploy image and set envs; use Secret Manager for SUPABASE_SECRET_KEY

AWS / Heroku
- Configure environment settings for keys accordingly

Troubleshooting
- Supabase auth errors: verify envs, redeploy
- OAuth callback issues: rebuild/redeploy after adding envs

Security Checklist
- SUPABASE_SECRET_KEY set only in hosting platform
- Public keys present across environments
- Google OAuth vars set if using OAuth

References
- [docs/archive/SUPABASE_SECRET_KEY_ROTATION.md](docs/archive/SUPABASE_SECRET_KEY_ROTATION.md)
- [SETUP.md](SETUP.md)
- Next.js environment docs
