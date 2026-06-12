
-- API usage log
CREATE TABLE public.api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL,
  function_name TEXT,
  calls INTEGER NOT NULL DEFAULT 1,
  success BOOLEAN NOT NULL,
  error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.api_usage TO authenticated;
GRANT ALL ON public.api_usage TO service_role;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read api_usage" ON public.api_usage FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE INDEX idx_api_usage_created ON public.api_usage(created_at DESC);
CREATE INDEX idx_api_usage_service_created ON public.api_usage(service, created_at DESC);

-- Scan runs summary
CREATE TABLE public.scan_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ran_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  bdrs_scanned INTEGER NOT NULL DEFAULT 0,
  leads_inserted INTEGER NOT NULL DEFAULT 0,
  errors INTEGER NOT NULL DEFAULT 0,
  details JSONB
);
GRANT SELECT ON public.scan_runs TO authenticated;
GRANT ALL ON public.scan_runs TO service_role;
ALTER TABLE public.scan_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read scan_runs" ON public.scan_runs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_scan_runs_ran_at ON public.scan_runs(ran_at DESC);

-- Editable system settings (key/value)
CREATE TABLE public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.system_settings TO authenticated;
GRANT ALL ON public.system_settings TO service_role;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read system_settings" ON public.system_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins write system_settings" ON public.system_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.system_settings (key, value) VALUES ('tavily_monthly_limit', '1000'::jsonb) ON CONFLICT (key) DO NOTHING;
