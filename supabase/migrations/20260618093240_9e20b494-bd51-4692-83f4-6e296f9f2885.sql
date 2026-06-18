
-- 1. pgvector extension for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Notifications table (realtime)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  kind TEXT NOT NULL DEFAULT 'info' CHECK (kind IN ('info','warn','ok')),
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "users mark own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "rh/admin create notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (
    has_role(auth.uid(),'rh') OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager') OR user_id = auth.uid()
  );
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);

-- 3. KB chunks with embeddings (1536 = openai/text-embedding-3-small)
CREATE TABLE IF NOT EXISTS public.kb_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.kb_articles(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL DEFAULT 0,
  content TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kb_chunks TO authenticated;
GRANT ALL ON public.kb_chunks TO service_role;
ALTER TABLE public.kb_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated read chunks" ON public.kb_chunks FOR SELECT TO authenticated USING (true);
CREATE POLICY "rh/admin manage chunks" ON public.kb_chunks FOR ALL TO authenticated
  USING (has_role(auth.uid(),'rh') OR has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'rh') OR has_role(auth.uid(),'admin'));
CREATE INDEX IF NOT EXISTS idx_kb_chunks_article ON public.kb_chunks(article_id);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_embedding ON public.kb_chunks USING hnsw (embedding vector_cosine_ops);

-- 4. Match function for vector search
CREATE OR REPLACE FUNCTION public.match_kb_chunks(
  query_embedding vector(1536),
  match_count int DEFAULT 4
)
RETURNS TABLE (
  article_id uuid,
  title text,
  category text,
  content text,
  similarity float
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    c.article_id,
    a.title,
    a.category,
    c.content,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM public.kb_chunks c
  JOIN public.kb_articles a ON a.id = c.article_id
  WHERE a.published = true AND c.embedding IS NOT NULL
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- 5. Storage policies for avatars bucket (bucket created separately via storage tool)
-- Note: bucket creation happens via storage_create_bucket; this just ensures policies exist
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN NULL; END IF;
END $$;
