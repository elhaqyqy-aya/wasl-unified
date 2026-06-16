REVOKE EXECUTE ON FUNCTION public.compute_risk_alerts() FROM PUBLIC, authenticated, anon;
GRANT EXECUTE ON FUNCTION public.compute_risk_alerts() TO service_role;