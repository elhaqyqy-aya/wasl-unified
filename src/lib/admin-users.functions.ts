import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const RoleEnum = z.enum(["admin", "rh", "manager", "collab"]);

const CreateUserSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(128),
  full_name: z.string().trim().min(1).max(120),
  role: RoleEnum,
  department: z.string().trim().max(120).optional(),
});

export const createUserAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateUserSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Only admins can create accounts
    const { data: isAdmin, error: roleErr } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleErr) throw new Error(roleErr.message);
    if (!isAdmin) throw new Error("Forbidden: admin role required");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (createErr || !created.user) {
      throw new Error(createErr?.message ?? "Failed to create user");
    }
    const newUserId = created.user.id;

    // Resolve organisation from creating admin's profile (fallback: first org)
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("organisation_id")
      .eq("id", userId)
      .maybeSingle();
    let orgId = adminProfile?.organisation_id as string | null | undefined;
    if (!orgId) {
      const { data: anyOrg } = await supabaseAdmin
        .from("organisations")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      orgId = anyOrg?.id;
    }

    const { error: profileErr } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: newUserId,
        organisation_id: orgId,
        full_name: data.full_name,
        email: data.email,
        department: data.department ?? null,
      });
    if (profileErr) throw new Error(profileErr.message);

    const { error: roleInsErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: newUserId, role: data.role });
    if (roleInsErr && !roleInsErr.message.includes("duplicate")) {
      throw new Error(roleInsErr.message);
    }

    return { id: newUserId, email: data.email, full_name: data.full_name, role: data.role };
  });

const ResetPasswordSchema = z.object({
  user_id: z.string().uuid(),
  new_password: z.string().min(8).max(128),
});

export const resetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ResetPasswordSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: isAdmin, error: roleErr } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleErr) throw new Error(roleErr.message);
    if (!isAdmin) throw new Error("Forbidden: admin role required");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, {
      password: data.new_password,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });