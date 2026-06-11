import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const DOC_TYPES = ["contract", "payslip", "policy", "certificate", "id", "other"] as const;

const CreateInput = z.object({
  title: z.string().min(2).max(200),
  type: z.enum(DOC_TYPES).default("certificate"),
  body: z.string().max(5000).optional(),
  targetUserId: z.string().uuid().optional(),
});

export const createDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => CreateInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    let owner = userId;
    if (data.targetUserId && data.targetUserId !== userId) {
      const { data: isRH } = await supabase.rpc("has_role", { _user_id: userId, _role: "rh" });
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
      if (!isRH && !isAdmin) throw new Error("Forbidden");
      owner = data.targetUserId;
    }
    const body = (data.body ?? "").trim();
    const storage_path = `inline://${btoa(unescape(encodeURIComponent(body))).slice(0, 4000)}`;
    const { data: row, error } = await supabase
      .from("documents")
      .insert({
        owner_id: owner,
        type: data.type,
        title: data.title,
        storage_path,
        size_bytes: body.length,
        issued_at: new Date().toISOString().slice(0, 10),
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { document: row };
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