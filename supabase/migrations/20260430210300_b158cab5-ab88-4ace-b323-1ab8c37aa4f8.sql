ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS home_state text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS home_city text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS home_vertical text NOT NULL DEFAULT 'all',
  ADD COLUMN IF NOT EXISTS weekly_goal_outreach integer NOT NULL DEFAULT 25,
  ADD COLUMN IF NOT EXISTS weekly_goal_meetings integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS weekly_goal_pipeline integer NOT NULL DEFAULT 100000,
  ADD COLUMN IF NOT EXISTS last_scan_at timestamp with time zone;