DROP POLICY IF EXISTS "Authenticated users can update snapshots" ON public.bdr_snapshots;

CREATE POLICY "Refreshers can update their snapshots"
ON public.bdr_snapshots FOR UPDATE
TO authenticated
USING (auth.uid() = refreshed_by)
WITH CHECK (auth.uid() = refreshed_by);