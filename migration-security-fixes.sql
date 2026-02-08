-- =====================================================
-- Security & Flaw Fixes Migration
-- Run this after the main migrations
-- =====================================================

-- =====================================================
-- 1. Add Non-Negative Constraint for Reputation
-- =====================================================
ALTER TABLE users DROP CONSTRAINT IF EXISTS reputation_non_negative;
ALTER TABLE users ADD CONSTRAINT reputation_non_negative CHECK (reputation_score >= 0);

-- =====================================================
-- 2. Add Verification Audit Log Table
-- =====================================================
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

-- =====================================================
-- 3. Add Rate Limiting Table for Reputation Points
-- =====================================================
CREATE TABLE IF NOT EXISTS reputation_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_date DATE NOT NULL DEFAULT CURRENT_DATE,
  action_count INTEGER DEFAULT 1,
  UNIQUE(user_id, action_type, action_date)
);

CREATE INDEX IF NOT EXISTS idx_reputation_rate_limits_user ON reputation_rate_limits(user_id, action_date);

-- =====================================================
-- 4. Add Cooldown Support for Verification Resubmission
-- =====================================================
ALTER TABLE company_members ADD COLUMN IF NOT EXISTS verification_rejected_at TIMESTAMPTZ;

-- =====================================================
-- 5. Row Level Security for Admin Operations
-- =====================================================
-- Enable RLS on company_members
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read company members
DROP POLICY IF EXISTS company_members_select ON company_members;
CREATE POLICY company_members_select ON company_members
  FOR SELECT USING (true);

-- Policy: Users can insert their own membership
DROP POLICY IF EXISTS company_members_insert ON company_members;
CREATE POLICY company_members_insert ON company_members
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR auth.uid() IS NULL);

-- Policy: Users can update their own membership, admins can update any
DROP POLICY IF EXISTS company_members_update ON company_members;
CREATE POLICY company_members_update ON company_members
  FOR UPDATE USING (
    auth.uid()::text = user_id::text
    OR EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND is_admin = true)
  );

-- Policy: Only admins can delete memberships (or self-removal)
DROP POLICY IF EXISTS company_members_delete ON company_members;
CREATE POLICY company_members_delete ON company_members
  FOR DELETE USING (
    auth.uid()::text = user_id::text
    OR EXISTS (SELECT 1 FROM users WHERE id::text = auth.uid()::text AND is_admin = true)
  );

-- =====================================================
-- 6. Add Atomic Vote with Reputation Function
-- =====================================================
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

    -- Update post votes
    UPDATE posts SET votes = votes + (CASE WHEN p_previous_vote = 'up' THEN -1 ELSE 1 END)
    WHERE id = p_post_id RETURNING votes INTO v_new_votes;

    -- Reverse reputation (only if not self-vote)
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

  -- Calculate vote change
  IF p_previous_vote IS NULL THEN
    v_new_votes := (SELECT votes FROM posts WHERE id = p_post_id) +
                   (CASE WHEN p_vote_type = 'up' THEN 1 ELSE -1 END);
    v_points_change := CASE WHEN p_vote_type = 'up' THEN 2 ELSE -1 END;
  ELSE
    v_new_votes := (SELECT votes FROM posts WHERE id = p_post_id) +
                   (CASE WHEN p_vote_type = 'up' THEN 2 ELSE -2 END);
    v_points_change := CASE WHEN p_vote_type = 'up' THEN 3 ELSE -3 END; -- reverse old + apply new
  END IF;

  -- Update post votes
  UPDATE posts SET votes = v_new_votes WHERE id = p_post_id;

  -- Update reputation (only if not self-vote)
  IF v_post_author_id != p_user_id THEN
    UPDATE users SET reputation_score = GREATEST(0, reputation_score + v_points_change)
    WHERE id = v_post_author_id;

    -- Record history
    INSERT INTO reputation_history (user_id, action_type, points_change, related_post_id)
    VALUES (v_post_author_id,
            CASE WHEN p_vote_type = 'up' THEN 'post_upvoted' ELSE 'post_downvoted' END,
            CASE WHEN p_vote_type = 'up' THEN 2 ELSE -1 END,
            p_post_id);
  END IF;

  RETURN json_build_object('success', true, 'votes', v_new_votes);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. Rate Limiting Function for Reputation
-- =====================================================
CREATE OR REPLACE FUNCTION check_reputation_rate_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_daily_limit INTEGER DEFAULT 50
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Get or create today's count
  INSERT INTO reputation_rate_limits (user_id, action_type, action_date, action_count)
  VALUES (p_user_id, p_action_type, CURRENT_DATE, 1)
  ON CONFLICT (user_id, action_type, action_date)
  DO UPDATE SET action_count = reputation_rate_limits.action_count + 1
  RETURNING action_count INTO v_count;

  RETURN v_count <= p_daily_limit;
END;
$$ LANGUAGE plpgsql;
