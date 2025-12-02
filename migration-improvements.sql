-- CrowdUp Major Improvements Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. STATUS TRACKING FOR POSTS
-- ============================================

-- Add status column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'wont_fix'));

-- Add priority column for better organization
ALTER TABLE posts ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical'));

-- Add tags for better categorization (stored as JSON array)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- ============================================
-- 2. BOOKMARKS/SAVED POSTS
-- ============================================

CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post ON bookmarks(post_id);

-- Enable RLS for bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY bookmarks_select ON bookmarks
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY bookmarks_insert ON bookmarks
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY bookmarks_update ON bookmarks
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY bookmarks_delete ON bookmarks
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- 3. OFFICIAL COMPANY RESPONSES
-- ============================================

CREATE TABLE IF NOT EXISTS official_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  responder_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  response_type TEXT DEFAULT 'acknowledgment' CHECK (response_type IN ('acknowledgment', 'investigating', 'planned', 'fixed', 'wont_fix', 'duplicate')),
  is_pinned BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_official_responses_post ON official_responses(post_id);

-- Enable RLS for official_responses
ALTER TABLE official_responses ENABLE ROW LEVEL SECURITY;

-- Anyone may read official responses
CREATE POLICY official_responses_select ON official_responses
  FOR SELECT USING (true);

-- Only company admins/owners can write official responses
CREATE POLICY official_responses_insert ON official_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_members m
      WHERE m.company_id = official_responses.company_id
        AND m.user_id = auth.uid()
        AND m.role IN ('admin', 'owner')
    )
  );
CREATE POLICY official_responses_update ON official_responses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM company_members m
      WHERE m.company_id = official_responses.company_id
        AND m.user_id = auth.uid()
        AND m.role IN ('admin', 'owner')
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM company_members m
      WHERE m.company_id = official_responses.company_id
        AND m.user_id = auth.uid()
        AND m.role IN ('admin', 'owner')
    )
  );
CREATE POLICY official_responses_delete ON official_responses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM company_members m
      WHERE m.company_id = official_responses.company_id
        AND m.user_id = auth.uid()
        AND m.role IN ('admin', 'owner')
    )
  );

-- ============================================
-- 4. THREADED COMMENTS (Reply Support)
-- ============================================

-- Add parent_id for reply threading
ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS depth INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- ============================================
-- 5. NOTIFICATIONS SYSTEM
-- ============================================

-- Drop existing notifications table if it exists (to recreate with correct schema)
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('vote', 'comment', 'reply', 'follow', 'mention', 'status_change', 'official_response')),
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Enable RLS for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (user_id = auth.uid());
-- Note: INSERT is done via server-side triggers, so no client insert policy needed
-- If client inserts are needed, uncomment the following:
-- CREATE POLICY notifications_insert ON notifications
--   FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY notifications_delete ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- 6. DYNAMIC COMPANIES (No More Hardcoding)
-- ============================================

-- Add more fields to companies for better UX
ALTER TABLE companies ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#6B7280';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS post_count INTEGER DEFAULT 0;

-- Make display_name nullable or set default if it exists
DO $$ 
BEGIN
  -- Try to alter the column to allow nulls or have a default
  ALTER TABLE companies ALTER COLUMN display_name DROP NOT NULL;
EXCEPTION
  WHEN undefined_column THEN NULL;
  WHEN others THEN NULL;
END $$;

