import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/Bits";
import { Modal, Toast } from "@/components/Modal";
import { Bell, Heart, Calendar, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/manager/alerts")({
  component: Alerts,
});

const SEED = [
  { id: "1", i: Heart, t: "Burnout signal · Yasmine", d: "Sleep score down, after-hour messages up. Suggested 1:1.", lv: "critical" as const },
  { id: "2", i: Bell, t: "Disengagement risk · Omar", d: "Engagement dropped 12% over 3 weeks.", lv: "high" as const },
  { id: "3", i: Calendar, t: "Probation review due · Mehdi", d: "End of probation in 11 days. Schedule feedback.", lv: "medium" as const },
];

type Alert = typeof SEED[number];

function Alerts() {
  const [alerts, setAlerts] = useState(SEED);
  const [planFor, setPlanFor] = useState<Alert | null>(null);
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function dismiss(id: string) {
    setAlerts(a => a.filter(x => x.id !== id));
    setToast("Alert dismissed");
  }
  function submitPlan(e: React.FormEvent) {
    e.preventDefault();
    if (!planFor) return;
    setAlerts(a => a.filter(x => x.id !== planFor.id));
    setPlanFor(null);
    setNote(""); setDate("");
    setToast("Action plan scheduled");
  }

  return (
    <div className="space-y-6">
      <PageHeader kicker="Inbox" title="Your alerts" subtitle="Predictive signals and reminders curated for you." />
      <div className="space-y-3">
        {alerts.map(a => (
          <div key={a.id} className="edunai-card p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl grid place-items-center text-white shrink-0" style={{ background: "var(--grad-brand)" }}>
              <a.i className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-semibold">{a.t}</h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  a.lv === "critical" ? "bg-destructive/15 text-destructive" :
                  a.lv === "high" ? "bg-warning/20 text-warning" :
                  "bg-accent/15 text-accent"}`}>{a.lv}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{a.d}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setPlanFor(a)} className="pill-btn accent !text-[10px] !py-1.5 !px-3 tracking-[0.2em] uppercase">Plan action</button>
                <button onClick={() => dismiss(a.id)} className="pill-btn !text-[10px] !py-1.5 !px-3 tracking-[0.2em] uppercase">Dismiss</button>
              </div>
            </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="text-center py-10">
            <CheckCircle2 className="w-10 h-10 text-success mx-auto mb-3"/>
            <div className="font-display font-bold text-lg">All clear</div>
            <div className="text-sm text-muted-foreground mt-1">No active alerts in your inbox.</div>
          </div>
        )}
      </div>

      <Modal open={!!planFor} onClose={() => setPlanFor(null)} kicker="ACTION PLAN" title={planFor?.t ?? ""}
        footer={
          <button form="plan-form" type="submit" className="pill-btn accent w-full justify-center !py-2.5 !text-[11px] tracking-[0.2em] uppercase">
            Schedule plan
          </button>
        }>
        {planFor && (
          <form id="plan-form" onSubmit={submitPlan} className="space-y-3">
            <p className="text-xs text-muted-foreground">{planFor.d}</p>
            <div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-muted-foreground mb-2 font-bold">Suggested actions</div>
              <div className="grid grid-cols-1 gap-2">
                {["Schedule a 1:1","Adjust workload","Propose internal mobility","Refer to QVT specialist"].map(s => (
                  <button type="button" key={s} onClick={() => setNote(s)}
                    className={`text-left rounded-xl border px-3 py-2 text-sm transition ${note===s ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="field"><div className="relative">
              <input id="p-date" type="date" placeholder=" " value={date} onChange={e=>setDate(e.target.value)} required />
              <label htmlFor="p-date">Target date</label>
            </div></div>
            <div className="field"><div className="relative">
              <textarea id="p-note" rows={3} placeholder=" " value={note} onChange={e=>setNote(e.target.value)} className="resize-none" />
              <label htmlFor="p-note">Notes</label>
            </div></div>
          </form>
        )}
      </Modal>

      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}

