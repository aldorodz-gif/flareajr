
CREATE TABLE public.lead_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NULL REFERENCES public.opportunities(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  bdr_id UUID NOT NULL REFERENCES public.bdr_profiles(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('up','down')),
  reason TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_feedback_bdr_created ON public.lead_feedback(bdr_id, created_at DESC);
CREATE INDEX idx_lead_feedback_company ON public.lead_feedback(bdr_id, lower(company_name));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lead_feedback TO authenticated;
GRANT ALL ON public.lead_feedback TO service_role;

ALTER TABLE public.lead_feedback ENABLE ROW LEVEL SECURITY;

-- Admins: full access
CREATE POLICY "Admins manage all feedback" ON public.lead_feedback
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- BDRs: only feedback tied to their own linked bdr_profile
CREATE POLICY "BDRs read own feedback" ON public.lead_feedback
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.bdr_profiles bp
      WHERE bp.id = lead_feedback.bdr_id AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "BDRs insert own feedback" ON public.lead_feedback
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bdr_profiles bp
      WHERE bp.id = lead_feedback.bdr_id AND bp.user_id = auth.uid()
    )
  );
