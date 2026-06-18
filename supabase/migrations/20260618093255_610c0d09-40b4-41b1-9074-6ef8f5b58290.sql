
REVOKE EXECUTE ON FUNCTION public.match_kb_chunks(vector, int) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.match_kb_chunks(vector, int) TO authenticated, service_role;
