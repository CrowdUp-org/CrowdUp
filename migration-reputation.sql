-- =====================================================
-- User Reputation and Credibility System Migration
-- =====================================================
-- Run this migration in your Supabase SQL Editor

-- Add reputation fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation_level TEXT DEFAULT 'newcomer';

-- =====================================================
-- Reputation History Table
-- Tracks all point changes for audit and display
-- =====================================================
CREATE TABLE IF NOT EXISTS reputation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'post_created',
    'post_upvoted',
    'post_downvoted',
    'post_acknowledged',
    'post_implemented',
    'comment_upvoted',
    'reported_content',
    'manual_adjustment'
  )),
  points_change INTEGER NOT NULL,
  related_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  related_comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Badges System
-- Define achievement badges and track user earnings
-- =====================================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- emoji or icon identifier
  requirement_type TEXT NOT NULL CHECK (requirement_type IN (
    'posts_count',
    'upvotes_received',
    'reputation_score',
    'days_active',
    'implementations',
    'comments_count'
  )),
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_reputation_history_user ON reputation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_history_created ON reputation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reputation_history_action ON reputation_history(action_type);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_users_reputation ON users(reputation_score DESC);

-- =====================================================
-- Insert Default Badges
-- =====================================================
INSERT INTO badges (name, description, icon, requirement_type, requirement_value) VALUES
  ('First Post', 'Created your first post', '🎯', 'posts_count', 1),
  ('Prolific Poster', 'Created 10 posts', '📝', 'posts_count', 10),
  ('Content Creator', 'Created 50 posts', '✍️', 'posts_count', 50),
  ('Rising Star', 'Received 10 upvotes', '⭐', 'upvotes_received', 10),
  ('Popular Voice', 'Received 100 upvotes', '🌟', 'upvotes_received', 100),
  ('Community Favorite', 'Received 500 upvotes', '💫', 'upvotes_received', 500),
  ('Contributor', 'Reached 100 reputation', '🌿', 'reputation_score', 100),
  ('Established', 'Reached 500 reputation', '🌳', 'reputation_score', 500),
  ('Trusted Member', 'Reached 1000 reputation', '⭐', 'reputation_score', 1000),
  ('Expert', 'Reached 5000 reputation', '🏆', 'reputation_score', 5000),
  ('Legend', 'Reached 10000 reputation', '💎', 'reputation_score', 10000)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- Function to Update User Reputation Level
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_reputation_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Update reputation level based on score
  NEW.reputation_level := CASE
    WHEN NEW.reputation_score >= 10000 THEN 'legend'
    WHEN NEW.reputation_score >= 5000 THEN 'expert'
    WHEN NEW.reputation_score >= 1000 THEN 'trusted'
    WHEN NEW.reputation_score >= 500 THEN 'established'
    WHEN NEW.reputation_score >= 100 THEN 'contributor'
    ELSE 'newcomer'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update level when reputation changes
DROP TRIGGER IF EXISTS trigger_update_reputation_level ON users;
CREATE TRIGGER trigger_update_reputation_level
  BEFORE UPDATE OF reputation_score ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_reputation_level();

-- =====================================================
-- Initialize existing users with reputation based on posts/votes
-- =====================================================
UPDATE users SET reputation_score = (
  SELECT COALESCE(
    (SELECT COUNT(*) * 5 FROM posts WHERE posts.user_id = users.id) +
    (SELECT COALESCE(SUM(CASE WHEN v.vote_type = 'up' THEN 2 ELSE -1 END), 0)
     FROM votes v
     JOIN posts p ON v.post_id = p.id
     WHERE p.user_id = users.id),
    0
  )
);

-- Trigger the level update for all users
UPDATE users SET reputation_score = reputation_score WHERE reputation_score >= 0;
