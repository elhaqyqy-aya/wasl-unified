import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listKbArticles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("kb_articles")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { articles: data ?? [] };
  });

const UpsertInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2).max(200),
  category: z.string().min(2).max(50),
  tags: z.array(z.string().max(40)).max(20).default([]),
  content: z.string().min(10).max(20000),
  language: z.string().max(8).default("en"),
  audience: z.string().max(40).default("all"),
  published: z.boolean().default(true),
});

export const upsertKbArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => UpsertInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isRH } = await supabase.rpc("has_role", { _user_id: userId, _role: "rh" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isRH && !isAdmin) throw new Error("Forbidden");
    const payload = { ...data, updated_at: new Date().toISOString() };
    const q = data.id
      ? supabase.from("kb_articles").update(payload).eq("id", data.id).select("*").single()
      : supabase.from("kb_articles").insert(payload).select("*").single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);

    // Re-embed: delete old chunks + create new embedded chunks
    try {
      const { embedText, chunkText } = await import("@/lib/ai-embeddings.server");
      const key = process.env.LOVABLE_API_KEY;
      if (key && row) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("kb_chunks").delete().eq("article_id", row.id);
        const chunks = chunkText(`${row.title}\n\n${row.content}`);
        const rows: Array<{ article_id: string; chunk_index: number; content: string; embedding: string }> = [];
        for (let i = 0; i < chunks.length; i++) {
          const emb = await embedText(chunks[i], key);
          if (emb) rows.push({ article_id: row.id, chunk_index: i, content: chunks[i], embedding: `[${emb.join(",")}]` });
        }
        if (rows.length) await supabaseAdmin.from("kb_chunks").insert(rows);
      }
    } catch (e) { console.error("kb re-embed failed", e); }

    return { article: row };
  });

export const deleteKbArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("kb_articles").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Re-embed every published article. RH/Admin only. */
export const reindexAllKb = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isRH } = await supabase.rpc("has_role", { _user_id: userId, _role: "rh" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isRH && !isAdmin) throw new Error("Forbidden");
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI key missing");
    const { embedText, chunkText } = await import("@/lib/ai-embeddings.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: arts } = await supabaseAdmin.from("kb_articles").select("id,title,content,published");
    if (!arts) return { embedded: 0, articles: 0 };
    let totalChunks = 0;
    for (const a of arts as Array<{ id: string; title: string; content: string; published: boolean }>) {
      await supabaseAdmin.from("kb_chunks").delete().eq("article_id", a.id);
      if (!a.published) continue;
      const chunks = chunkText(`${a.title}\n\n${a.content}`);
      const rows: Array<{ article_id: string; chunk_index: number; content: string; embedding: string }> = [];
      for (let i = 0; i < chunks.length; i++) {
        const emb = await embedText(chunks[i], key);
        if (emb) rows.push({ article_id: a.id, chunk_index: i, content: chunks[i], embedding: `[${emb.join(",")}]` });
      }
      if (rows.length) await supabaseAdmin.from("kb_chunks").insert(rows);
      totalChunks += rows.length;
    }
    return { embedded: totalChunks, articles: arts.length };
  });