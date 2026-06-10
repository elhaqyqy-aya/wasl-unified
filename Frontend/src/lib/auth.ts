// Lightweight client-side mock auth. Replace with a real backend later.
export type Role = "admin" | "rh" | "manager" | "collab";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const KEY = "humanai.user";

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
  localStorage.setItem(KEY, JSON.stringify(u));
  window.dispatchEvent(new Event("humanai-auth"));
}

export function logout() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("humanai-auth"));
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

/* === Seeded demo accounts (presentation mode) === */
export interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { email: "aya@wasl.app",     password: "aya123",     name: "Aya EL HAQYQY",        role: "collab" },
  { email: "yasmine@wasl.app", password: "yasmine123", name: "Yasmine AMRI",   role: "manager" },
  { email: "sara@wasl.app",    password: "sara123",    name: "Sara RAFIK",  role: "rh" },
  { email: "oussama@wasl.app", password: "oussama123", name: "Oussama ETTALALI", role: "admin" },
];

export function findAccount(email: string, password: string): DemoAccount | null {
  const e = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.find(a => a.email === e && a.password === password) ?? null;
}

/* Per-user demo tour skip flag */
export function tourSeen(userId: string): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(`humanai.tour.${userId}`) === "1";
}
export function markTourSeen(userId: string) {
  localStorage.setItem(`humanai.tour.${userId}`, "1");
}
