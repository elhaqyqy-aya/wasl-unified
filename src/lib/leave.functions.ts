import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LeaveType = z.enum(["vacation", "sick", "remote", "unpaid", "training"]);

export const createLeaveRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    type: LeaveType,
    start_date: z.string().min(8).max(10),
    end_date: z.string().min(8).max(10),
    reason: z.string().max(500).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase.from("absences").insert({
      employee_id: userId,
      type: data.type,
      status: "pending",
      start_date: data.start_date,
      end_date: data.end_date,
      reason: data.reason ?? null,
    }).select("*").single();
    if (error) throw new Error(error.message);
    return { leave: row };
  });

export const listMyLeaves = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("absences")
      .select("*").eq("employee_id", context.userId)
      .order("start_date", { ascending: false }).limit(50);
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

export const listLeavesForReview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isMgr } = await supabase.rpc("has_role", { _user_id: userId, _role: "manager" });
    const { data: isRH } = await supabase.rpc("has_role", { _user_id: userId, _role: "rh" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isMgr && !isRH && !isAdmin) throw new Error("Forbidden");
    const { data, error } = await supabase.from("absences")
      .select("*, employee:profiles!absences_employee_id_fkey(id,full_name,department,position)")
      .order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error(error.message);
    return { items: data ?? [] };
  });

export const decideLeave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    id: z.string().uuid(),
    decision: z.enum(["approved", "rejected"]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isMgr } = await supabase.rpc("has_role", { _user_id: userId, _role: "manager" });
    const { data: isRH } = await supabase.rpc("has_role", { _user_id: userId, _role: "rh" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isMgr && !isRH && !isAdmin) throw new Error("Forbidden");
    const { data: row, error } = await supabase.from("absences")
      .update({ status: data.decision, approved_by: userId })
      .eq("id", data.id).select("*").single();
    if (error) throw new Error(error.message);
    await supabase.from("audit_logs").insert({
      actor_id: userId, action: `leave.${data.decision}`, entity: "absences", entity_id: data.id,
      metadata: { decision: data.decision },
    });
    return { leave: row };
  });