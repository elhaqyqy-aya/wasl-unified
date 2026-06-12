
-- 1. Documents approval workflow
DO $$ BEGIN
  CREATE TYPE document_status AS ENUM ('pending','approved','rejected','draft');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS status document_status NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS requested_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS body text;

-- 2. Knowledge base for AI assistant grounding
CREATE TABLE IF NOT EXISTS public.kb_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'policy',
  tags text[] NOT NULL DEFAULT '{}',
  content text NOT NULL,
  language text NOT NULL DEFAULT 'en',
  audience text NOT NULL DEFAULT 'all',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.kb_articles TO authenticated;
GRANT ALL ON public.kb_articles TO service_role;
ALTER TABLE public.kb_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read published kb" ON public.kb_articles FOR SELECT TO authenticated
  USING (published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'rh'));
CREATE POLICY "rh manage kb" ON public.kb_articles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'rh'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'rh'));

-- 3. Offboarding
DO $$ BEGIN
  CREATE TYPE offboarding_status AS ENUM ('in_progress','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.offboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status offboarding_status NOT NULL DEFAULT 'in_progress',
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_step text,
  knowledge_transfer text,
  departure_date date,
  started_at date DEFAULT CURRENT_DATE,
  completed_at date,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.offboarding TO authenticated;
GRANT ALL ON public.offboarding TO service_role;
ALTER TABLE public.offboarding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "offboarding access" ON public.offboarding FOR ALL TO authenticated
  USING (employee_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'rh') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (employee_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'rh'));

-- 4. QVT risk computation
CREATE OR REPLACE FUNCTION public.compute_risk_alerts()
RETURNS TABLE(inserted int)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r record;
  ins int := 0;
  recent_abs int;
  avg_eng numeric;
  trend numeric;
BEGIN
  FOR r IN SELECT id, full_name FROM public.profiles LOOP
    SELECT COUNT(*) INTO recent_abs FROM public.absences
      WHERE employee_id = r.id AND start_date > (CURRENT_DATE - INTERVAL '30 days');
    SELECT AVG(score) INTO avg_eng FROM public.engagement
      WHERE employee_id = r.id AND measured_at > (CURRENT_DATE - INTERVAL '30 days');
    SELECT (COALESCE(AVG(score) FILTER (WHERE measured_at > CURRENT_DATE - INTERVAL '14 days'),0)
          - COALESCE(AVG(score) FILTER (WHERE measured_at BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE - INTERVAL '15 days'),0))
      INTO trend FROM public.engagement WHERE employee_id = r.id;

    IF recent_abs >= 3 AND COALESCE(avg_eng, 100) < 55 THEN
      INSERT INTO public.alerts (target_id, severity, title, description)
      SELECT r.id, 'high', 'Burnout risk detected',
        'Cross-signal: '||recent_abs||' absences in 30d, engagement avg '||ROUND(COALESCE(avg_eng,0))||'/100.'
      WHERE NOT EXISTS (SELECT 1 FROM public.alerts WHERE target_id=r.id AND title='Burnout risk detected' AND created_at > now() - INTERVAL '14 days');
      ins := ins + 1;
    ELSIF trend < -10 THEN
      INSERT INTO public.alerts (target_id, severity, title, description)
      SELECT r.id, 'medium', 'Engagement decline',
        'Engagement dropped '||ROUND(ABS(trend))||' points in 2 weeks.'
      WHERE NOT EXISTS (SELECT 1 FROM public.alerts WHERE target_id=r.id AND title='Engagement decline' AND created_at > now() - INTERVAL '14 days');
      ins := ins + 1;
    END IF;
  END LOOP;
  RETURN QUERY SELECT ins;
END $$;

GRANT EXECUTE ON FUNCTION public.compute_risk_alerts() TO authenticated;

-- Seed a few KB articles so RAG has content immediately
INSERT INTO public.kb_articles (title, category, tags, content, language, audience) VALUES
('Leave policy', 'policy', ARRAY['leave','vacation','time-off'], 'Full-time collaborators are entitled to 25 paid leave days per calendar year, accrued monthly. Requests must be submitted via the Documents > Leave request workflow at least 7 days in advance, except for emergencies. Manager approval is required; HR validates compliance. Unused days carry over up to 5 days into the next year.', 'en', 'all'),
('Remote-work policy', 'policy', ARRAY['remote','telework','hybrid'], 'Hybrid model: up to 3 remote days per week, subject to manager agreement and role compatibility. Full remote requires an exceptional request through the Remote-work request document. Collaborators must maintain a quiet, secure workspace and respect core hours 10:00–16:00.', 'en', 'all'),
('Salary certificate procedure', 'procedure', ARRAY['certificate','salary','document'], 'You can generate a salary certificate at any time from Documents > Generate. HR reviews the request and either approves it (the document becomes downloadable as a Wasl-branded PDF) or rejects it with a reason. Approval typically takes under 24h on business days.', 'en', 'all'),
('Internal mobility', 'policy', ARRAY['mobility','career','transfer'], 'Internal openings are published on the Career portal. Collaborators with 12+ months tenure can apply. The current manager is informed once the candidate reaches the second interview. Transfers are coordinated by HR over a 4–8 week transition.', 'en', 'all'),
('Onboarding 30/60/90', 'procedure', ARRAY['onboarding','first day'], 'Week 1: meet your team, finalise IT setup, read the culture handbook. Week 2: shadow a senior peer, complete security training, ship first deliverable. Month 2: cross-team intro, pick a buddy. Month 3: 90-day feedback, set first OKRs with your manager.', 'en', 'all'),
('Data privacy & GDPR', 'compliance', ARRAY['gdpr','privacy','data'], 'Personal data is processed only for legitimate HR purposes. Collaborators have the right to access, rectify, and request erasure of their data. AI assistant conversations are anonymised before being stored in audit logs. Requests: dpo@wasl.example.', 'en', 'all')
ON CONFLICT DO NOTHING;
