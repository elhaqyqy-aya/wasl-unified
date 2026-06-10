import { supabase } from "@/integrations/supabase/client";

export type Role = "admin" | "rh" | "manager" | "collab";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const KEY = "wasl.user";

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setUser(u: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(u));
  window.dispatchEvent(new Event("wasl-auth"));
}

export async function logout() {
  try {
    await supabase.auth.signOut();
  } catch {}
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("wasl-auth"));
  }
}

export const ROLE_META: Record<Role, { label: string; tagline: string; icon: string; path: string }> = {
  admin: {
    label: "Admin · Direction",
    tagline: "Govern access, security, audit & strategic KPIs across the company.",
    icon: "shield",
    path: "/dashboard/admin",
  },
  rh: {
    label: "HR Team",
    tagline: "Automate documents, supervise the assistant & run onboarding workflows.",
    icon: "heart-handshake",
    path: "/dashboard/rh",
  },
  manager: {
    label: "Manager",
    tagline: "Steer your team with predictive engagement insights.",
    icon: "compass",
    path: "/dashboard/manager",
  },
  collab: {
    label: "Collaborator",
    tagline: "Your personal HR companion — answers, docs & onboarding.",
    icon: "sparkles",
    path: "/dashboard/collab",
  },
};

export interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: Role;
}

// Seed accounts (created in Lovable Cloud Auth via the seedDemoAccounts server fn).
export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "aya@wasl.app",     password: "aya12345",     name: "Aya EL HAQYQY",   role: "collab" },
  { email: "yasmine@wasl.app", password: "yasmine12345", name: "Yasmine AMRI",    role: "manager" },
  { email: "sara@wasl.app",    password: "sara12345",    name: "Sara RAFIK",      role: "rh" },
  { email: "oussama@wasl.app", password: "oussama12345", name: "Oussama ETTALALI", role: "admin" },
];

/**
 * Sign in with email + password against Lovable Cloud, fetch the user's role
 * from the user_roles table, persist the resolved profile to localStorage, and
 * return the typed User.
 */
export async function signIn(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error || !data.user) {
    throw new Error(error?.message ?? "Sign-in failed.");
  }

  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .order("role", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", data.user.id)
    .maybeSingle();

  const role = (roleRow?.role as Role) ?? "collab";
  const user: User = {
    id: data.user.id,
    email: data.user.email ?? email,
    name: profile?.full_name ?? data.user.email ?? email,
    role,
  };
  setUser(user);
  return user;
}

/* Per-user demo-tour skip flag (unchanged API) */
export function tourSeen(userId: string): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(`wasl.tour.${userId}`) === "1";
}
export function markTourSeen(userId: string) {
  localStorage.setItem(`wasl.tour.${userId}`, "1");
}