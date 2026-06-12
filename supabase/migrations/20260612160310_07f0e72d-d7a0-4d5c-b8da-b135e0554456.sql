
CREATE TABLE public.alert_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_key text NOT NULL,
  subject text,
  body text,
  recipient text,
  sent_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX alert_log_key_sent_idx ON public.alert_log(alert_key, sent_at DESC);
GRANT SELECT ON public.alert_log TO authenticated;
GRANT ALL ON public.alert_log TO service_role;
ALTER TABLE public.alert_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read alert_log" ON public.alert_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
