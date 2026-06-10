import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/dashboard/Bits";
import { CheckCircle2, Circle, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard/collab/onboarding")({
  component: Onboarding,
});

const PLAN = [
  { w: "Week 1", items: [
    { t: "Meet your team", s: "done" },
    { t: "Setup laptop & accounts", s: "done" },
    { t: "Read culture handbook", s: "done" },
    { t: "1:1 with manager", s: "done" },
  ]},
  { w: "Week 2", items: [
    { t: "Shadow a senior engineer", s: "done" },
    { t: "Complete security training", s: "doing" },
    { t: "Ship first PR", s: "doing" },
  ]},
  { w: "Week 3", items: [
    { t: "Cross-team intro round", s: "todo" },
    { t: "Pick a buddy", s: "todo" },
  ]},
  { w: "Week 4", items: [
    { t: "30-day feedback", s: "todo" },
    { t: "Set first OKRs", s: "todo" },
  ]},
];

function Onboarding() {
  const total = PLAN.flatMap(p => p.items).length;
  const done = PLAN.flatMap(p => p.items).filter(i => i.s === "done").length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="space-y-6">
      <PageHeader kicker="30-day plan" title="Your onboarding" subtitle="A guided path to feel at home — built for your role and team." />
      <Panel title={`Progress · ${done}/${total} steps completed`}>
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: "var(--grad-brand)" }} />
        </div>
        <div className="text-right text-xs mt-2 text-muted-foreground">{pct}%</div>
      </Panel>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLAN.map((week) => (
          <div key={week.w} className="glow-card rounded-2xl p-5">
            <div className="font-semibold mb-3">{week.w}</div>
            {week.items.map((it, i) => {
              const I = it.s === "done" ? CheckCircle2 : it.s === "doing" ? Clock : Circle;
              const c = it.s === "done" ? "text-success" : it.s === "doing" ? "text-accent" : "text-muted-foreground";
              return (
                <div key={i} className="flex items-center gap-2 py-2 text-sm">
                  <I className={`w-4 h-4 ${c}`} />
                  <span className={it.s === "done" ? "line-through text-muted-foreground" : ""}>{it.t}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
