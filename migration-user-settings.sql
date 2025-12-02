-- Create user_settings table for privacy and notification preferences
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  privacy_settings JSONB DEFAULT '{"profileVisibility": true, "showActivity": true, "allowMessages": true}'::jsonb,
  notification_settings JSONB DEFAULT '{"emailNotifications": true, "projectUpdates": true, "newFollowers": true, "messages": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Only allow users to read/write their own settings
CREATE POLICY user_settings_select ON user_settings
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY user_settings_insert ON user_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY user_settings_update ON user_settings
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY user_settings_delete ON user_settings
  FOR DELETE USING (user_id = auth.uid());

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();
