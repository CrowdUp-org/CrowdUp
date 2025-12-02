-- Add follow functionality for companies and apps

-- Company follows table
CREATE TABLE IF NOT EXISTS public.company_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- App follows table  
CREATE TABLE IF NOT EXISTS public.app_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES public.apps(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

-- Add follower count columns
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;
ALTER TABLE public.apps ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_company_follows_user ON public.company_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_company_follows_company ON public.company_follows(company_id);
CREATE INDEX IF NOT EXISTS idx_app_follows_user ON public.app_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_app_follows_app ON public.app_follows(app_id);

-- Enable Row Level Security for company_follows
ALTER TABLE public.company_follows ENABLE ROW LEVEL SECURITY;

-- Users can only see their own follows
CREATE POLICY company_follows_select ON public.company_follows
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY company_follows_insert ON public.company_follows
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY company_follows_delete ON public.company_follows
  FOR DELETE USING (user_id = auth.uid());

-- Enable Row Level Security for app_follows
ALTER TABLE public.app_follows ENABLE ROW LEVEL SECURITY;

-- Users can only see their own follows
CREATE POLICY app_follows_select ON public.app_follows
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY app_follows_insert ON public.app_follows
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY app_follows_delete ON public.app_follows
  FOR DELETE USING (user_id = auth.uid());
