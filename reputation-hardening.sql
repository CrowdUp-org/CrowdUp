-- Production Hardening for Reputation System

-- 1. Atomic function for awarding reputation points
CREATE OR REPLACE FUNCTION award_reputation_points(
    p_user_id UUID,
    p_action_type TEXT,
    p_points INTEGER,
    p_related_post_id UUID DEFAULT NULL,
    p_related_comment_id UUID DEFAULT NULL,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_score INTEGER;
BEGIN
    -- Update user score and level (uses the trigger we already set up for levels)
    UPDATE users
    SET 
        reputation_score = GREATEST(0, reputation_score + p_points)
    WHERE id = p_user_id
    RETURNING reputation_score INTO v_new_score;

    -- Insert history record
    INSERT INTO reputation_history (
        user_id,
        action_type,
        points_change,
        related_post_id,
        related_comment_id,
        reason
    ) VALUES (
        p_user_id,
        p_action_type,
        p_points,
        p_related_post_id,
        p_related_comment_id,
        p_reason
    );

    RETURN jsonb_build_object(
        'success', true,
        'new_score', v_new_score
    );
END;
$$;

-- 2. Audit log for user role changes
CREATE TABLE IF NOT EXISTS user_role_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_user_id UUID REFERENCES users(id),
    admin_id UUID REFERENCES users(id),
    action TEXT, -- 'promote', 'demote'
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_role_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view role audit" ON user_role_audit
    FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE));

-- 3. Additional RLS for reputation history
-- Users can see their own history, admins see all
DROP POLICY IF EXISTS "Users can view own reputation history" ON reputation_history;
CREATE POLICY "Users can view own reputation history" ON reputation_history
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all reputation history" ON reputation_history
    FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE));
