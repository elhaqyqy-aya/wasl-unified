import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getUser, setUser, ROLE_META, type Role, type User } from "@/lib/auth";
import { ArrowUpRight, Mail, Phone, MapPin, Building2, Calendar, Award, Edit3, Camera, ShieldCheck } from "lucide-react";

export function ProfileView({ role }: { role: Role }) {
  const navigate = useNavigate();
  const [u, setU] = useState<User | null>(null);
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const user = getUser();
    if (!user) { navigate({ to: "/auth" }); return; }
    setU(user);
    setName(user.name);
    setEmail(user.email);
  }, [navigate]);

  if (!u) return null;
  const meta = ROLE_META[role] ?? ROLE_META.collab;
  const initial = u.name.slice(0, 1).toUpperCase();

  function save() {
    setUser({ ...u!, name, email });
    setU({ ...u!, name, email });
    setEdit(false);
  }

  return (
    <div className="space-y-4 -mx-5">
      {/* hero header */}
      <div className="px-2">
        <div className="edunai-card overflow-hidden">
          <div className="relative h-28" style={{ background: "var(--grad-brand)" }}>
            <div className="absolute inset-0 grid-bg opacity-20" />
            <div className="absolute top-3 left-3 bracket-tag !text-white">PROFILE</div>
          </div>
          <div className="px-5 pb-5 -mt-10">
            <div className="flex items-end gap-3">
              <div className="relative">
                <div className="w-20 h-20 rounded-full grid place-items-center bg-foreground text-background font-display font-extrabold text-2xl border-4 border-card">
                  {initial}
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent text-white grid place-items-center border-2 border-card">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <button onClick={() => setEdit(e=>!e)} className="ml-auto pill-btn !py-2 !px-3 !text-[10px] tracking-[0.2em] uppercase">
                <Edit3 className="w-3 h-3" /> {edit ? "Cancel" : "Edit"}
              </button>
            </div>

            {!edit ? (
              <>
                <h1 className="mt-4 font-display font-bold text-2xl tracking-tight">{u.name}</h1>
                <div className="text-[10px] tracking-[0.22em] uppercase text-accent font-bold mt-1">{meta.label}</div>
                <p className="text-sm text-muted-foreground mt-2">{meta.tagline}</p>
              </>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="field">
                  <div className="relative">
                    <input id="pname" placeholder=" " value={name} onChange={(e)=>setName(e.target.value)} />
                    <label htmlFor="pname">Full name</label>
                  </div>
                </div>
                <div className="field">
                  <div className="relative">
                    <input id="pemail" type="email" placeholder=" " value={email} onChange={(e)=>setEmail(e.target.value)} />
                    <label htmlFor="pemail">Email</label>
                  </div>
                </div>
                <button onClick={save} className="pill-btn solid w-full !pl-5 !pr-1.5 !py-1.5 justify-between !text-[11px] tracking-[0.2em] uppercase">
                  Save changes
                  <span className="arrow-circle"><ArrowUpRight className="w-4 h-4" /></span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-2 grid grid-cols-3 gap-2">
        {[
          { l: "Tenure", v: "2y" },
          { l: "Requests", v: "47" },
          { l: "Streak", v: "14d" },
        ].map(s=>(
          <div key={s.l} className="edunai-card p-3 text-center">
            <div className="text-[9px] tracking-[0.22em] uppercase text-muted-foreground">{s.l}</div>
            <div className="font-display font-bold text-lg mt-0.5">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Details */}
      <div className="px-2">
        <div className="edunai-card p-5">
          <div className="section-label mb-4">contact</div>
          <ul className="divide-y divide-border text-sm">
            {[
              { i: Mail, l: "Email", v: u.email },
              { i: Phone, l: "Phone", v: "+212 6 00 00 00 00" },
              { i: MapPin, l: "Location", v: "Rabat, Morocco" },
              { i: Building2, l: "Department", v: role === "admin" ? "IT & Governance" : role === "manager" ? "People Operations" : "Engineering" },
              { i: Calendar, l: "Joined", v: "Jan 2024" },
            ].map(({i:Icon,l,v})=>(
              <li key={l} className="py-3 flex items-center gap-3">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground w-20">{l}</span>
                <span className="ml-auto font-medium text-foreground/90 truncate">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Achievements */}
      <div className="px-2">
        <div className="edunai-card p-5">
          <div className="section-label mb-4">badges</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { i: Award, t: "Top performer", c: "var(--accent)" },
              { i: ShieldCheck, t: "Security MVP", c: "#1d1d1d" },
              { i: Calendar, t: "Streak 14d", c: "var(--accent)" },
            ].map(({i:Ic,t,c})=>(
              <div key={t} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl grid place-items-center text-white" style={{ background: c }}>
                  <Ic className="w-5 h-5" />
                </div>
                <div className="text-[10px] tracking-[0.15em] uppercase font-semibold mt-2 leading-tight">{t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="px-2 pb-4">
        <div className="edunai-card p-5">
          <div className="section-label mb-4">permissions</div>
          <div className="flex flex-wrap gap-2">
            {(role === "admin"
              ? ["RBAC", "Audit", "Security", "Policies", "Users", "Billing"]
              : role === "manager"
              ? ["Team data", "Insights", "Alerts", "Reports"]
              : role === "rh"
              ? ["People", "Documents", "Onboarding", "Offboarding", "AI supervision"]
              : ["Self-service", "Documents", "Assistant"]
            ).map(p => (
              <span key={p} className="text-[10px] tracking-[0.18em] uppercase px-3 py-1.5 rounded-full bg-foreground text-background font-bold">{p}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
