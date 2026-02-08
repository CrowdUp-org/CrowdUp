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
