-- Migration for Company Verification System
-- Adds verification fields to company_members table

-- Add verification columns to company_members
ALTER TABLE company_members ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE company_members ADD COLUMN IF NOT EXISTS verification_status TEXT 
  CHECK (verification_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE company_members ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ;
ALTER TABLE company_members ADD COLUMN IF NOT EXISTS verification_documents JSONB;
ALTER TABLE company_members ADD COLUMN IF NOT EXISTS verification_notes TEXT;

-- Add is_admin field to users table for admin access control
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create index for pending verifications (for admin dashboard performance)
CREATE INDEX IF NOT EXISTS idx_company_members_verification_pending 
  ON company_members(verification_status) WHERE verification_status = 'pending';

-- Create index for verified members (for quick lookup)
CREATE INDEX IF NOT EXISTS idx_company_members_verified 
  ON company_members(verified) WHERE verified = TRUE;

-- Create a trigger to update verification_date when status changes to approved
CREATE OR REPLACE FUNCTION update_verification_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verification_status = 'approved' AND (OLD.verification_status IS NULL OR OLD.verification_status != 'approved') THEN
    NEW.verified := TRUE;
    NEW.verification_date := NOW();
  ELSIF NEW.verification_status = 'rejected' THEN
    NEW.verified := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_update_verification_date ON company_members;

-- Create the trigger
CREATE TRIGGER trigger_update_verification_date
  BEFORE UPDATE ON company_members
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_date();
