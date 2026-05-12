ALTER TABLE public.pipeline_items
  ADD COLUMN IF NOT EXISTS connection_type text,
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS meeting_booked_at timestamptz,
  ADD COLUMN IF NOT EXISTS meeting_type text;