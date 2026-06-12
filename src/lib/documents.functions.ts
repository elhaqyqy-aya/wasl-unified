import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DOC_TYPES = ["contract", "payslip", "policy", "certificate", "id", "other"] as const;

const CreateInput = z.object({
  title: z.string().min(2).max(200),
  type: z.enum(DOC_TYPES).default("certificate"),
  body: z.string().max(5000).optional(),
  targetUserId: z.string().uuid().optional(),
  autoApprove: z.boolean().optional(),
});

export const createDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => CreateInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let owner = userId;
    const { data: isRH } = await supabase.rpc("has_role", { _user_id: userId, _role: "rh" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    const privileged = !!(isRH || isAdmin);
    if (data.targetUserId && data.targetUserId !== userId) {
      if (!privileged) throw new Error("Forbidden");
      owner = data.targetUserId;
    }
    // Smart prefill: hydrate body with profile data (name, position, hire date)
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name,email,position,department,hire_date")
      .eq("id", owner)
      .maybeSingle();
    const body = (data.body ?? "").trim();
    const filled = body
      .replaceAll("{{name}}", profile?.full_name ?? "")
      .replaceAll("{{email}}", profile?.email ?? "")
      .replaceAll("{{position}}", profile?.position ?? "—")
      .replaceAll("{{department}}", profile?.department ?? "—")
      .replaceAll("{{hire_date}}", profile?.hire_date ?? "—")
      .replaceAll("{{today}}", new Date().toLocaleDateString());
    const storage_path = `inline://${btoa(unescape(encodeURIComponent(filled))).slice(0, 4000)}`;
    const status = privileged && (data.autoApprove ?? true) ? "approved" : "pending";
    const { data: row, error } = await supabase
      .from("documents")
      .insert({
        owner_id: owner,
        type: data.type,
        title: data.title,
        storage_path,
        body: filled,
        size_bytes: filled.length,
        issued_at: new Date().toISOString().slice(0, 10),
        status,
        requested_by: userId,
        approved_by: status === "approved" ? userId : null,
        approved_at: status === "approved" ? new Date().toISOString() : null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { document: row };
  });

const ApproveInput = z.object({
  id: z.string().uuid(),
  decision: z.enum(["approve", "reject"]),
  reason: z.string().max(500).optional(),
});

export const reviewDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => ApproveInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isRH } = await supabase.rpc("has_role", { _user_id: userId, _role: "rh" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isRH && !isAdmin) throw new Error("Forbidden");
    const patch =
      data.decision === "approve"
        ? { status: "approved" as const, approved_by: userId, approved_at: new Date().toISOString(), rejection_reason: null }
        : { status: "rejected" as const, approved_by: userId, approved_at: new Date().toISOString(), rejection_reason: data.reason ?? "" };
    const { data: row, error } = await supabase.from("documents").update(patch).eq("id", data.id).select("*").single();
    if (error) throw new Error(error.message);
    return { document: row };
  });

export const listPendingDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isRH } = await supabase.rpc("has_role", { _user_id: userId, _role: "rh" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isRH && !isAdmin) throw new Error("Forbidden");
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((data ?? []).map((d) => d.owner_id)));
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, email, position")
      .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const map = new Map((profs ?? []).map((p) => [p.id, p]));
    return { documents: (data ?? []).map((d) => ({ ...d, owner: map.get(d.owner_id) ?? null })) };
  });

export const listMyDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { documents: data ?? [] };
  });

export const listAllDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: isRH } = await supabase.rpc("has_role", { _user_id: userId, _role: "rh" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isRH && !isAdmin) throw new Error("Forbidden");
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((data ?? []).map((d) => d.owner_id)));
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);
    const map = new Map((profs ?? []).map((p) => [p.id, p]));
    return {
      documents: (data ?? []).map((d) => ({ ...d, owner: map.get(d.owner_id) ?? null })),
    };
  });