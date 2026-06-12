
CREATE TABLE public.signal_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL UNIQUE,
  label text NOT NULL,
  category text NOT NULL CHECK (category IN ('news','permits','business_journal','industry','govt')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.signal_sources TO authenticated;
GRANT ALL ON public.signal_sources TO service_role;

ALTER TABLE public.signal_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read signal sources"
  ON public.signal_sources FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins can insert signal sources"
  ON public.signal_sources FOR INSERT
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update signal sources"
  ON public.signal_sources FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete signal sources"
  ON public.signal_sources FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.signal_sources (domain, label, category) VALUES
  ('bisnow.com', 'Bisnow', 'news'),
  ('bizjournals.com', 'American City Business Journals', 'business_journal'),
  ('enr.com', 'Engineering News-Record', 'industry'),
  ('constructiondive.com', 'Construction Dive', 'industry'),
  ('commercialobserver.com', 'Commercial Observer', 'news'),
  ('therealdeal.com', 'The Real Deal', 'news'),
  ('costar.com', 'CoStar', 'industry'),
  ('areadevelopment.com', 'Area Development', 'industry'),
  ('governing.com', 'Governing', 'govt'),
  ('datacenterdynamics.com', 'Data Center Dynamics', 'industry'),
  ('datacenterknowledge.com', 'Data Center Knowledge', 'industry'),
  ('beckershospitalreview.com', 'Becker''s Hospital Review', 'industry'),
  ('highereddive.com', 'Higher Ed Dive', 'industry'),
  ('defensenews.com', 'Defense News', 'industry'),
  ('manufacturingdive.com', 'Manufacturing Dive', 'industry'),
  ('utilitydive.com', 'Utility Dive', 'industry')
ON CONFLICT (domain) DO NOTHING;
