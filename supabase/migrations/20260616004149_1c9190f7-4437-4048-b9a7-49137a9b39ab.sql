
-- 1. Extend alert_severity to support the values used by the AI guardrails + risk engine
ALTER TYPE public.alert_severity ADD VALUE IF NOT EXISTS 'low';
ALTER TYPE public.alert_severity ADD VALUE IF NOT EXISTS 'medium';
ALTER TYPE public.alert_severity ADD VALUE IF NOT EXISTS 'high';

-- 2. Presence (biometric check-in/out, mocked but schema-real)
CREATE TABLE IF NOT EXISTS public.presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'biometric',
  method TEXT NOT NULL DEFAULT 'badge',
  device_id TEXT,
  anomaly TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, day)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.presence TO authenticated;
GRANT ALL ON public.presence TO service_role;
ALTER TABLE public.presence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "presence self read" ON public.presence FOR SELECT TO authenticated
  USING (employee_id = auth.uid() OR public.has_role(auth.uid(),'rh') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "presence self insert" ON public.presence FOR INSERT TO authenticated
  WITH CHECK (employee_id = auth.uid() OR public.has_role(auth.uid(),'rh') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "presence rh update" ON public.presence FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'rh') OR public.has_role(auth.uid(),'admin'));

-- 3. AI escalations (sensitive requests routed to a human)
CREATE TABLE IF NOT EXISTS public.ai_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  role TEXT NOT NULL,
  topic TEXT NOT NULL,
  prompt_excerpt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.ai_escalations TO authenticated;
GRANT ALL ON public.ai_escalations TO service_role;
ALTER TABLE public.ai_escalations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "esc rh read" ON public.ai_escalations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'rh') OR public.has_role(auth.uid(),'admin') OR user_id = auth.uid());
CREATE POLICY "esc self insert" ON public.ai_escalations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "esc rh update" ON public.ai_escalations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'rh') OR public.has_role(auth.uid(),'admin'));

-- 4. Allow RH/manager to update absences status (approve/reject leave)
DROP POLICY IF EXISTS "absences rh update" ON public.absences;
CREATE POLICY "absences rh update" ON public.absences FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'rh') OR public.has_role(auth.uid(),'manager') OR public.has_role(auth.uid(),'admin'));
