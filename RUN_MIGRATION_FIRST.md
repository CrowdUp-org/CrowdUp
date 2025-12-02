# 🚀 IMPORTANT: Run This Migration First!

Before using the new follow and management features, you MUST run this database migration.

## Quick Setup (2 minutes)

### Step 1: Open Supabase
1. Go to https://supabase.com
2. Open your CrowdUp project
3. Click "SQL Editor" in the left sidebar

### Step 2: Run Migration
1. Click "New Query"
2. Copy the entire contents of `migration-follows.sql`
3. Paste into the SQL editor
4. Click "Run" button

### Step 3: Verify
You should see success messages for:
- ✅ Created `company_follows` table
- ✅ Created `app_follows` table
- ✅ Added `follower_count` to companies
- ✅ Added `follower_count` to apps
- ✅ Created 4 indexes

## What This Migration Does

### Creates Follow Tables
- `company_follows` - Tracks which users follow which companies
- `app_follows` - Tracks which users follow which apps

### Adds Follower Counts
- Companies and apps now have a `follower_count` column
- Updates automatically when users follow/unfollow

### Prevents Duplicates
- Each user can only follow a company/app once
- Unique constraints enforce this at database level

### Improves Performance
- Indexes speed up follow lookups
- Fast queries for "who follows this?" and "what do I follow?"

## Troubleshooting

### Error: "relation already exists"
**Fix**: The tables already exist! You're good to go.

### Error: "column already exists"  
**Fix**: The columns already exist! You're good to go.

### Error: "permission denied"
**Fix**: Make sure you're logged into the correct Supabase project as owner/admin.

### Error: "syntax error"
**Fix**: Make sure you copied the ENTIRE migration file, including all comments.

## After Migration

Once migration is complete, you can:
- ✅ Follow companies from company pages
- ✅ See follower counts
- ✅ Use the new management pages
- ✅ Invite team members to companies
- ✅ Manage team roles
- ✅ Delete pages safely

## Need Help?

If you encounter issues:
1. Check the Supabase logs for detailed error messages
2. Verify your project has the latest schema
3. Ensure RLS (Row Level Security) is ENABLED for all tables, and add appropriate row-level policies per table. Never disable RLS except for tightly controlled local development/testing. See Supabase docs for writing policies: https://supabase.com/docs/guides/auth/row-level-security

---

**Run this migration once, then restart your app if it's running!**
