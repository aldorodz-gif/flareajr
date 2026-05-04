CREATE TABLE public.bdr_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bdr_id TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  source_filename TEXT,
  refreshed_by UUID,
  refreshed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bdr_snapshots ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read the latest snapshot (shared view of the team)
CREATE POLICY "Authenticated users can read snapshots"
ON public.bdr_snapshots FOR SELECT
TO authenticated
USING (true);

-- Any authenticated user can upsert (refresh)
CREATE POLICY "Authenticated users can insert snapshots"
ON public.bdr_snapshots FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = refreshed_by);

CREATE POLICY "Authenticated users can update snapshots"
ON public.bdr_snapshots FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (auth.uid() = refreshed_by);