
CREATE TABLE public.bdr_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  markets TEXT[] NOT NULL DEFAULT '{}',
  inventory_locations JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_verticals TEXT[] NOT NULL DEFAULT '{}',
  excluded_markets TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bdr_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read bdr_profiles" ON public.bdr_profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert bdr_profiles" ON public.bdr_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update bdr_profiles" ON public.bdr_profiles FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete bdr_profiles" ON public.bdr_profiles FOR DELETE USING (true);

CREATE TRIGGER update_bdr_profiles_updated_at
BEFORE UPDATE ON public.bdr_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  market TEXT,
  project TEXT,
  vertical TEXT,
  signal_type TEXT,
  description TEXT,
  why_it_matters TEXT,
  estimated_stay TEXT,
  discovery_score INTEGER NOT NULL DEFAULT 0,
  housing_fit_score INTEGER NOT NULL DEFAULT 0,
  confidence_score INTEGER NOT NULL DEFAULT 0,
  priority TEXT,
  review_status TEXT,
  confidence_label TEXT,
  suggested_contacts TEXT[] DEFAULT '{}',
  pitch_angle TEXT,
  key_talking_points TEXT[] DEFAULT '{}',
  nearest_inventory TEXT,
  distance_to_inventory NUMERIC,
  near_core_inventory BOOLEAN DEFAULT false,
  source_url TEXT,
  source_type TEXT,
  date_found TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_verified TIMESTAMPTZ NOT NULL DEFAULT now(),
  assigned_bdr UUID REFERENCES public.bdr_profiles(id) ON DELETE SET NULL,
  saved_by_bdr UUID REFERENCES public.bdr_profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Anyone can insert opportunities" ON public.opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update opportunities" ON public.opportunities FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete opportunities" ON public.opportunities FOR DELETE USING (true);

CREATE TRIGGER update_opportunities_updated_at
BEFORE UPDATE ON public.opportunities
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_opportunities_assigned_bdr ON public.opportunities(assigned_bdr);
CREATE INDEX idx_opportunities_saved_by_bdr ON public.opportunities(saved_by_bdr);
CREATE INDEX idx_opportunities_status ON public.opportunities(status);
CREATE INDEX idx_opportunities_market ON public.opportunities(market);
CREATE INDEX idx_opportunities_dedupe ON public.opportunities(company, market, project);
