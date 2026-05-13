-- Mindset library: a global row (bdr_id NULL) applies to all BDRs;
-- per-BDR rows layer on top.
CREATE TABLE public.bdr_mindsets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bdr_id UUID NULL REFERENCES public.bdr_profiles(id) ON DELETE CASCADE,
  scope TEXT NOT NULL DEFAULT 'global', -- 'global' | 'bdr'
  label TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bdr_mindsets_bdr ON public.bdr_mindsets(bdr_id);
CREATE INDEX idx_bdr_mindsets_scope ON public.bdr_mindsets(scope);

ALTER TABLE public.bdr_mindsets ENABLE ROW LEVEL SECURITY;

-- Mirrors bdr_profiles: app-wide read/write for now.
CREATE POLICY "Anyone can read bdr_mindsets" ON public.bdr_mindsets FOR SELECT USING (true);
CREATE POLICY "Anyone can insert bdr_mindsets" ON public.bdr_mindsets FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update bdr_mindsets" ON public.bdr_mindsets FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete bdr_mindsets" ON public.bdr_mindsets FOR DELETE USING (true);

CREATE TRIGGER update_bdr_mindsets_updated_at
BEFORE UPDATE ON public.bdr_mindsets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();