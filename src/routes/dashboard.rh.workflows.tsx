import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Panel } from "@/components/dashboard/Bits";
import { Modal, Toast } from "@/components/Modal";
import { Compass, LogOut, CheckCircle2, Clock, Play } from "lucide-react";

export const Route = createFileRoute("/dashboard/rh/workflows")({
  component: Workflows,
});

type Wf = { kind: "on" | "off"; who: string; step: string; progress: number; days: string };
const WORKFLOWS: Wf[] = [
  { kind: "on", who: "Mehdi Ziani", step: "Welcome kit · payroll setup", progress: 23, days: "Day 7 / 30" },
  { kind: "on", who: "Lina Karim", step: "Team rituals · first 1:1", progress: 56, days: "Day 17 / 30" },
  { kind: "off", who: "Karim Naciri", step: "Knowledge transfer", progress: 88, days: "Step 7 / 8" },
  { kind: "on", who: "Fatima Idrissi", step: "Compliance · IT access", progress: 10, days: "Day 3 / 30" },
];

function Workflows() {
  const [sel, setSel] = useState<Wf | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <PageHeader kicker="Workflows" title="Onboarding & offboarding" subtitle="AI agents drive each step. You stay in control." />

      <div className="space-y-3">
        {WORKFLOWS.map(w => (
          <button key={w.who} onClick={() => setSel(w)} className="edunai-card p-4 w-full text-left flex items-center gap-3 hover:border-foreground transition">
            <div className="w-11 h-11 rounded-xl grid place-items-center text-white shrink-0" style={{ background: w.kind === "on" ? "var(--grad-brand)" : "#1d1d1d" }}>
              {w.kind === "on" ? <Compass className="w-5 h-5"/> : <LogOut className="w-5 h-5"/>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="font-display font-bold text-sm tracking-tight">{w.who}</div>
                <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground">{w.days}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 truncate">{w.step}</div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden mt-2">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${w.progress}%`, background: "var(--accent)" }} />
              </div>
            </div>
          </button>
        ))}
      </div>

      <Modal open={!!sel} onClose={() => setSel(null)} kicker={sel?.kind === "on" ? "ONBOARDING" : "OFFBOARDING"} title={sel?.who ?? ""}
        footer={
          <div className="flex gap-2">
            <button onClick={() => { setSel(null); setToast("Workflow paused"); }} className="pill-btn flex-1 justify-center !py-2.5 !text-[10px] tracking-[0.2em] uppercase">Pause</button>
            <button onClick={() => { setSel(null); setToast("Next step started"); }} className="pill-btn accent flex-1 justify-center !py-2.5 !text-[10px] tracking-[0.2em] uppercase">
              <Play className="w-3.5 h-3.5"/> Next step
            </button>
          </div>
        }>
        {sel && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">{sel.step}</div>
            <ul className="space-y-2">
              {[
                { ok: true, t: "Welcome email · sent" },
                { ok: true, t: "IT access provisioned" },
                { ok: false, t: "Manager 1:1 scheduled" },
                { ok: false, t: "Compliance module" },
                { ok: false, t: "Mentor assigned" },
              ].map((s, i) => (
                <li key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0 text-sm">
                  {s.ok ? <CheckCircle2 className="w-4 h-4 text-success"/> : <Clock className="w-4 h-4 text-muted-foreground"/>}
                  <span className={s.ok ? "text-muted-foreground line-through" : ""}>{s.t}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>

      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}
