-- Migration for Company Verification System

-- Add verification columns to company_members
ALTER TABLE company_members ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE company_members ADD COLUMN IF NOT EXISTS verification_status TEXT CHECK (verification_status IN ('pending', 'approved', 'rejected')) DEFAULT NULL;
ALTER TABLE company_members ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE company_members ADD COLUMN IF NOT EXISTS verification_documents JSONB DEFAULT NULL;

-- Add verification_notes for admin feedback
ALTER TABLE company_members ADD COLUMN IF NOT EXISTS verification_notes TEXT DEFAULT NULL;

-- Add platform admin flag to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN DEFAULT FALSE;

-- Create index for faster filtering of pending requests
CREATE INDEX IF NOT EXISTS idx_company_members_verification_status ON company_members(verification_status);