-- Insert more popular companies if they don't exist (with display_name = name)
INSERT INTO companies (name, display_name, description, logo_url, website, color, category, is_verified) VALUES
  ('GitHub', 'GitHub', 'Where the world builds software', 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png', 'https://github.com', '#181717', 'Developer Tools', true),
  ('Slack', 'Slack', 'Where work happens', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/2048px-Slack_icon_2019.svg.png', 'https://slack.com', '#4A154B', 'Communication', true),
  ('Notion', 'Notion', 'All-in-one workspace', 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png', 'https://notion.so', '#000000', 'Productivity', true),
  ('Figma', 'Figma', 'Collaborative design tool', 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg', 'https://figma.com', '#F24E1E', 'Design', true),
  ('Zoom', 'Zoom', 'Video communications', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Zoom_Logo_2022.svg/2560px-Zoom_Logo_2022.svg.png', 'https://zoom.us', '#2D8CFF', 'Communication', true),
  ('LinkedIn', 'LinkedIn', 'Professional network', 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png', 'https://linkedin.com', '#0A66C2', 'Social Media', true),
  ('Reddit', 'Reddit', 'The front page of the internet', 'https://www.redditstatic.com/desktop2x/img/favicon/android-icon-192x192.png', 'https://reddit.com', '#FF4500', 'Social Media', true),
  ('Uber', 'Uber', 'Move the way you want', 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png', 'https://uber.com', '#000000', 'Transportation', true),
  ('Airbnb', 'Airbnb', 'Belong anywhere', 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg', 'https://airbnb.com', '#FF5A5F', 'Travel', true),
  ('Amazon', 'Amazon', 'Everything store', 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', 'https://amazon.com', '#FF9900', 'E-Commerce', true),
  ('Apple', 'Apple', 'Think different', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', 'https://apple.com', '#000000', 'Technology', true),
  ('Google', 'Google', 'Organize the world''s information', 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg', 'https://google.com', '#4285F4', 'Technology', true),
  ('Microsoft', 'Microsoft', 'Empowering everyone', 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', 'https://microsoft.com', '#00A4EF', 'Technology', true),
  ('Tesla', 'Tesla', 'Accelerating sustainable energy', 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png', 'https://tesla.com', '#CC0000', 'Automotive', true),
  ('Stripe', 'Stripe', 'Payments infrastructure', 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg', 'https://stripe.com', '#635BFF', 'Fintech', true)
ON CONFLICT (name) DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  category = EXCLUDED.category,
  is_verified = EXCLUDED.is_verified;

-- ============================================
-- 7. USER PREFERENCES (for Dark Mode, etc.)
-- ============================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"theme": "light", "notifications": true, "emailDigest": "weekly"}';

-- ============================================
-- 8. POST VIEWS TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_views_post ON post_views(post_id);

-- Add view count to posts for quick access
ALTER TABLE posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Enable RLS for post_views
ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert views (for their own user_id or anonymous)
CREATE POLICY post_views_insert ON post_views
  FOR INSERT WITH CHECK (user_id IS NULL OR user_id = auth.uid());
-- Users can only see their own view records
CREATE POLICY post_views_select ON post_views
  FOR SELECT USING (user_id = auth.uid());

-- ============================================
-- 9. TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Update company post count when posts are created/deleted
CREATE OR REPLACE FUNCTION update_company_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE companies SET post_count = post_count + 1 WHERE LOWER(name) = LOWER(NEW.company);
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE companies SET post_count = post_count - 1 WHERE LOWER(name) = LOWER(OLD.company);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_company_post_count ON posts;
CREATE TRIGGER trigger_update_company_post_count
AFTER INSERT OR DELETE ON posts
FOR EACH ROW EXECUTE FUNCTION update_company_post_count();

-- Trigger for notifications on comments
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
  parent_comment_owner_id UUID;
BEGIN
  -- Get post owner
  SELECT user_id INTO post_owner_id FROM posts WHERE id = NEW.post_id;
  
  -- Notify post owner if commenter is different
  IF post_owner_id IS NOT NULL AND post_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, message, link, actor_id, post_id)
    VALUES (
      post_owner_id,
      CASE WHEN NEW.parent_id IS NULL THEN 'comment' ELSE 'reply' END,
      'New comment on your post',
      LEFT(NEW.content, 100),
      '/post/' || NEW.post_id,
      NEW.user_id,
      NEW.post_id
    );
  END IF;
  
  -- If this is a reply, notify parent comment owner
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO parent_comment_owner_id FROM comments WHERE id = NEW.parent_id;
    IF parent_comment_owner_id IS NOT NULL AND parent_comment_owner_id != NEW.user_id THEN
      INSERT INTO notifications (user_id, type, title, message, link, actor_id, post_id)
      VALUES (
        parent_comment_owner_id,
        'reply',
        'Someone replied to your comment',
        LEFT(NEW.content, 100),
        '/post/' || NEW.post_id,
        NEW.user_id,
        NEW.post_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_on_comment ON comments;
CREATE TRIGGER trigger_notify_on_comment
AFTER INSERT ON comments
FOR EACH ROW EXECUTE FUNCTION notify_on_comment();

-- Trigger for notifications on votes
CREATE OR REPLACE FUNCTION notify_on_vote()
RETURNS TRIGGER AS $$
DECLARE
  post_owner_id UUID;
BEGIN
  SELECT user_id INTO post_owner_id FROM posts WHERE id = NEW.post_id;
  
  -- Only notify on upvotes and if voter is different from post owner
  IF NEW.vote_type = 'up' AND post_owner_id IS NOT NULL AND post_owner_id != NEW.user_id THEN
    INSERT INTO notifications (user_id, type, title, message, link, actor_id, post_id)
    VALUES (
      post_owner_id,
      'vote',
      'Someone upvoted your post',
      NULL,
      '/post/' || NEW.post_id,
      NEW.user_id,
      NEW.post_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_on_vote ON votes;
CREATE TRIGGER trigger_notify_on_vote
AFTER INSERT ON votes
FOR EACH ROW EXECUTE FUNCTION notify_on_vote();

-- ============================================
-- 10. INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_priority ON posts(priority);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_companies_name_lower ON companies(LOWER(name));

-- Complete!
SELECT 'Migration completed successfully!' as status;
