-- Replace permissive USING(true)/WITH CHECK(true) policies with explicit auth.uid() checks.

-- opportunities
DROP POLICY IF EXISTS "Authenticated read opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Authenticated insert opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Authenticated update opportunities" ON public.opportunities;
CREATE POLICY "Authenticated read opportunities" ON public.opportunities
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated insert opportunities" ON public.opportunities
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update opportunities" ON public.opportunities
  FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- bdr_snapshots
DROP POLICY IF EXISTS "Authenticated read snapshots" ON public.bdr_snapshots;
DROP POLICY IF EXISTS "Authenticated insert snapshots" ON public.bdr_snapshots;
DROP POLICY IF EXISTS "Authenticated update snapshots" ON public.bdr_snapshots;
CREATE POLICY "Authenticated read snapshots" ON public.bdr_snapshots
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated insert snapshots" ON public.bdr_snapshots
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated update snapshots" ON public.bdr_snapshots
  FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- bdr_mindsets and bdr_profiles select policies (qual=true) — also tighten.
DROP POLICY IF EXISTS "Authenticated read mindsets" ON public.bdr_mindsets;
CREATE POLICY "Authenticated read mindsets" ON public.bdr_mindsets
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated read bdr profiles" ON public.bdr_profiles;
CREATE POLICY "Authenticated read bdr profiles" ON public.bdr_profiles
  FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);