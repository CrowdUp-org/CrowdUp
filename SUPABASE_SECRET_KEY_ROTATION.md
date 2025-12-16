# Supabase Secret API Key Rotation Guide

This document provides a step-by-step runbook for safely rotating the Supabase Secret API key (`SUPABASE_SECRET_KEY`) used by CrowdUp server-side operations.

## Overview

CrowdUp uses the Supabase Secret API key (`sb_secret_...`) for privileged server-side operations, particularly in the Google OAuth authentication flow. Regular key rotation reduces security risk in case of credential exposure.

**Key rotation does NOT require downtime** if you follow this phased rollout approach.

## Prerequisites

- Access to Supabase Project Settings (Admin role required)
- Access to deployment platform (Vercel, Docker, etc.)
- Access to the CrowdUp repository to deploy updated code (if needed)

## Phased Rollout Strategy

### Phase 1: Generate New Secret API Key (5 minutes)

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Open **Project Settings** > **API**
   - Look for **Secret keys** section

2. **Generate a New Secret Key**
   - Click **"Create new secret key"** or similar button
   - Copy the new secret key (starts with `sb_secret_...`)
   - Store it securely in a password manager

3. **Do NOT delete the old key yet** — we'll keep both active during transition

### Phase 2: Deploy with Dual Secret Keys (Active-Active, 5-10 minutes)

This phase ensures zero downtime by having both keys working simultaneously.

1. **Update Environment Variables**
   - **Local Development:** Update `.env.local` with new `SUPABASE_SECRET_KEY`
   - **Vercel/Cloud Deployment:**
     - Go to project settings > Environment variables
     - Update `SUPABASE_SECRET_KEY` with the new key
     - Leave old key as backup (if stored elsewhere)
   - **Docker/Self-Hosted:**
     - Update deployment manifest or config file
     - Use your standard deployment mechanism (docker-compose, Kubernetes, etc.)

2. **Deploy the Updated Configuration**
   - Commit environment variable update (if in code/config)
   - Trigger deployment in your platform
   - Wait for deployment to complete and become active

3. **Verify Deployment**
   - Test Google OAuth sign-in flow
   - Check application logs for Supabase errors
   - Confirm server-side operations work correctly

### Phase 3: Monitor & Validate (15-60 minutes)

Monitor your application to ensure the new key is working properly with no errors.

1. **Check Application Logs**
   - Look for Supabase authentication errors
   - Verify Google OAuth callbacks succeed
   - Monitor API route response times

2. **Test Critical Paths**
   - Test Google Sign-In on staging/dev environment first
   - Test on production environment
   - Verify user creation and OAuth account linking works

3. **Watch Metrics**
   - Monitor error rates
   - Check API latency
   - Look for any timeout or authentication failures

### Phase 4: Retire Old Secret API Key (After 24+ hours validation)

Once you've confirmed the new key works correctly for at least 24 hours, retire the old key.

1. **Go to Supabase Dashboard**
   - Navigate to **Project Settings** > **API**
   - Find the old secret key in the **Secret keys** section

2. **Delete the Old Secret Key**
   - Click the delete/trash icon next to the old key
   - Confirm the deletion
   - The old key is now invalidated

3. **Clean Up Local References**
   - Remove old `SUPABASE_SECRET_KEY` value from password managers
   - Update any documentation referencing the old key

## Troubleshooting

### Application Errors After Key Rotation

If you see Supabase authentication errors after updating the key:

1. **Double-check the environment variable**
   - Verify `SUPABASE_SECRET_KEY` is correctly set
   - Ensure there are no typos or trailing spaces
   - Check that it starts with `sb_secret_`

2. **Verify the key is valid**
   - Go to Supabase Project Settings > API
   - Confirm the key exists in the **Secret keys** list
   - Make sure it wasn't accidentally deleted

3. **Restart your application**
   - For Vercel: Trigger a redeployment
   - For Docker: Restart containers
   - For Node.js: Restart the process

4. **Rollback if necessary**
   - If you still have the old key, temporarily revert `SUPABASE_SECRET_KEY`
   - Verify the application works with the old key
   - Investigate the new key issue

### How to Rollback

If the new key causes problems:

1. Revert `SUPABASE_SECRET_KEY` to the previous value
2. Redeploy your application
3. Verify that server-side operations work again
4. Don't delete the new key—investigate why it didn't work
5. Contact Supabase support if the new key is malformed

## Security Best Practices

### Do's ✅
- **Rotate keys regularly** — every 90 days recommended
- **Use a password manager** to store secret keys
- **Keep keys in environment variables** (never hardcode them)
- **Monitor key usage** in Supabase logs
- **Test key rotation** in staging first
- **Document the rotation** in your incident tracking system

### Don'ts ❌
- **Don't commit secrets to Git** (even deleted commits can expose keys)
- **Don't share keys via email or unencrypted chat**
- **Don't use the same key across multiple projects**
- **Don't delay key rotation** if you suspect exposure
- **Don't delete the old key immediately** during rotation—wait 24+ hours

## Automation (Advanced)

For teams with automated deployments, consider:

1. **Secrets Management Service**
   - Use AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault
   - Automatically rotate keys on a schedule
   - Audit all key access

2. **CI/CD Integration**
   - Store `SUPABASE_SECRET_KEY` only in CI/CD secrets
   - Update deployment manifests automatically on key rotation
   - Run post-deployment validation tests

3. **Key Expiry**
   - Some platforms support automatic key expiration
   - Set expiry dates to force regular rotations

## Reference

- [Supabase API Keys Documentation](https://supabase.com/docs/guides/api/keys)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [CrowdUp Setup Guide](./SETUP.md)
- [CrowdUp Architecture](./src/lib/supabase.ts)

## Questions or Issues?

If you encounter issues with key rotation or have questions:

1. Check the troubleshooting section above
2. Review Supabase logs for authentication errors
3. Open an issue in the CrowdUp repository
4. Contact Supabase support for infrastructure-level issues
