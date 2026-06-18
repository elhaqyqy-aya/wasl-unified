import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listMyNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("notifications")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid().optional(), all: z.boolean().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    let q = context.supabase.from("notifications").update({ read: true }).eq("user_id", context.userId);
    if (data.id && !data.all) q = q.eq("id", data.id);
    else q = q.eq("read", false);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const createNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    user_id: z.string().uuid(),
    title: z.string().min(1).max(200),
    body: z.string().max(500).optional(),
    kind: z.enum(["info", "warn", "ok"]).default("info"),
    link: z.string().max(300).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("notifications").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const seedMyNotificationsIfEmpty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { count } = await context.supabase
      .from("notifications").select("id", { count: "exact", head: true })
      .eq("user_id", context.userId);
    if ((count ?? 0) > 0) return { seeded: 0 };
    const seed = [
      { user_id: context.userId, title: "Welcome to Wasl", body: "Your HR cockpit is ready. Try the AI assistant.", kind: "ok" as const },
      { user_id: context.userId, title: "Tip: anonymous QVT signals", body: "Risk alerts use pseudonyms to protect employees (GDPR).", kind: "info" as const },
    ];
    await context.supabase.from("notifications").insert(seed);
    return { seeded: seed.length };
  });