
-- 1. Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'bdr');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "Users can read their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Link bdr_profiles to auth.users
ALTER TABLE public.bdr_profiles
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS bdr_profiles_user_id_uniq
  ON public.bdr_profiles(user_id) WHERE user_id IS NOT NULL;

-- 3. Lock down opportunities
DROP POLICY IF EXISTS "Anyone can read opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Anyone can insert opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Anyone can update opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Anyone can delete opportunities" ON public.opportunities;

CREATE POLICY "Authenticated read opportunities"
ON public.opportunities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated insert opportunities"
ON public.opportunities FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update opportunities"
ON public.opportunities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins delete opportunities"
ON public.opportunities FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Lock down bdr_snapshots
DROP POLICY IF EXISTS "Anyone can read snapshots" ON public.bdr_snapshots;
DROP POLICY IF EXISTS "Anyone can insert snapshots" ON public.bdr_snapshots;
DROP POLICY IF EXISTS "Anyone can update snapshots" ON public.bdr_snapshots;

CREATE POLICY "Authenticated read snapshots"
ON public.bdr_snapshots FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated insert snapshots"
ON public.bdr_snapshots FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update snapshots"
ON public.bdr_snapshots FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins delete snapshots"
ON public.bdr_snapshots FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Lock down bdr_mindsets (proactive — same vulnerability)
DROP POLICY IF EXISTS "Anyone can read bdr_mindsets" ON public.bdr_mindsets;
DROP POLICY IF EXISTS "Anyone can insert bdr_mindsets" ON public.bdr_mindsets;
DROP POLICY IF EXISTS "Anyone can update bdr_mindsets" ON public.bdr_mindsets;
DROP POLICY IF EXISTS "Anyone can delete bdr_mindsets" ON public.bdr_mindsets;

CREATE POLICY "Authenticated read mindsets"
ON public.bdr_mindsets FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins write mindsets"
ON public.bdr_mindsets FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Lock down bdr_profiles (proactive — same vulnerability)
DROP POLICY IF EXISTS "Anyone can read bdr_profiles" ON public.bdr_profiles;
DROP POLICY IF EXISTS "Anyone can insert bdr_profiles" ON public.bdr_profiles;
DROP POLICY IF EXISTS "Anyone can update bdr_profiles" ON public.bdr_profiles;
DROP POLICY IF EXISTS "Anyone can delete bdr_profiles" ON public.bdr_profiles;

CREATE POLICY "Authenticated read bdr profiles"
ON public.bdr_profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users update own bdr profile"
ON public.bdr_profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage bdr profiles"
ON public.bdr_profiles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
