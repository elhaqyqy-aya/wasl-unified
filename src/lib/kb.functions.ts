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