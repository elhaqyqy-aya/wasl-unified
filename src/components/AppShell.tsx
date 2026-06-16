import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import {
  LogOut, LayoutDashboard, MessageSquare, FileText, Users, ShieldAlert,
  BarChart3, Settings, Bell, Compass, User as UserIcon, X, MapPin, Mail,
  CheckCircle2, AlertTriangle, Info, HeartHandshake, ClipboardList,
  CalendarDays, Fingerprint, Stethoscope, CheckSquare
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getUser, logout, ROLE_META, tourSeen, type Role, type User } from "@/lib/auth";
import { DemoTour } from "@/components/dashboard/DemoTour";
import { Logo } from "@/components/Logo";

const NAV: Record<Role, { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[]> = {
  collab: [
    { to: "/dashboard/collab", label: "Home", icon: LayoutDashboard },
    { to: "/dashboard/collab/assistant", label: "Assistant", icon: MessageSquare },
    { to: "/dashboard/collab/leave", label: "Leave", icon: CalendarDays },
    { to: "/dashboard/collab/presence", label: "Presence", icon: Fingerprint },
    { to: "/dashboard/collab/documents", label: "Docs", icon: FileText },
    { to: "/dashboard/collab/onboarding", label: "Onboard", icon: Compass },
    { to: "/dashboard/collab/offboarding", label: "Offboard", icon: LogOut },
    { to: "/dashboard/collab/profile", label: "Profile", icon: UserIcon },
  ],
  manager: [
    { to: "/dashboard/manager", label: "Overview", icon: LayoutDashboard },
    { to: "/dashboard/manager/team", label: "Team", icon: Users },
    { to: "/dashboard/manager/leave", label: "Leave", icon: CheckSquare },
    { to: "/dashboard/manager/insights", label: "Insights", icon: BarChart3 },
    { to: "/dashboard/manager/qvt", label: "QVT", icon: HeartHandshake },
    { to: "/dashboard/manager/alerts", label: "Alerts", icon: Bell },
    { to: "/dashboard/manager/profile", label: "Profile", icon: UserIcon },
  ],
  rh: [
    { to: "/dashboard/rh", label: "Overview", icon: LayoutDashboard },
    { to: "/dashboard/rh/people", label: "People", icon: HeartHandshake },
    { to: "/dashboard/rh/medical", label: "Medical", icon: Stethoscope },
    { to: "/dashboard/rh/documents", label: "Docs", icon: FileText },
    { to: "/dashboard/rh/workflows", label: "Workflows", icon: ClipboardList },
    { to: "/dashboard/rh/knowledge", label: "KB", icon: BarChart3 },
    { to: "/dashboard/rh/profile", label: "Profile", icon: UserIcon },
  ],
  admin: [
    { to: "/dashboard/admin", label: "Control", icon: LayoutDashboard },
    { to: "/dashboard/admin/users", label: "Users", icon: Users },
    { to: "/dashboard/admin/security", label: "Security", icon: ShieldAlert },
    { to: "/dashboard/admin/settings", label: "Settings", icon: Settings },
    { to: "/dashboard/admin/profile", label: "Profile", icon: UserIcon },
  ],
};

type Notif = { id: string; t: string; d: string; time: string; kind: "info" | "warn" | "ok"; read?: boolean };

const NOTIFS: Record<Role, Notif[]> = {
  collab: [
    { id: "1", t: "Your attestation is ready", d: "Generated employment certificate (PDF).", time: "2m", kind: "ok" },
    { id: "2", t: "Onboarding day 12 reminder", d: "Complete the data-privacy module by Friday.", time: "1h", kind: "info" },
    { id: "3", t: "New policy published", d: "Remote work policy v2 — please review.", time: "Yesterday", kind: "info", read: true },
  ],
  manager: [
    { id: "1", t: "Engagement dip detected", d: "Engineering · 3 collaborators showing weak signals.", time: "5m", kind: "warn" },
    { id: "2", t: "Weekly team report", d: "Your Monday summary is available.", time: "1h", kind: "info" },
    { id: "3", t: "Leave request approved", d: "S. El Idrissi · 14–18 July.", time: "3h", kind: "ok", read: true },
  ],
  rh: [
    { id: "1", t: "Onboarding stalled · M. Ziani", d: "Day-7 checkpoint missed. Suggest contact.", time: "8m", kind: "warn" },
    { id: "2", t: "12 attestations to validate", d: "AI-prefilled queue awaiting your review.", time: "1h", kind: "info" },
    { id: "3", t: "Offboarding closed · K. Naciri", d: "All compliance steps completed.", time: "Yesterday", kind: "ok", read: true },
  ],
  admin: [
    { id: "1", t: "Unauthorized access attempt", d: "IP 41.x.x.x · blocked automatically.", time: "2m", kind: "warn" },
    { id: "2", t: "Audit log exported", d: "By S. Bennani — security@wasl.app", time: "1h", kind: "info" },
    { id: "3", t: "AI policy updated", d: "Guardrails v4 deployed to production.", time: "Yesterday", kind: "ok", read: true },
  ],
};

const KIND_ICON = { info: Info, warn: AlertTriangle, ok: CheckCircle2 };
const KIND_COLOR = { info: "var(--accent)", warn: "#dc2626", ok: "#16a34a" };

export function AppShell({ role }: { role: Role }) {
  const [user, setU] = useState<User | null>(null);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>(NOTIFS[role]);
  const navigate = useNavigate();

  useEffect(() => {
    const u = getUser();
    if (!u) { navigate({ to: "/auth" }); return; }
    if (u.role !== role) { navigate({ to: ROLE_META[u.role].path }); return; }
    setU(u);
    setNotifs(NOTIFS[role]);
    if (!tourSeen(u.id)) setShowTour(true);
  }, [role, navigate]);

  useEffect(() => {
    if (notifsOpen) document.body.classList.add('notifs-open');
    else document.body.classList.remove('notifs-open');
    return () => { document.body.classList.remove('notifs-open'); };
  }, [notifsOpen]);

  const unread = useMemo(() => notifs.filter(n => !n.read).length, [notifs]);
  if (!user) return null;

  function doLogout() {
    logout();
    navigate({ to: "/auth" });
  }

  return (
    <div className="phone-shell bg-secondary/40 flex flex-col min-h-screen">
      {/* Dark topbar */}
      <div className="edunai-topbar text-[10px] tracking-[0.18em] uppercase">
        <div className="px-4 h-9 flex items-center justify-between">
          <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3"/> Rabat, Morocco</span>
          <span className="flex items-center gap-1.5 opacity-90"><Mail className="w-3 h-3"/> {user.email}</span>
        </div>
      </div>

      {/* Floating header card */}
      <header className="px-2 pt-2 sticky top-0 z-40">
        <div className="edunai-card px-4 h-14 flex items-center justify-between shadow-[0_4px_20px_-12px_rgba(0,0,0,.15)]">
          <Link to="/" className="flex items-center gap-1">
            <Logo className="h-6" showByline={false} />
            <span className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground pl-2 border-l border-border h-4 flex items-center">{ROLE_META[role].label}</span>
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setNotifsOpen(true)}
              className="relative w-9 h-9 grid place-items-center rounded-full hover:bg-muted transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent text-white text-[9px] font-bold grid place-items-center">{unread}</span>
              )}
            </button>
            <Link to={`/dashboard/${role}/profile` as never} className="w-9 h-9 rounded-full grid place-items-center bg-foreground text-background font-bold text-sm hover:bg-accent transition">
              {user.name.slice(0,1).toUpperCase()}
            </Link>
            <button
              onClick={() => setConfirmOut(true)}
              className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-5 pt-4 pb-28 w-full">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className={`bottom-nav ${notifsOpen ? "hidden" : ""}`}>
        {NAV[role].map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to as never} activeOptions={{ exact: true }}>
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        ))}
      </nav>

      {/* === Notifications drawer === */}
      {notifsOpen && (
        <>
          <div onClick={() => setNotifsOpen(false)} className="fixed inset-0 bg-foreground/40 z-90 animate-in fade-in duration-200" />
          <aside className="fixed top-0 right-0 bottom-0 w-[88vw] max-w-sm z-90 bg-background border-l border-border flex flex-col animate-in slide-in-from-right duration-300 notifications-aside">
            <div className="edunai-topbar text-[10px] tracking-[0.18em] uppercase">
              <div className="px-4 h-9 flex items-center justify-between">
                <span>Inbox</span>
                <span>{unread} new</span>
              </div>
            </div>
            <div className="px-4 h-14 flex items-center justify-between border-b border-border">
              <div>
                <div className="bracket-tag">NOTIFICATIONS</div>
                <div className="font-display font-bold text-lg leading-tight">Recent activity</div>
              </div>
              <button onClick={() => setNotifsOpen(false)} className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notifs.map(n => {
                const Icon = KIND_ICON[n.kind];
                return (
                  <button
                    key={n.id}
                    onClick={() => setNotifs(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))}
                    className={`w-full text-left edunai-card p-3 flex gap-3 hover:border-foreground transition ${n.read ? "opacity-70" : ""}`}
                  >
                    <div className="w-9 h-9 rounded-xl grid place-items-center text-white shrink-0" style={{ background: KIND_COLOR[n.kind] }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold text-sm leading-tight truncate">{n.t}</div>
                        <div className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground shrink-0">{n.time}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.d}</div>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-1" />}
                  </button>
                );
              })}
            </div>
            <div className="p-3 border-t border-border">
              <div className="notifs-action">
                <button
                  onClick={() => setNotifs(ns => ns.map(n => ({ ...n, read: true })))}
                  className="pill-btn w-full justify-center !py-2.5 !text-[11px] tracking-[0.2em] uppercase"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* === Demo tour (first login) === */}
      {showTour && user && (
        <DemoTour userId={user.id} role={role} onClose={() => setShowTour(false)} />
      )}


      {/* === Sign-out confirmation === */}
      {confirmOut && (
        <>
          <div onClick={() => setConfirmOut(false)} className="fixed inset-0 bg-foreground/50 z-50 animate-in fade-in duration-200" />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-sm animate-in scale-in-90 fade-in duration-300">
              <div className="edunai-card p-6 relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl grid place-items-center text-white mb-4" style={{ background: "var(--accent)" }}>
                    <LogOut className="w-6 h-6" />
                  </div>
                  <div className="bracket-tag mb-2">CONFIRM</div>
                  <h3 className="font-display font-bold text-2xl tracking-tight">Sign out of WASL?</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    You'll need to sign in again with your <span className="font-semibold text-foreground">{ROLE_META[role].label}</span> credentials to access this cockpit.
                  </p>
                  <div className="mt-6 flex gap-2">
                    <button onClick={() => setConfirmOut(false)} className="pill-btn flex-1 justify-center !py-3 !text-[11px] tracking-[0.2em] uppercase">
                      Stay signed in
                    </button>
                    <button onClick={doLogout} className="pill-btn accent flex-1 justify-center !py-3 !text-[11px] tracking-[0.2em] uppercase">
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
