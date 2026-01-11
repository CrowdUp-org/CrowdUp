-- Migration for Company Notification System

-- 1. Update notifications table to support company notifications
-- We'll alter the existing table to match the new requirements while preserving data if possible

DO $$
DECLARE
    notification_user_fk RECORD;
BEGIN
    -- Add recipient_id if it doesn't exist (we'll use user_id as recipient_id for now, but let's standardize)
    -- If user_id exists, we can rename it or just use it. The request uses recipient_id.
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'recipient_id') THEN
        -- Drop any existing foreign key constraints that reference notifications.user_id
        FOR notification_user_fk IN
            SELECT con.conname
            FROM pg_constraint AS con
            JOIN pg_class AS rel ON rel.oid = con.conrelid
            JOIN pg_namespace AS nsp ON nsp.oid = rel.relnamespace
            JOIN LATERAL unnest(con.conkey) AS colnum(attnum) ON TRUE
            JOIN pg_attribute AS att ON att.attrelid = rel.oid AND att.attnum = colnum.attnum
            WHERE con.contype = 'f'
              AND nsp.nspname = 'public'
              AND rel.relname = 'notifications'
              AND att.attname = 'user_id'
        LOOP
            EXECUTE format('ALTER TABLE public.notifications DROP CONSTRAINT %I', notification_user_fk.conname);
        END LOOP;

        -- Rename user_id to recipient_id
        ALTER TABLE notifications RENAME COLUMN user_id TO recipient_id;

        -- Ensure there is a foreign key constraint on recipient_id pointing to users(id)
        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint AS con
            JOIN pg_class AS rel ON rel.oid = con.conrelid
            JOIN pg_namespace AS nsp ON nsp.oid = rel.relnamespace
            JOIN LATERAL unnest(con.conkey) AS colnum(attnum) ON TRUE
            JOIN pg_attribute AS att ON att.attrelid = rel.oid AND att.attnum = colnum.attnum
            WHERE con.contype = 'f'
              AND nsp.nspname = 'public'
              AND rel.relname = 'notifications'
              AND att.attname = 'recipient_id'
        ) THEN
            ALTER TABLE public.notifications
                ADD CONSTRAINT notifications_recipient_id_fkey
                FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- Add recipient_type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'recipient_type') THEN
        ALTER TABLE notifications ADD COLUMN recipient_type TEXT CHECK (recipient_type IN ('user', 'company')) DEFAULT 'user';
        ALTER TABLE notifications ALTER COLUMN recipient_type SET NOT NULL;
    END IF;

    -- Add company_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'company_id') THEN
        ALTER TABLE notifications ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
    END IF;

    -- Add notification_type (rename type if exists, or add)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'type')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'notification_type') THEN
        ALTER TABLE notifications RENAME COLUMN type TO notification_type;
    END IF;
    
    -- Add message (rename content if exists)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'content')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'message') THEN
        ALTER TABLE notifications RENAME COLUMN content TO message;
    END IF;

    -- Add related_post_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_post_id') THEN
        ALTER TABLE notifications ADD COLUMN related_post_id UUID REFERENCES posts(id) ON DELETE CASCADE;
    END IF;

    -- Add related_comment_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'related_comment_id') THEN
        ALTER TABLE notifications ADD COLUMN related_comment_id UUID REFERENCES comments(id) ON DELETE SET NULL;
    END IF;

    -- Add priority
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'priority') THEN
        ALTER TABLE notifications ADD COLUMN priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium';
    END IF;

    -- Add read_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'read_at') THEN
        ALTER TABLE notifications ADD COLUMN read_at TIMESTAMPTZ;
    END IF;

    -- Add actor_id if missing (used in frontend but not in original schema)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'actor_id') THEN
        ALTER TABLE notifications ADD COLUMN actor_id UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;

END $$;

-- 2. Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  notify_new_posts BOOLEAN DEFAULT TRUE,
  notify_comments BOOLEAN DEFAULT TRUE,
  notify_high_votes BOOLEAN DEFAULT TRUE,
  notify_trending BOOLEAN DEFAULT TRUE,
  notify_negative_sentiment BOOLEAN DEFAULT FALSE,
  email_notifications BOOLEAN DEFAULT TRUE,
  email_frequency TEXT CHECK (email_frequency IN ('realtime', 'hourly', 'daily', 'weekly')) DEFAULT 'daily',
  push_notifications BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- Enable Row Level Security on notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Allow users to view only their own notification preferences
CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert notification preferences only for themselves
CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own notification preferences
CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete only their own notification preferences
CREATE POLICY "Users can delete own notification preferences"
  ON notification_preferences
  FOR DELETE
  USING (auth.uid() = user_id);
-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_company ON notifications(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON notification_preferences(user_id);

-- 4. Trigger for updated_at on preferences
CREATE TRIGGER update_notification_preferences_updated_at 
  BEFORE UPDATE ON notification_preferences 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
