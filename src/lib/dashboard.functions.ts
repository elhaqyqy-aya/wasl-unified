import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [profiles, absences, alerts, onboardings, engagement, docs] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("absences").select("id", { count: "exact", head: true }).gte("start_date", new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)),
      supabase.from("alerts").select("id", { count: "exact", head: true }).eq("acknowledged", false),
      supabase.from("onboarding").select("id", { count: "exact", head: true }).neq("status", "completed"),
      supabase.from("engagement").select("score").order("measured_at", { ascending: false }).limit(50),
      supabase.from("documents").select("id", { count: "exact", head: true }),
    ]);
    const scores = (engagement.data ?? []).map((r) => r.score);
    const avgEngagement = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return {
      headcount: profiles.count ?? 0,
      absences30d: absences.count ?? 0,
      openAlerts: alerts.count ?? 0,
      activeOnboardings: onboardings.count ?? 0,
      documents: docs.count ?? 0,
      avgEngagement,
    };
  });

export const getRecentAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("audit_logs")
      .select("id, action, actor_id, entity, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  });

export const getAlerts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("alerts")
      .select("id, title, description, severity, acknowledged, created_at, target_id")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return data ?? [];
  });

export const getTeamMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, full_name, email, department, position, location, avatar_url, hire_date")
      .order("full_name");
    if (error) throw error;
    return data ?? [];
  });