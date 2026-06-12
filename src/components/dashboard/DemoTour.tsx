import { useState } from "react";
import { ArrowUpRight, X, Sparkles, BarChart3, Bell, ShieldCheck } from "lucide-react";
import { markTourSeen, type Role, ROLE_META } from "@/lib/auth";

type Step = { icon: typeof Sparkles; tag: string; t: string; d: string };

const COMMON: Step[] = [
  { icon: Sparkles, tag: "WELCOME", t: "Your HR cockpit", d: "Everything you need — assistant, documents, insights — in one mobile-first workspace." },
  { icon: BarChart3, tag: "LIVE DATA", t: "Charts that breathe", d: "Engagement, workload and risk signals refresh as your people activity flows in." },
  { icon: Bell, tag: "ALERTS", t: "Never miss a signal", d: "Open the bell to see what needs your attention — sorted by urgency." },
  { icon: ShieldCheck, tag: "PRIVACY", t: "Built on validated data", d: "Answers come from your validated policies. Sensitive items escalate to humans." },
];

export function DemoTour({ userId, role, onClose }: { userId: string; role: Role; onClose: () => void }) {
  const [i, setI] = useState(0);
  const steps = COMMON;
  const last = i === steps.length - 1;
  const S = steps[i];

  function skip() { markTourSeen(userId); onClose(); }
  function next() { if (last) skip(); else setI(i + 1); }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-foreground/55 backdrop-blur-sm animate-in fade-in duration-300" />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-sm animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500">
          <div className="edunai-card overflow-hidden relative">
            {/* dark hero */}
            <div className="relative px-5 pt-5 pb-6" style={{ background: "#0a0a12" }}>
              <div className="absolute inset-0 grid-bg opacity-20" />
              <div className="relative flex items-start justify-between">
                <div className="bracket-tag !text-white/90">{S.tag}</div>
                <button onClick={skip} className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/10 text-white/80">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="relative mt-6 w-14 h-14 rounded-2xl grid place-items-center text-white" style={{ background: "var(--accent)" }}>
                <S.icon className="w-6 h-6" />
              </div>
              <h2 className="relative font-display font-bold text-white text-2xl tracking-tight mt-4">{S.t}</h2>
              <p className="relative text-white/70 text-sm mt-2 leading-relaxed">{S.d}</p>

              {/* progress dots */}
              <div className="relative flex gap-1.5 mt-5">
                {steps.map((_, k) => (
                  <span
                    key={k}
                    className="h-1 rounded-full transition-all duration-500"
                    style={{
                      width: k === i ? 28 : 14,
                      background: k <= i ? "var(--accent)" : "rgba(255,255,255,.2)",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="px-5 py-4">
              <div className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground">
                Signed in as <span className="text-foreground font-bold">{ROLE_META[role].label}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={skip} className="pill-btn flex-1 justify-center !py-2.5 !text-[10px] tracking-[0.22em] uppercase">
                  Skip demo
                </button>
                <button onClick={next} className="pill-btn solid flex-1 justify-between !pl-4 !pr-1.5 !py-1.5 !text-[10px] tracking-[0.22em] uppercase">
                  {last ? "Enter cockpit" : `Next · 0${i + 2}`}
                  <span className="arrow-circle"><ArrowUpRight className="w-3.5 h-3.5" /></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
