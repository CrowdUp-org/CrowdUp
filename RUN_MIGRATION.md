# 🔄 Run This Migration

## ⚠️ IMPORTANT: Don't Run the Full Schema Again!

You already have the basic tables. You only need to add the NEW features.

## Steps:

1. **Go to Supabase SQL Editor**
   - https://supabase.com/dashboard/project/eodcobxjgofitexvlqwc/sql/new

2. **Copy the migration file**
   - Open `migration-update.sql` in this project
   - Copy ALL the content

3. **Paste and Run**
   - Paste into Supabase SQL Editor
   - Click "Run" (or Cmd/Ctrl + Enter)
   - You should see "Success"

## What This Adds:

- ✅ `connections` table (for follow system)
- ✅ `apps` table (for app/software posting)
- ✅ `app_reviews` table (for app reviews)
- ✅ New indexes for better performance
- ✅ Updated post types to include "App Review Request"

## After Running:

All the new features will be ready to use:
- Follow/unfollow users
- Post apps/software
- Review apps
- Request reviews for your app

## If You Get Errors:

If you see "already exists" errors, that's OK! It means those parts are already there.

The migration uses `IF NOT EXISTS` so it's safe to run multiple times.

---

**Ready?** Go run `migration-update.sql` in Supabase now! 🚀
