
-- Allow anonymous read/write of BDR snapshots so the latest workbook upload
-- is shared across all browsers without requiring sign-in.
ALTER TABLE public.bdr_snapshots ALTER COLUMN refreshed_by DROP NOT NULL;

DROP POLICY IF EXISTS "Authenticated users can insert snapshots" ON public.bdr_snapshots;
DROP POLICY IF EXISTS "Authenticated users can read snapshots" ON public.bdr_snapshots;
DROP POLICY IF EXISTS "Refreshers can update their snapshots" ON public.bdr_snapshots;

CREATE POLICY "Anyone can read snapshots"
  ON public.bdr_snapshots FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert snapshots"
  ON public.bdr_snapshots FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update snapshots"
  ON public.bdr_snapshots FOR UPDATE
  TO anon, authenticated
  USING (true) WITH CHECK (true);
