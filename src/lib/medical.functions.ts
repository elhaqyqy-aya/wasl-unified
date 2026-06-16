import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMedicalSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isRH } = await supabase.rpc("has_role", { _user_id: userId, _role: "rh" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    const { data: isMgr } = await supabase.rpc("has_role", { _user_id: userId, _role: "manager" });
    if (!isRH && !isAdmin && !isMgr) throw new Error("Forbidden");

    const since = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
    const [abs, eng, alertsRow, esc] = await Promise.all([
      supabase.from("absences").select("type,start_date,end_date,employee_id").gte("start_date", since),
      supabase.from("engagement").select("score,measured_at,pulse_note,employee_id").gte("measured_at", since),
      supabase.from("alerts").select("id,title,severity,created_at,acknowledged,target_id,description").order("created_at", { ascending: false }).limit(30),
      supabase.from("ai_escalations").select("id,topic,status,created_at,prompt_excerpt").order("created_at", { ascending: false }).limit(20),
    ]);

    const sickDays = (abs.data ?? []).filter((a) => a.type === "sick")
      .reduce((sum, a) => {
        const ms = new Date(a.end_date).getTime() - new Date(a.start_date).getTime();
        return sum + Math.max(1, Math.round(ms / 86400000) + 1);
      }, 0);
    const scores = (eng.data ?? []).map((r) => r.score);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const low = scores.filter((s) => s < 55).length;

    // Burnout signal: employees with ≥3 absences and avg engagement <55 in window
    const absByEmp = new Map<string, number>();
    (abs.data ?? []).forEach((a) => absByEmp.set(a.employee_id, (absByEmp.get(a.employee_id) ?? 0) + 1));
    const engByEmp = new Map<string, number[]>();
    (eng.data ?? []).forEach((e) => {
      const arr = engByEmp.get(e.employee_id) ?? []; arr.push(e.score); engByEmp.set(e.employee_id, arr);
    });
    const burnoutCandidates = Array.from(absByEmp.entries()).filter(([id, n]) => {
      const s = engByEmp.get(id) ?? [];
      const a = s.length ? s.reduce((x, y) => x + y, 0) / s.length : 100;
      return n >= 3 && a < 55;
    }).length;

    return {
      sickDays,
      totalAbsences: abs.data?.length ?? 0,
      avgEngagement: avg,
      lowEngagementPulses: low,
      burnoutCandidates,
      escalations: esc.data ?? [],
      recentAlerts: alertsRow.data ?? [],
    };
  });