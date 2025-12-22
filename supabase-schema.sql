-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Bug Report', 'Feature Request', 'Complaint', 'App Review Request')),
  company TEXT NOT NULL,
  company_color TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  votes INTEGER DEFAULT 0,
  app_id UUID REFERENCES apps(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create connections/follow table
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Create apps/software table
CREATE TABLE apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  app_url TEXT,
  logo_url TEXT,
  category TEXT NOT NULL,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create app reviews table
CREATE TABLE app_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(app_id, user_id)
);

-- Create votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create indexes
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_votes ON posts(votes DESC);
CREATE INDEX idx_posts_company ON posts(company);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_votes_post_id ON votes(post_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_connections_follower ON connections(follower_id);
CREATE INDEX idx_connections_following ON connections(following_id);
CREATE INDEX idx_apps_user_id ON apps(user_id);
CREATE INDEX idx_app_reviews_app_id ON app_reviews(app_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_display_name ON users(display_name);

-- Enable Row Level Security (Optional - can be disabled for simpler setup)
-- Note: Since we're using custom auth (not Supabase Auth), RLS policies won't work as expected
-- You can either:
-- 1. Keep RLS disabled for development (comment out the ALTER TABLE commands below)
-- 2. Use service role key in your app (not recommended for production)
-- 3. Migrate to Supabase Auth later for proper RLS

-- Uncomment these lines if you want to enable RLS (requires Supabase Auth):
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies (only work with Supabase Auth)
-- Keeping these commented out since we're using custom auth
-- Uncomment if you migrate to Supabase Auth later

-- CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
-- CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
-- CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
-- CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
-- CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid()::text = user_id::text);
-- CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid()::text = user_id::text);
-- CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
-- CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
-- CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid()::text = user_id::text);
-- CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid()::text = user_id::text);
-- CREATE POLICY "Anyone can view votes" ON votes FOR SELECT USING (true);
-- CREATE POLICY "Authenticated users can create votes" ON votes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
-- CREATE POLICY "Users can update own votes" ON votes FOR UPDATE USING (auth.uid()::text = user_id::text);
-- CREATE POLICY "Users can delete own votes" ON votes FOR DELETE USING (auth.uid()::text = user_id::text);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
