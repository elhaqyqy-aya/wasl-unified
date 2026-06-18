import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, full_name, email, phone, location, department, position, avatar_url, hire_date")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { profile: data };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    full_name: z.string().min(1).max(120).optional(),
    phone: z.string().max(40).optional(),
    location: z.string().max(120).optional(),
    avatar_url: z.string().max(500).optional().nullable(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const patch: {
      updated_at: string;
      full_name?: string;
      phone?: string;
      location?: string;
      avatar_url?: string | null;
    } = { updated_at: new Date().toISOString() };
    if (data.full_name !== undefined) patch.full_name = data.full_name;
    if (data.phone !== undefined) patch.phone = data.phone;
    if (data.location !== undefined) patch.location = data.location;
    if (data.avatar_url !== undefined) patch.avatar_url = data.avatar_url;
    const { data: row, error } = await context.supabase
      .from("profiles").update(patch).eq("id", context.userId)
      .select("id, full_name, email, phone, location, department, position, avatar_url, hire_date")
      .single();
    if (error) throw new Error(error.message);
    return { profile: row };
  });

export const getAvatarSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ path: z.string().min(1).max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: signed, error } = await context.supabase.storage
      .from("avatars").createSignedUrl(data.path, 60 * 60);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });