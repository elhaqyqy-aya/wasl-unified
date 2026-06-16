import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function today() { return new Date().toISOString().slice(0, 10); }

export const checkInOut = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ action: z.enum(["in", "out"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const day = today();
    const now = new Date().toISOString();
    const { data: existing } = await supabase.from("presence")
      .select("*").eq("employee_id", userId).eq("day", day).maybeSingle();
    if (data.action === "in") {
      if (existing?.check_in) return { presence: existing, alreadyIn: true };
      const payload = existing
        ? await supabase.from("presence").update({ check_in: now }).eq("id", existing.id).select("*").single()
        : await supabase.from("presence").insert({ employee_id: userId, day, check_in: now, source: "biometric", method: "badge", device_id: "WEB-MOCK" }).select("*").single();
      if (payload.error) throw new Error(payload.error.message);
      return { presence: payload.data };
    } else {
      if (!existing) throw new Error("No check-in recorded today");
      const { data: row, error } = await supabase.from("presence").update({ check_out: now }).eq("id", existing.id).select("*").single();
      if (error) throw new Error(error.message);
      return { presence: row };
    }
  });

export const listMyPresence = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const { data, error } = await context.supabase.from("presence")
      .select("*").eq("employee_id", context.userId).gte("day", since)
      .order("day", { ascending: false });
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

export const listAllPresence = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const since = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
    const { data, error } = await context.supabase.from("presence")
      .select("*, employee:profiles!presence_employee_id_fkey(id,full_name,department)")
      .gte("day", since).order("day", { ascending: false }).limit(500);
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });