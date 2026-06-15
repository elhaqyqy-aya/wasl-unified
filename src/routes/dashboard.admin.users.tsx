import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Stat } from "@/components/dashboard/Bits";
import { Modal, Toast } from "@/components/Modal";
import { Search, UserPlus, Mail, Phone, MapPin, Briefcase, Calendar, ChevronRight, ShieldCheck, Ban, Copy, KeyRound } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { createUserAccount, resetUserPassword } from "@/lib/admin-users.functions";

export const Route = createFileRoute("/dashboard/admin/users")({
  component: AdminUsers,
});

type U = {
  n: string; e: string; r: "Admin" | "Manager" | "HR" | "Collaborator"; d: string;
  s: "active" | "invited" | "suspended"; phone: string; loc: string; joined: string;
};

const USERS: U[] = [
  { n: "Yasmine AMRI", e: "yasmine@wasl.app", r: "Manager", d: "Engineering", s: "active", phone: "+212 6 33 44 55 66", loc: "Rabat", joined: "Jan 2022" },
  { n: "Omar El Idrissi", e: "o.elidrissi@wasl.app", r: "Collaborator", d: "Design", s: "active", phone: "+212 6 22 33 44 55", loc: "Casablanca", joined: "Sep 2023" },
  { n: "Sara RAFIK", e: "sara@wasl.app", r: "HR", d: "People Ops", s: "active", phone: "+212 6 77 88 99 00", loc: "Rabat", joined: "Feb 2023" },
  { n: "Karim Naciri", e: "k.naciri@wasl.app", r: "Collaborator", d: "Sales", s: "invited", phone: "+212 6 44 55 66 77", loc: "Marrakech", joined: "Jun 2026" },
  { n: "Hind Alaoui", e: "h.alaoui@wasl.app", r: "Manager", d: "HR", s: "active", phone: "+212 6 55 66 77 88", loc: "Rabat", joined: "Nov 2021" },
  { n: "Mehdi Ziani", e: "m.ziani@wasl.app", r: "Collaborator", d: "Engineering", s: "suspended", phone: "+212 6 66 77 88 99", loc: "Tangier", joined: "Oct 2026" },
  { n: "Oussama ETTALALI", e: "oussama@wasl.app", r: "Admin", d: "IT & Direction", s: "active", phone: "+212 6 99 00 11 22", loc: "Rabat", joined: "Jun 2021" },
  { n: "Aya EL HAQYQY", e: "aya@wasl.app", r: "Collaborator", d: "Engineering", s: "active", phone: "+212 6 11 22 33 44", loc: "Rabat", joined: "Mar 2024" },
];

const STATUS: Record<U["s"], string> = {
  active: "bg-success/15 text-success",
  invited: "bg-accent/15 text-accent",
  suspended: "bg-destructive/15 text-destructive",
};

function AdminUsers() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | U["r"]>("all");
  const [sel, setSel] = useState<U | null>(null);
  const [invite, setInvite] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const list = USERS.filter(u =>
    (filter === "all" || u.r === filter) &&
    (u.n + u.e + u.d).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <PageHeader kicker="Identity" title="Users & roles" subtitle="Provision, suspend and audit every account on the platform."
        right={<button onClick={()=>setInvite(true)} className="pill-btn accent !text-[10px] !py-1.5 !px-3 tracking-[0.2em] uppercase"><UserPlus className="w-3.5 h-3.5"/> Invite</button>} />

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Active" value={String(USERS.filter(u=>u.s==="active").length)} accent />
        <Stat label="Invited" value={String(USERS.filter(u=>u.s==="invited").length)} />
        <Stat label="Suspended" value={String(USERS.filter(u=>u.s==="suspended").length)} delta="review" />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name, email or department…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-foreground transition" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {(["all","Admin","HR","Manager","Collaborator"] as const).map(r => (
          <button key={r} onClick={()=>setFilter(r)} className={`px-3 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase font-bold whitespace-nowrap transition ${filter===r ? "bg-foreground text-background" : "bg-card border border-border text-muted-foreground hover:border-foreground"}`}>
            {r}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {list.map(u => (
          <button key={u.e} onClick={() => setSel(u)} className="edunai-card p-4 text-left flex items-center gap-3 hover:border-foreground transition group">
            <div className="w-12 h-12 rounded-2xl grid place-items-center text-white font-display font-bold text-lg shrink-0" style={{ background: "var(--grad-brand)" }}>
              {u.n.slice(0,1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-sm tracking-tight truncate">{u.n}</div>
              <div className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground mt-0.5 truncate">{u.e}</div>
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary font-semibold">{u.r}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold capitalize ${STATUS[u.s]}`}>{u.s}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition shrink-0" />
          </button>
        ))}
        {list.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-8">No user matches.</div>
        )}
      </div>

      {/* Detail */}
      <Modal open={!!sel} onClose={() => setSel(null)} kicker="ACCOUNT" title={sel?.n ?? ""}
        footer={
          <div className="flex gap-2">
            <button onClick={() => { setSel(null); setToast(`${sel?.s === "suspended" ? "Reactivated" : "Suspended"}`); }} className="pill-btn flex-1 justify-center !py-2.5 !text-[10px] tracking-[0.2em] uppercase">
              <Ban className="w-3.5 h-3.5"/> {sel?.s === "suspended" ? "Reactivate" : "Suspend"}
            </button>
            <button onClick={() => { setSel(null); setToast("Role updated"); }} className="pill-btn accent flex-1 justify-center !py-2.5 !text-[10px] tracking-[0.2em] uppercase">
              <ShieldCheck className="w-3.5 h-3.5"/> Change role
            </button>
          </div>
        }>
        {sel && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl grid place-items-center text-white font-display font-bold text-2xl" style={{ background: "var(--grad-brand)" }}>
                {sel.n.slice(0,1)}
              </div>
              <div>
                <div className="font-display font-bold text-lg leading-tight">{sel.n}</div>
                <div className="text-[10px] tracking-[0.2em] uppercase text-accent font-bold mt-1">{sel.r} · {sel.d}</div>
                <span className={`text-[9px] mt-1 inline-block px-2 py-0.5 rounded-full font-bold capitalize ${STATUS[sel.s]}`}>{sel.s}</span>
              </div>
            </div>
            <ul className="divide-y divide-border text-sm">
              {[
                { i: Mail, l: "Email", v: sel.e },
                { i: Phone, l: "Phone", v: sel.phone },
                { i: MapPin, l: "Location", v: sel.loc },
                { i: Briefcase, l: "Department", v: sel.d },
                { i: Calendar, l: "Joined", v: sel.joined },
              ].map(({ i: Ic, l, v }) => (
                <li key={l} className="py-2.5 flex items-center gap-3">
                  <Ic className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground w-20">{l}</span>
                  <span className="ml-auto font-medium text-foreground/90">{v}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-xl bg-secondary/60 border border-border p-3 text-[11px] text-muted-foreground leading-relaxed">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-foreground font-bold mb-1">Recent activity</span>
              Last login · 2h ago · Rabat, MA. 42 AI requests today. 0 policy violations.
            </div>
          </div>
        )}
      </Modal>

      {/* Invite */}
      <Modal open={invite} onClose={() => setInvite(false)} kicker="ONBOARD" title="Create a new account">
        <InviteForm onSent={(m) => { setInvite(false); setToast(m); }} />
      </Modal>

      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function InviteForm({ onSent }: { onSent: (m: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"collab" | "manager" | "rh" | "admin">("collab");
  const [dept, setDept] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const create = useServerFn(createUserAccount);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      await create({ data: { email: cleanEmail, password, full_name: name, role, department: dept || undefined } });
      setCreated({ email: cleanEmail, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setBusy(false);
    }
  }

  const roles: { v: typeof role; label: string }[] = [
    { v: "collab", label: "Collaborator" },
    { v: "manager", label: "Manager" },
    { v: "rh", label: "HR" },
    { v: "admin", label: "Admin" },
  ];

  if (created) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border-2 border-success/40 bg-success/10 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span className="text-[10px] tracking-[0.22em] uppercase font-bold text-success">Account created</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Share these credentials securely with the user. The password is shown <b>only once</b> — copy it now.
          </p>
          <div className="space-y-2">
            <div>
              <div className="text-[9px] tracking-[0.22em] uppercase text-muted-foreground mb-1 font-bold">Email</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-card border border-border rounded-lg px-2.5 py-2 font-mono">{created.email}</code>
                <button type="button" onClick={() => navigator.clipboard?.writeText(created.email)} className="pill-btn !text-[9px] !py-1.5 !px-2"><Copy className="w-3 h-3" /></button>
              </div>
            </div>
            <div>
              <div className="text-[9px] tracking-[0.22em] uppercase text-muted-foreground mb-1 font-bold">Password</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-card border border-border rounded-lg px-2.5 py-2 font-mono select-all">{created.password}</code>
                <button type="button" onClick={() => navigator.clipboard?.writeText(created.password)} className="pill-btn !text-[9px] !py-1.5 !px-2"><Copy className="w-3 h-3" /></button>
              </div>
            </div>
          </div>
        </div>
        <button type="button" onClick={() => onSent(`Account ${created.email} ready — credentials shared`)} className="pill-btn accent w-full justify-center !py-2.5 !text-[11px] tracking-[0.2em] uppercase">
          Done
        </button>
      </div>
    );
  }

  return (
    <form id="adm-invite" onSubmit={submit} className="space-y-3">
      <div className="field"><div className="relative">
        <input id="au-name" placeholder=" " value={name} onChange={e=>setName(e.target.value)} required />
        <label htmlFor="au-name">Full name</label>
      </div></div>
      <div className="field"><div className="relative">
        <input id="au-email" type="email" placeholder=" " value={email} onChange={e=>setEmail(e.target.value)} required />
        <label htmlFor="au-email">Work email</label>
      </div></div>
      <div className="field"><div className="relative">
        <input id="au-pass" type="text" placeholder=" " value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} />
        <label htmlFor="au-pass">Temporary password (min 8 chars)</label>
      </div></div>
      <button type="button" onClick={() => setPassword(Math.random().toString(36).slice(2, 10) + "A1!")} className="text-[10px] tracking-[0.18em] uppercase font-bold text-accent hover:underline">
        Generate strong password
      </button>
      <div className="field"><div className="relative">
        <input id="au-dept" placeholder=" " value={dept} onChange={e=>setDept(e.target.value)} />
        <label htmlFor="au-dept">Department</label>
      </div></div>
      <div>
        <div className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-2 font-bold">Role</div>
        <div className="grid grid-cols-2 gap-2">
          {roles.map(r => (
            <button type="button" key={r.v} onClick={()=>setRole(r.v)}
              className={`rounded-xl border px-3 py-2 text-[11px] tracking-[0.15em] uppercase font-bold transition ${role===r.v ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:border-foreground"}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      {error && <div className="text-xs text-destructive font-medium">{error}</div>}
      {busy && <div className="text-xs text-muted-foreground">Creating account…</div>}
      <button type="submit" disabled={busy} className="pill-btn accent w-full justify-center !py-2.5 !text-[11px] tracking-[0.2em] uppercase disabled:opacity-50">
        Create account
      </button>
    </form>
  );
}
