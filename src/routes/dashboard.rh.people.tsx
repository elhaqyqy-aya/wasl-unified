import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel, Stat } from "@/components/dashboard/Bits";
import { Modal, Toast } from "@/components/Modal";
import { Search, UserPlus, Mail, Phone, MapPin, Briefcase, Calendar, ChevronRight, HeartHandshake, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/dashboard/rh/people")({
  component: People,
});

type Person = {
  n: string; e: string; r: string; d: string; t: string; loc: string; phone: string;
  joined: string; risk: "low" | "medium" | "high";
};

const PEOPLE: Person[] = [
  { n: "Aya EL HAQYQY", e: "aya@wasl.app", r: "Collaborator", d: "Engineering", t: "Software Engineer", loc: "Rabat", phone: "+212 6 11 22 33 44", joined: "Mar 2024", risk: "low" },
  { n: "Omar El Idrissi", e: "o.elidrissi@wasl.app", r: "Collaborator", d: "Design", t: "Product Designer", loc: "Casablanca", phone: "+212 6 22 33 44 55", joined: "Sep 2023", risk: "medium" },
  { n: "Yasmine AMRI", e: "yasmine@wasl.app", r: "Manager", d: "Engineering", t: "Engineering Manager", loc: "Rabat", phone: "+212 6 33 44 55 66", joined: "Jan 2022", risk: "low" },
  { n: "Karim Naciri", e: "k.naciri@wasl.app", r: "Collaborator", d: "Sales", t: "Account Executive", loc: "Marrakech", phone: "+212 6 44 55 66 77", joined: "Jun 2024", risk: "high" },
  { n: "Hind Alaoui", e: "h.alaoui@wasl.app", r: "Manager", d: "HR", t: "HR Business Partner", loc: "Rabat", phone: "+212 6 55 66 77 88", joined: "Nov 2021", risk: "low" },
  { n: "Mehdi Ziani", e: "m.ziani@wasl.app", r: "Collaborator", d: "Engineering", t: "Junior Engineer · Onboarding", loc: "Tangier", phone: "+212 6 66 77 88 99", joined: "Oct 2026", risk: "medium" },
];

const RISK_COLOR: Record<Person["risk"], string> = {
  low: "bg-success/15 text-success",
  medium: "bg-accent/15 text-accent",
  high: "bg-destructive/15 text-destructive",
};

function People() {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Person | null>(null);
  const [invite, setInvite] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const list = PEOPLE.filter(p => (p.n + p.e + p.d + p.t).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <PageHeader kicker="People" title="Workforce" subtitle="Browse, onboard and follow every collaborator."
        right={<button onClick={() => setInvite(true)} className="pill-btn accent !text-[10px] !py-1.5 !px-3 tracking-[0.2em] uppercase"><UserPlus className="w-3.5 h-3.5"/> Invite</button>} />

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Headcount" value="1,284" accent />
        <Stat label="New · 30d" value="14" delta="+4" />
        <Stat label="At risk" value="7" delta="2 high" />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name, role, department…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-foreground transition" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {list.map(p => (
          <button key={p.e} onClick={() => setSel(p)} className="edunai-card p-4 text-left flex items-center gap-3 hover:border-foreground transition group">
            <div className="w-12 h-12 rounded-2xl grid place-items-center text-white font-display font-bold text-lg shrink-0" style={{ background: "var(--grad-brand)" }}>
              {p.n.slice(0,1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-sm tracking-tight truncate">{p.n}</div>
              <div className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground mt-0.5 truncate">{p.t}</div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-secondary font-semibold">{p.d}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${RISK_COLOR[p.risk]}`}>{p.risk}</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition shrink-0" />
          </button>
        ))}
        {list.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-8">No match.</div>
        )}
      </div>

      {/* === Detail modal === */}
      <Modal open={!!sel} onClose={() => setSel(null)} kicker="PROFILE" title={sel?.n ?? ""}
        footer={
          <div className="flex gap-2">
            <button onClick={() => { setSel(null); setToast("Message sent"); }} className="pill-btn flex-1 justify-center !py-2.5 !text-[10px] tracking-[0.2em] uppercase">Message</button>
            <button onClick={() => { setSel(null); setToast("Onboarding plan opened"); }} className="pill-btn accent flex-1 justify-center !py-2.5 !text-[10px] tracking-[0.2em] uppercase">Open journey</button>
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
                <div className="text-xs text-muted-foreground mt-0.5">{sel.t}</div>
              </div>
            </div>
            <ul className="divide-y divide-border text-sm">
              {[
                { i: Mail, l: "Email", v: sel.e },
                { i: Phone, l: "Phone", v: sel.phone },
                { i: MapPin, l: "Location", v: sel.loc },
                { i: Briefcase, l: "Department", v: sel.d },
                { i: Calendar, l: "Joined", v: sel.joined },
                { i: ShieldAlert, l: "Risk", v: sel.risk },
              ].map(({ i: Ic, l, v }) => (
                <li key={l} className="py-2.5 flex items-center gap-3">
                  <Ic className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground w-20">{l}</span>
                  <span className="ml-auto font-medium text-foreground/90 capitalize">{v}</span>
                </li>
              ))}
            </ul>
            <div className="rounded-xl bg-secondary/60 border border-border p-3 text-xs leading-relaxed text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 text-accent font-bold uppercase tracking-[0.18em] text-[10px] mb-1">
                <HeartHandshake className="w-3.5 h-3.5"/> AI suggestion
              </span>
              <div>Schedule a 1:1 check-in this week and validate the next onboarding milestone.</div>
            </div>
          </div>
        )}
      </Modal>

      {/* === Invite modal === */}
      <InviteModal open={invite} onClose={() => setInvite(false)} onSent={(msg) => { setInvite(false); setToast(msg); }} />

      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}

function InviteModal({ open, onClose, onSent }: { open: boolean; onClose: () => void; onSent: (m: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("collab");
  const [dept, setDept] = useState("");
  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSent(`Invite sent to ${email || "user"}`);
    setName(""); setEmail(""); setDept("");
  }
  return (
    <Modal open={open} onClose={onClose} kicker="ONBOARD" title="Invite a new user"
      footer={
        <button form="invite-form" type="submit" className="pill-btn accent w-full justify-center !py-2.5 !text-[11px] tracking-[0.2em] uppercase">
          Send invitation
        </button>
      }>
      <form id="invite-form" onSubmit={submit} className="space-y-3">
        <div className="field"><div className="relative">
          <input id="in-name" placeholder=" " value={name} onChange={e=>setName(e.target.value)} required />
          <label htmlFor="in-name">Full name</label>
        </div></div>
        <div className="field"><div className="relative">
          <input id="in-email" type="email" placeholder=" " value={email} onChange={e=>setEmail(e.target.value)} required />
          <label htmlFor="in-email">Work email</label>
        </div></div>
        <div className="field"><div className="relative">
          <input id="in-dept" placeholder=" " value={dept} onChange={e=>setDept(e.target.value)} />
          <label htmlFor="in-dept">Department</label>
        </div></div>
        <div>
          <div className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-2 font-bold">Role</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: "collab", l: "Collaborator" },
              { v: "manager", l: "Manager" },
              { v: "rh", l: "HR Team" },
              { v: "admin", l: "Admin · Direction" },
            ].map(r => (
              <button type="button" key={r.v} onClick={()=>setRole(r.v)}
                className={`rounded-xl border px-3 py-2 text-[11px] tracking-[0.15em] uppercase font-bold transition ${role===r.v ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:border-foreground"}`}>
                {r.l}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
