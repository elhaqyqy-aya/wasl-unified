import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getUser, setUser, ROLE_META, type Role, type User } from "@/lib/auth";
import { ArrowUpRight, Mail, Phone, MapPin, Building2, Calendar, Award, Edit3, Camera, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ProfileRow = {
  id: string; full_name: string; email: string;
  phone: string | null; location: string | null;
  department: string | null; position: string | null;
  avatar_url: string | null; hire_date: string | null;
};

export function ProfileView({ role }: { role: Role }) {
  const navigate = useNavigate();
  const [u, setU] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", location: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = getUser();
    if (!user) { navigate({ to: "/auth" }); return; }
    setU(user);
    (async () => {
      const { data } = await supabase.from("profiles")
        .select("id, full_name, email, phone, location, department, position, avatar_url, hire_date")
        .eq("id", user.id).maybeSingle();
      if (data) {
        setProfile(data as ProfileRow);
        setForm({
          full_name: data.full_name ?? user.name,
          phone: data.phone ?? "",
          location: data.location ?? "",
        });
        if (data.avatar_url) {
          const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(data.avatar_url, 3600);
          if (signed) setAvatarUrl(signed.signedUrl);
        }
      }
    })();
  }, [navigate]);

  if (!u) return null;
  const meta = ROLE_META[role] ?? ROLE_META.collab;
  const displayName = profile?.full_name ?? u.name;
  const initial = displayName.slice(0, 1).toUpperCase();

  async function save() {
    if (!u) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from("profiles")
        .update({ full_name: form.full_name, phone: form.phone || null, location: form.location || null, updated_at: new Date().toISOString() })
        .eq("id", u.id)
        .select("id, full_name, email, phone, location, department, position, avatar_url, hire_date")
        .single();
      if (error) throw error;
      setProfile(data as ProfileRow);
      setUser({ ...u, name: form.full_name });
      setEdit(false);
    } catch (e) {
      console.error("profile save failed", e);
      alert("Couldn't save profile. " + (e as Error).message);
    } finally { setSaving(false); }
  }

  async function onAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !u) return;
    if (file.size > 4 * 1024 * 1024) { alert("Image too large (max 4MB)"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${u.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      await supabase.from("profiles").update({ avatar_url: path, updated_at: new Date().toISOString() }).eq("id", u.id);
      const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
      if (signed) setAvatarUrl(signed.signedUrl);
      setProfile((p) => p ? { ...p, avatar_url: path } : p);
    } catch (err) {
      console.error("avatar upload failed", err);
      alert("Couldn't upload avatar. " + (err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
                <div className="w-20 h-20 rounded-full grid place-items-center bg-foreground text-background font-display font-extrabold text-2xl border-4 border-card overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  ) : initial}
                </div>
                <input ref={fileInputRef} onChange={onAvatarPick} type="file" accept="image/*" className="hidden" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent text-white grid place-items-center border-2 border-card disabled:opacity-60"
                  aria-label="Change avatar"
                >
                  {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                </button>
              </div>
              <button onClick={() => setEdit(e=>!e)} className="ml-auto pill-btn !py-2 !px-3 !text-[10px] tracking-[0.2em] uppercase">
                <Edit3 className="w-3 h-3" /> {edit ? "Cancel" : "Edit"}
              </button>
            </div>

            {!edit ? (
              <>
                <h1 className="mt-4 font-display font-bold text-2xl tracking-tight">{displayName}</h1>
                <div className="text-[10px] tracking-[0.22em] uppercase text-accent font-bold mt-1">{meta.label}</div>
                <p className="text-sm text-muted-foreground mt-2">{meta.tagline}</p>
              </>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="field">
                  <div className="relative">
                    <input id="pname" placeholder=" " value={form.full_name} onChange={(e)=>setForm(f=>({...f, full_name: e.target.value}))} />
                    <label htmlFor="pname">Full name</label>
                  </div>
                </div>
                <div className="field">
                  <div className="relative">
                    <input id="pphone" type="tel" placeholder=" " value={form.phone} onChange={(e)=>setForm(f=>({...f, phone: e.target.value}))} />
                    <label htmlFor="pphone">Phone</label>
                  </div>
                </div>
                <div className="field">
                  <div className="relative">
                    <input id="ploc" placeholder=" " value={form.location} onChange={(e)=>setForm(f=>({...f, location: e.target.value}))} />
                    <label htmlFor="ploc">Location</label>
                  </div>
                </div>
                <button onClick={save} disabled={saving} className="pill-btn solid w-full !pl-5 !pr-1.5 !py-1.5 justify-between !text-[11px] tracking-[0.2em] uppercase disabled:opacity-60">
                  {saving ? "Saving…" : "Save changes"}
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
              { i: Mail, l: "Email", v: profile?.email ?? u.email },
              { i: Phone, l: "Phone", v: profile?.phone || "—" },
              { i: MapPin, l: "Location", v: profile?.location || "—" },
              { i: Building2, l: "Department", v: profile?.department || (role === "admin" ? "IT & Governance" : role === "manager" ? "People Operations" : "—") },
              { i: Calendar, l: "Joined", v: profile?.hire_date ?? "—" },
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
