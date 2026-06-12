import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* ─── ONBOARDING ─── */

export const getMyOnboarding = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("onboarding")
      .select("*")
      .eq("employee_id", userId)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    // Bootstrap a row if missing so the UI always has something
    if (!data) {
      const { data: created } = await supabase
        .from("onboarding")
        .insert({ employee_id: userId, status: "in_progress", progress: 10, current_step: "Welcome & accounts" })
        .select("*")
        .single();
      return { onboarding: created };
    }
    return { onboarding: data };
  });

export const advanceOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), progress: z.number().int().min(0).max(100), current_step: z.string().max(120).optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const patch: { progress: number; current_step?: string; status?: "completed"; completed_at?: string } = { progress: data.progress };
    if (data.current_step) patch.current_step = data.current_step;
    if (data.progress >= 100) { patch.status = "completed"; patch.completed_at = new Date().toISOString().slice(0, 10); }
    const { data: row, error } = await context.supabase.from("onboarding").update(patch).eq("id", data.id).select("*").single();
    if (error) throw new Error(error.message);
    return { onboarding: row };
  });

export const listOnboardings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("onboarding")
      .select("*, employee:profiles!onboarding_employee_id_fkey(id,full_name,email,position)")
      .order("started_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

/* ─── OFFBOARDING ─── */

export const getMyOffboarding = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("offboarding")
      .select("*")
      .eq("employee_id", context.userId)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { offboarding: data };
  });

export const startOffboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ departure_date: z.string().optional(), targetUserId: z.string().uuid().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let employee = userId;
    if (data.targetUserId && data.targetUserId !== userId) {
      const { data: isRH } = await supabase.rpc("has_role", { _user_id: userId, _role: "rh" });
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
      if (!isRH && !isAdmin) throw new Error("Forbidden");
      employee = data.targetUserId;
    }
    const { data: row, error } = await supabase
      .from("offboarding")
      .insert({ employee_id: employee, departure_date: data.departure_date ?? null, current_step: "Initial notice", progress: 5 })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { offboarding: row };
  });

export const updateOffboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid(),
    progress: z.number().int().min(0).max(100).optional(),
    current_step: z.string().max(120).optional(),
    knowledge_transfer: z.string().max(20000).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const patch: { progress?: number; current_step?: string; knowledge_transfer?: string; status?: "completed"; completed_at?: string } = { ...rest };
    if (patch.progress === 100) { patch.status = "completed"; patch.completed_at = new Date().toISOString().slice(0, 10); }
    const { data: row, error } = await context.supabase.from("offboarding").update(patch).eq("id", id).select("*").single();
    if (error) throw new Error(error.message);
    return { offboarding: row };
  });

/* ─── QVT (risk computation) ─── */

export const runRiskScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;
    const { data: isMgr } = await supabase.rpc("has_role", { _user_id: userId, _role: "manager" });
    const { data: isRH } = await supabase.rpc("has_role", { _user_id: userId, _role: "rh" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isMgr && !isRH && !isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.rpc("compute_risk_alerts");
    if (error) throw new Error(error.message);
    return { inserted: (data as any)?.[0]?.inserted ?? 0 };
  });

export const getQvtSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const [abs, eng, alertsRow] = await Promise.all([
      supabase.from("absences").select("employee_id,start_date,end_date,type").gte("start_date", since),
      supabase.from("engagement").select("employee_id,score,measured_at").gte("measured_at", since),
      supabase.from("alerts").select("id,title,severity,target_id,created_at,acknowledged").order("created_at", { ascending: false }).limit(20),
    ]);
    const scores = (eng.data ?? []).map((r) => r.score);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const absentByEmp = new Map<string, number>();
    (abs.data ?? []).forEach((a) => absentByEmp.set(a.employee_id, (absentByEmp.get(a.employee_id) ?? 0) + 1));
    const atRisk = Array.from(absentByEmp.entries()).filter(([, n]) => n >= 3).length;
    return {
      avgEngagement: avg,
      totalAbsences: abs.data?.length ?? 0,
      atRiskCount: atRisk,
      activeAlerts: (alertsRow.data ?? []).filter((a) => !a.acknowledged).length,
      recentAlerts: alertsRow.data ?? [],
    };
  });