DROP POLICY IF EXISTS "esc self insert" ON public.ai_escalations;
CREATE POLICY "esc self insert" ON public.ai_escalations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'rh') OR public.has_role(auth.uid(),'admin'));