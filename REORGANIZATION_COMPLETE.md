# Branch Reorganization Guide

## Overview

This document provides the complete strategy and commands for reorganizing the mixed `feature/reputation-and-trending-fixes` branch into two feature-specific branches:
- `15-user-reputation-and-credibility-system` (Issue #15)
- `11-company-verification-system` (Issue #11)

## Current State

The existing branches on GitHub contain earlier work:
- **15-user-reputation-and-credibility-system**: 1 commit (0681ddf) - basic reputation implementation
- **11-company-verification-system**: 2 commits (904d994, ec6da11) - initial verification system
- **feature/reputation-and-trending-fixes**: 4 commits with mixed reputation and verification work

## Key Commits to Split

The feature branch contains these commits that need to be split:

1. **9b0f965** - Full reputation system implementation (reputation only)
2. **dc2f0ac** - Mixed: reputation + verification + security fixes
3. **a7d9fd6** - Mixed: admin dashboard + reputation hardening
4. **03b3959** - Mixed: notifications for both features

## Reorganization Strategy

### Step 1: Create Backup Branch

```bash
cd /home/runner/work/CrowdUp/CrowdUp
git fetch origin feature/reputation-and-trending-fixes
git checkout -b backup/feature-reputation-and-trending-fixes origin/feature/reputation-and-trending-fixes
git push origin backup/feature-reputation-and-trending-fixes
```

### Step 2: Create Fresh Reputation Branch

```bash
# Start from main
git checkout main
git pull origin main

# Create new reputation branch
git checkout -b 15-user-reputation-and-credibility-system-new

# Cherry-pick full reputation commit
git cherry-pick 9b0f965ca4116e447c2c943986bea128636b0c7d

# Partial cherry-pick from dc2f0ac (reputation parts only)
git cherry-pick -n dc2f0ac650e3e58270b378d81fd5dbe638f6b505
# Keep only reputation-related files
git reset HEAD
git add migration-reputation-hardening.sql  # Created by editing migration-security-fixes.sql
git add src/components/PostCard.tsx  # Voting race condition + reputation integration
git add src/lib/database.types.ts  # Database types
git commit -m "feat: add reputation hardening and race condition fixes

- Add non-negative constraint for reputation scores
- Implement reputation rate limiting table
- Add atomic vote function with reputation integration
- Fix voting race conditions with isVoting flag
- Update database types for reputation features

Cherry-picked from dc2f0ac (reputation-related changes only)"

# Partial cherry-pick from a7d9fd6 (reputation parts only)
git cherry-pick -n a7d9fd62340909161e67b92abd15663a085af294
git reset HEAD
git add reputation-hardening.sql
git add src/app/leaderboard/page.tsx
git add src/components/Sidebar.tsx
git add src/lib/reputation.ts
git commit -m "feat: implement reputation hardening and leaderboard improvements

- Add reputation triggers for post creation and comments
- Update leaderboard with enhanced styling and user cards
- Add leaderboard link to sidebar
- Improve reputation.ts with rate limiting checks

Cherry-picked from a7d9fd6 (reputation features only)"

# Partial cherry-pick from 03b3959 (reputation notifications)
git cherry-pick -n 03b395968a0b7dc912459457238502b2073530c7
git reset HEAD
git add migration-notifications.sql
git add src/components/Header.tsx
git add src/components/ui/notification-bell.tsx
git add src/lib/database.types.ts
git add src/lib/notifications.ts
git add src/lib/reputation.ts
git commit -m "feat: add real-time notifications for reputation milestones

- Create notifications table and realtime setup
- Add notification bell component to header
- Implement notification library with realtime subscriptions
- Add notifications for badge earning and level ups
- Update reputation.ts to send notifications
- Update database types for notifications

Cherry-picked from 03b3959 (reputation notifications only)"
```

### Step 3: Create Fresh Verification Branch

```bash
# Start from main
git checkout main

# Create new verification branch
git checkout -b 11-company-verification-system-new

# Cherry-pick base verification commit
git cherry-pick 904d9946c3b20beeafcef3cf73ea1f559d661be0

# Partial cherry-pick from dc2f0ac (verification parts only)
git cherry-pick -n dc2f0ac650e3e58270b378d81fd5dbe638f6b505
git reset HEAD
git add migration-verification-security.sql  # Created by editing migration-security-fixes.sql
git add migration-verification.sql
git add src/app/admin/verification/page.tsx
git add src/app/company/[name]/manage/page.tsx
git add src/app/company/[name]/page.tsx
git add src/components/ui/verification-form.tsx
git add src/components/ui/verified-badge.tsx
git add src/lib/database.types.ts
git add src/lib/verification.ts
git commit -m "feat: add company verification security and RLS

- Add verification audit log table for tracking verification actions
- Add verification rejection cooldown support
- Implement RLS policies for company_members table
- Update admin verification page with enhanced UI
- Add verification request flow to company manage pages
- Add verified badge display to company profiles
- Update database types for verification features

Cherry-picked from dc2f0ac (verification features only)"

# Partial cherry-pick from a7d9fd6 (admin features)
git cherry-pick -n a7d9fd62340909161e67b92abd15663a085af294
git reset HEAD
git add src/app/admin/users/page.tsx
git add src/lib/verification.ts
git commit -m "feat: add admin user management dashboard

- Implement user management page for admins
- Add ability to promote/demote admin status
- Display user statistics and reputation
- Add pagination and search functionality
- Update verification.ts with admin helper functions

Cherry-picked from a7d9fd6 (admin features only)"

# Partial cherry-pick from 03b3959 (verification notifications)
git cherry-pick -n 03b395968a0b7dc912459457238502b2073530c7
git reset HEAD
git add migration-notifications.sql
git add src/components/Header.tsx
git add src/components/ui/notification-bell.tsx
git add src/lib/database.types.ts
git add src/lib/notifications.ts
git add src/lib/verification.ts
git commit -m "feat: add real-time notifications for verification events

- Create notifications table and realtime setup
- Add notification bell component to header
- Implement notification library with realtime subscriptions
- Add notifications for verification status changes
- Update verification.ts to send notifications
- Update database types for notifications

Cherry-picked from 03b3959 (verification notifications only)"
```

### Step 4: Handling migration-security-fixes.sql

This file from dc2f0ac contains both reputation and verification content. It needs to be split:

**For Reputation Branch** - Create `migration-reputation-hardening.sql`:
```sql
-- =====================================================
-- Reputation System Security & Hardening
-- Run this after migration-reputation.sql
-- =====================================================

-- 1. Add Non-Negative Constraint for Reputation
ALTER TABLE users DROP CONSTRAINT IF EXISTS reputation_non_negative;
ALTER TABLE users ADD CONSTRAINT reputation_non_negative CHECK (reputation_score >= 0);

-- 2. Add Rate Limiting Table for Reputation Points
CREATE TABLE IF NOT EXISTS reputation_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_date DATE NOT NULL DEFAULT CURRENT_DATE,
  action_count INTEGER DEFAULT 1,
  UNIQUE(user_id, action_type, action_date)
);

CREATE INDEX IF NOT EXISTS idx_reputation_rate_limits_user ON reputation_rate_limits(user_id, action_date);

-- 3. Add Atomic Vote with Reputation Function
CREATE OR REPLACE FUNCTION handle_vote_with_reputation(
  p_post_id UUID,
  p_user_id UUID,
  p_vote_type TEXT,
  p_previous_vote TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_post_author_id UUID;
  v_new_votes INTEGER;
  v_points_change INTEGER := 0;
BEGIN
  -- Get post author
  SELECT user_id INTO v_post_author_id FROM posts WHERE id = p_post_id;
  
  IF v_post_author_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Post not found');
  END IF;

  -- Handle vote removal
  IF p_vote_type IS NULL THEN
    DELETE FROM votes WHERE post_id = p_post_id AND user_id = p_user_id;
    UPDATE posts SET votes = votes + (CASE WHEN p_previous_vote = 'up' THEN -1 ELSE 1 END)
    WHERE id = p_post_id RETURNING votes INTO v_new_votes;
    
    IF v_post_author_id != p_user_id THEN
      v_points_change := CASE WHEN p_previous_vote = 'up' THEN -2 ELSE 1 END;
      UPDATE users SET reputation_score = GREATEST(0, reputation_score + v_points_change)
      WHERE id = v_post_author_id;
    END IF;
    
    RETURN json_build_object('success', true, 'votes', v_new_votes);
  END IF;

  -- Handle new vote or vote change
  INSERT INTO votes (post_id, user_id, vote_type)
  VALUES (p_post_id, p_user_id, p_vote_type)
  ON CONFLICT (post_id, user_id) DO UPDATE SET vote_type = p_vote_type;

  IF p_previous_vote IS NULL THEN
    v_new_votes := (SELECT votes FROM posts WHERE id = p_post_id) + 
                   (CASE WHEN p_vote_type = 'up' THEN 1 ELSE -1 END);
    v_points_change := CASE WHEN p_vote_type = 'up' THEN 2 ELSE -1 END;
  ELSE
    v_new_votes := (SELECT votes FROM posts WHERE id = p_post_id) + 
                   (CASE WHEN p_vote_type = 'up' THEN 2 ELSE -2 END);
    v_points_change := CASE WHEN p_vote_type = 'up' THEN 3 ELSE -3 END;
  END IF;

  UPDATE posts SET votes = v_new_votes WHERE id = p_post_id;

  IF v_post_author_id != p_user_id THEN
    UPDATE users SET reputation_score = GREATEST(0, reputation_score + v_points_change)
    WHERE id = v_post_author_id;
    
    INSERT INTO reputation_history (user_id, action_type, points_change, related_post_id)
    VALUES (v_post_author_id, 
            CASE WHEN p_vote_type = 'up' THEN 'post_upvoted' ELSE 'post_downvoted' END,
            CASE WHEN p_vote_type = 'up' THEN 2 ELSE -1 END,
            p_post_id);
  END IF;

  RETURN json_build_object('success', true, 'votes', v_new_votes);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Rate Limiting Function for Reputation
CREATE OR REPLACE FUNCTION check_reputation_rate_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_daily_limit INTEGER DEFAULT 50
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO reputation_rate_limits (user_id, action_type, action_date, action_count)
  VALUES (p_user_id, p_action_type, CURRENT_DATE, 1)
  ON CONFLICT (user_id, action_type, action_date) 
  DO UPDATE SET action_count = reputation_rate_limits.action_count + 1
  RETURNING action_count INTO v_count;
  
  RETURN v_count <= p_daily_limit;
END;
$$ LANGUAGE plpgsql;
```

**For Verification Branch** - Create `migration-verification-security.sql`:
```sql
-- =====================================================
-- Company Verification Security & RLS
-- Run this after migration-verification.sql
-- =====================================================

-- 1. Add Verification Audit Log Table
CREATE TABLE IF NOT EXISTS verification_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID REFERENCES company_members(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected')),
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_audit_membership ON verification_audit(membership_id);
CREATE INDEX IF NOT EXISTS idx_verification_audit_admin ON verification_audit(admin_id);

-- 2. Add Cooldown Support for Verification Resubmission
ALTER TABLE company_members ADD COLUMN IF NOT EXISTS verification_rejected_at TIMESTAMPTZ;

-- 3. Row Level Security for Admin Operations
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS company_members_select ON company_members;
CREATE POLICY company_members_select ON company_members
  FOR SELECT USING (true);

DROP POLICY IF EXISTS company_members_insert ON company_members;
CREATE POLICY company_members_insert ON company_members
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR auth.uid() IS NULL);

DROP POLICY IF EXISTS company_members_update ON company_members;
CREATE POLICY company_members_update ON company_members
  FOR UPDATE USING (
    auth.uid()::text = user_id::text 
    OR EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND is_admin = true)
  );

DROP POLICY IF EXISTS company_members_delete ON company_members;
CREATE POLICY company_members_delete ON company_members
  FOR DELETE USING (
    auth.uid()::text = user_id::text 
    OR EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND is_admin = true)
  );
```

### Step 5: Push and Replace Remote Branches

```bash
# Force push the new branches (replace old ones)
git push -f origin 15-user-reputation-and-credibility-system-new:15-user-reputation-and-credibility-system
git push -f origin 11-company-verification-system-new:11-company-verification-system
```

### Step 6: Create Pull Requests

**PR for Reputation System:**

Title: `feat: Implement User Reputation and Credibility System (Issue #15)`

Body:
```markdown
## User Reputation and Credibility System (Issue #15)

This PR implements a comprehensive reputation and credibility system for CrowdUp users.

### Features Implemented
- User reputation scoring with 6 levels (Newcomer to Legend)
- Reputation history tracking with detailed action logs
- Badge system with automatic awarding
- Leaderboard showing top contributors
- Real-time notifications for reputation milestones
- Rate limiting to prevent abuse
- Voting race condition fixes with reputation integration

### Database Changes
- `reputation_history` table for tracking all reputation events
- `badges` table for badge definitions
- `user_badges` table for user badge associations
- `reputation_rate_limits` table for abuse prevention
- `notifications` table for real-time updates

### Components Added
- ReputationBadge - Display user reputation level
- ReputationCard - Show reputation details on profiles
- ReputationHistory - View reputation change history
- NotificationBell - Real-time notification system
- Leaderboard page - Top contributors ranking

### Security & Hardening
- Non-negative constraint on reputation scores
- Rate limiting for reputation-earning actions
- Atomic vote function to prevent race conditions
- Database triggers for automatic reputation awards

### Migration Files
1. `migration-reputation.sql` - Core reputation tables and schema
2. `migration-reputation-hardening.sql` - Security constraints and functions
3. `reputation-hardening.sql` - Database triggers
4. `migration-notifications.sql` - Notification infrastructure

### Commits
- Cherry-picked and split from feature/reputation-and-trending-fixes
- Original commits: 9b0f965, dc2f0ac (partial), a7d9fd6 (partial), 03b3959 (partial)
- All commits properly attributed to original author
```

**PR for Verification System:**

Title: `feat: Implement Company Verification System (Issue #11)`

Body:
```markdown
## Company Verification System (Issue #11)

This PR implements a company verification system with admin management capabilities.

### Features Implemented
- Company verification request flow
- Admin verification dashboard
- User management dashboard for admins
- Verified badge display on company profiles
- Real-time notifications for verification status
- Audit logging for verification actions
- Row Level Security (RLS) policies

### Database Changes
- `verification_audit` table for tracking verification actions
- `verification_rejected_at` column for cooldown support
- RLS policies for `company_members` table
- `notifications` table for real-time updates

### Components Added
- VerificationForm - Request verification UI
- VerifiedBadge - Display verification status
- NotificationBell - Real-time notification system
- Admin verification page - Review verification requests
- Admin users page - Manage user permissions

### Admin Features
- View all verification requests
- Approve/reject verification with notes
- Manage user admin status
- View user statistics
- Search and pagination

### Security
- RLS policies restricting verification updates
- Audit trail for all verification actions
- Cooldown period for resubmission after rejection
- Admin-only access controls

### Migration Files
1. `migration-verification.sql` - Base verification schema
2. `migration-verification-security.sql` - RLS policies and audit
3. `migration-notifications.sql` - Notification infrastructure

### Commits
- Cherry-picked and split from feature/reputation-and-trending-fixes
- Original commits: 904d994, dc2f0ac (partial), a7d9fd6 (partial), 03b3959 (partial)
- All commits properly attributed to original author
```

### Step 7: Cleanup

After PRs are approved and merged:

```bash
# Delete the old feature branch
git push origin --delete feature/reputation-and-trending-fixes

# Delete local working branches
git branch -D 15-user-reputation-and-credibility-system-new
git branch -D 11-company-verification-system-new
```

## Key Decisions

### Shared Components

The following components appear in both branches as they're used by both features:
- `migration-notifications.sql` - Notification infrastructure
- `src/components/ui/notification-bell.tsx` - Shared notification UI
- `src/lib/notifications.ts` - Shared notification logic
- `src/lib/database.types.ts` - Database types (updated in both)

This is intentional as notifications are shared infrastructure.

### Voting Race Condition Fix

The `isVoting` flag in PostCard.tsx was included in the reputation branch because:
1. It's tightly coupled with reputation point awarding logic
2. The fix was introduced alongside reputation integration
3. Keeping it with reputation maintains functional cohesion

### Excluded Changes

Generic linting and formatting fixes (svg-paths.ts, sidebar.tsx, VisualEditsMessenger.tsx) were excluded from both branches as they're not feature-specific.

## Verification Steps

After reorganization, verify the branches:

```bash
# Check reputation branch
git checkout 15-user-reputation-and-credibility-system
git log --oneline
git diff main --stat

# Check verification branch
git checkout 11-company-verification-system
git log --oneline
git diff main --stat

# Verify no reputation files in verification branch
git checkout 11-company-verification-system
git diff main --name-only | grep -i reputation
# Should return empty or only shared files

# Verify no verification files in reputation branch
git checkout 15-user-reputation-and-credibility-system
git diff main --name-only | grep -i verif
# Should return empty or only shared files
```

## Troubleshooting

### Merge Conflicts

If you encounter merge conflicts during cherry-pick:
```bash
# Accept the incoming changes for the files you want
git checkout --theirs <file>
git add <file>
git cherry-pick --continue
```

### Lock File Issues

If you get "index.lock" errors:
```bash
rm -f .git/index.lock
```

### Unwanted Files

To unstage files during partial cherry-pick:
```bash
git reset HEAD <file>
```

## Notes

- All original commit attribution is preserved
- Commit messages reference source commits for traceability
- No data is lost - backup branch preserves original work
- Both branches are based on main, not on each other
- Clean, linear history on both branches
