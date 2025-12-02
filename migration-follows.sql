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
