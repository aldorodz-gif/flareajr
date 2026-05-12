ALTER TABLE public.pipeline_items
  ADD COLUMN IF NOT EXISTS last_followup_at timestamptz,
  ADD COLUMN IF NOT EXISTS followup_count integer NOT NULL DEFAULT 0;