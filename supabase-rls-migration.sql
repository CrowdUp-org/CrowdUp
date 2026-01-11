-- DRAFT: Row Level Security (RLS) Migration for Crowdup
-- This will enable security at the database level.
-- IMPORTANT: Run this in your Supabase SQL Editor.

-- 1. Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role_audit ENABLE ROW LEVEL SECURITY;

-- 2. Basic User Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
CREATE POLICY "Public profiles are viewable by everyone" ON users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" 
  ON users 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND COALESCE(is_admin, false) = false
    AND COALESCE(is_banned, false) = false
  );

-- Prevent regular users from modifying privileged account fields directly via public API
-- These are still manageable via the admin dashboard which should use service_role or restricted RPCs
-- Note: Supabase RLS doesn't natively support column-level restrictions in policies,
-- but we can use the REVOKE/GRANT pattern suggested by Copilot or a more strict policy.
-- For this migration, we restrict updates so that privileged fields like is_admin and is_banned
-- cannot be set to TRUE by regular authenticated users; admin tooling should use the service_role.

-- 3. Post Policies
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own posts" ON posts;
CREATE POLICY "Users can delete their own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- 4. Comment Policies
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- 5. Vote Policies
DROP POLICY IF EXISTS "Votes are viewable by everyone" ON votes;
CREATE POLICY "Votes are viewable by everyone" ON votes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can vote" ON votes;
CREATE POLICY "Authenticated users can vote" ON votes
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
DROP POLICY IF EXISTS "Users can update their own votes" ON votes;
CREATE POLICY "Users can update their own votes" ON votes FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own votes" ON votes;
CREATE POLICY "Users can delete their own votes" ON votes FOR DELETE USING (auth.uid() = user_id);

-- 6. Admin & Audit (Strict)
-- Note: Uses a custom `is_admin` claim from the JWT for better performance
DROP POLICY IF EXISTS "Admins can view all audit logs" ON user_role_audit;
CREATE POLICY "Admins can view all audit logs" ON user_role_audit FOR SELECT USING (
  COALESCE((auth.jwt()->>'is_admin')::boolean, false) = true
);
