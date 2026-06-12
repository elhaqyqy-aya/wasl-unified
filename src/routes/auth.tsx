import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Mail, Lock, ShieldCheck, Compass, Sparkles, HeartHandshake } from "lucide-react";
import { ROLE_META, signIn, DEMO_ACCOUNTS, type Role } from "@/lib/auth";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Wasl by Humanai" },
      { name: "description", content: "Sign in to Wasl — the AI HR platform by Humanai." },
    ],
  }),
  component: AuthPage,
});

const ICONS = { admin: ShieldCheck, manager: Compass, collab: Sparkles, rh: HeartHandshake } as const;

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const user = await signIn(email, password);
      navigate({ to: ROLE_META[user.role].path });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Sign-in failed.";
      setErr(
        message.toLowerCase().includes("invalid")
          ? "Invalid email or password. Demo accounts must be seeded first — ask an admin to run Seed Demo Accounts."
          : message,
      );
    } finally {
      setLoading(false);
    }
  }

  function quick(i: number) {
    const a = DEMO_ACCOUNTS[i];
    setEmail(a.email);
    setPassword(a.password);
  }

  return (
    <div className="phone-shell bg-secondary/40">
      <div className="edunai-topbar text-[10px] tracking-[0.18em] uppercase">
        <div className="px-4 h-9 flex items-center justify-between">
          <span>Rabat, Morocco</span>
          <span>support@humanai.ma</span>
        </div>
      </div>

      <header className="px-2 pt-2 sticky top-0 z-40">
        <div className="edunai-card px-4 h-14 flex items-center justify-center">
          <Logo className="h-8" />
        </div>
      </header>

      <section className="px-2 py-4 pb-32">
        <div className="edunai-card p-5 relative overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-40" />
          <div className="relative animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bracket-tag mb-4">WELCOME BACK</div>
            <h1 className="at-spaced-title text-[30px]">
              Sign in to your<br /><em>HR cockpit.</em>
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your role will load automatically — collaborator, manager or admin.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-3">
              <div className="field">
                <div className="relative">
                  <input id="email" type="email" placeholder=" " value={email} onChange={(e)=>setEmail(e.target.value)} required autoComplete="email" />
                  <label htmlFor="email">Work email</label>
                  <Mail className="absolute right-3 top-3.5 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="field">
                <div className="relative">
                  <input id="password" type="password" placeholder=" " value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={4} autoComplete="current-password" />
                  <label htmlFor="password">Password</label>
                  <Lock className="absolute right-3 top-3.5 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              {err && <div className="text-[11px] text-destructive font-medium">{err}</div>}

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-muted-foreground"><input type="checkbox" className="rounded" /> Remember me</label>
                <a className="text-accent font-bold tracking-[0.15em] uppercase text-[10px]" href="#">Forgot?</a>
              </div>

              <button type="submit" disabled={loading} className="pill-btn solid w-full !pl-5 !pr-1.5 !py-1.5 justify-between mt-3 !text-[11px] tracking-[0.2em] uppercase">
                <span>{loading ? "Just a moment…" : "Sign in"}</span>
                <span className="arrow-circle"><ArrowUpRight className="w-4 h-4" /></span>
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-7">
              <div className="section-label mb-3">demo accounts</div>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((a, i) => {
                  const Icon = ICONS[a.role as Role];
                  return (
                    <button
                      key={a.email}
                      onClick={() => quick(i)}
                      type="button"
                      className="group w-full text-left rounded-2xl border border-border bg-card p-3 flex items-center gap-3 hover:border-foreground transition"
                    >
                      <div className="num-badge !w-10 !h-10 !bg-foreground group-hover:!bg-accent transition">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-bold text-sm leading-tight">{a.name}</div>
                        <div className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground mt-0.5">
                          {ROLE_META[a.role].label} · {a.email}
                        </div>
                      </div>
                      <span className="text-[9px] tracking-[0.22em] uppercase text-accent font-bold">use</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] tracking-[0.18em] uppercase text-center text-muted-foreground mt-4">
                Tap a card to autofill. Password is the first name + 123.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
