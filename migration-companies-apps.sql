-- Migration for Company Pages and App Pages with Image Support

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  category TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update apps table to link to companies
ALTER TABLE apps ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Update users table for profile pictures
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create company_members table (for managing company pages)
CREATE TABLE IF NOT EXISTS company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_apps_company ON apps(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_company ON company_members(company_id);
CREATE INDEX IF NOT EXISTS idx_company_members_user ON company_members(user_id);

-- Add trigger for companies updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert popular companies with logos
INSERT INTO companies (name, display_name, description, logo_url, category) VALUES
  ('twitter', 'X (Twitter)', 'Social media platform for sharing thoughts and updates', 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png', 'Social'),
  ('instagram', 'Instagram', 'Photo and video sharing social networking service', 'https://static.cdninstagram.com/rsrc.php/v3/yt/r/30PrGfR3xhB.png', 'Social'),
  ('facebook', 'Facebook', 'Social media and social networking service', 'https://static.xx.fbcdn.net/rsrc.php/y8/r/dF5SId3UHWd.svg', 'Social'),
  ('whatsapp', 'WhatsApp', 'Messaging and voice over IP service', 'https://static.whatsapp.net/rsrc.php/v3/yz/r/ujTY9i_Jhs1.png', 'Communication'),
  ('discord', 'Discord', 'Voice, video, and text communication platform', 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png', 'Communication'),
  ('spotify', 'Spotify', 'Audio streaming and media services provider', 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png', 'Music'),
  ('snapchat', 'Snapchat', 'Multimedia messaging app', 'https://upload.wikimedia.org/wikipedia/en/c/c4/Snapchat_logo.svg', 'Social'),
  ('tiktok', 'TikTok', 'Short-form video hosting service', 'https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png', 'Entertainment'),
  ('youtube', 'YouTube', 'Online video sharing and social media platform', 'https://www.youtube.com/s/desktop/f506bd45/img/favicon_144x144.png', 'Entertainment'),
  ('netflix', 'Netflix', 'Streaming service for movies and TV shows', 'https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.png', 'Entertainment')
ON CONFLICT (name) DO NOTHING;
