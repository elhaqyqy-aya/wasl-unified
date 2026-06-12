import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/dashboard/Bits";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { advanceOnboarding, getMyOnboarding } from "@/lib/workflows.functions";

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
  const qc = useQueryClient();
  const getFn = useServerFn(getMyOnboarding);
  const advFn = useServerFn(advanceOnboarding);
  const { data } = useQuery({ queryKey: ["my-onb"], queryFn: () => getFn() });
  const ob = data?.onboarding;
  const total = PLAN.flatMap(p => p.items).length;
  const pct = ob?.progress ?? 0;
  const done = Math.round((pct / 100) * total);
  const advance = useMutation({
    mutationFn: (progress: number) => advFn({ data: { id: ob!.id, progress, current_step: stepNameAt(progress) } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-onb"] }),
  });

  return (
    <div className="space-y-6">
      <PageHeader kicker="30-day plan" title="Your onboarding" subtitle="A guided path to feel at home — built for your role and team." />
      <Panel title={`Progress · ${done}/${total} steps completed`}>
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: "var(--grad-brand)" }} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">{ob?.current_step ?? "—"}</span>
          <span className="text-xs text-muted-foreground">{pct}%</span>
        </div>
        {ob && pct < 100 && (
          <button onClick={() => advance.mutate(Math.min(100, pct + 10))} className="pill-btn accent mt-3 !text-[10px] !py-2 !px-4 tracking-[0.2em] uppercase">
            Mark next step complete
          </button>
        )}
      </Panel>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLAN.map((week) => (
          <div key={week.w} className="glow-card rounded-2xl p-5">
            <div className="font-semibold mb-3">{week.w}</div>
            {week.items.map((it, i) => {
              const globalIdx = PLAN.slice(0, PLAN.indexOf(week)).flatMap(p => p.items).length + i;
              const status = globalIdx < done ? "done" : globalIdx === done ? "doing" : "todo";
              const I = status === "done" ? CheckCircle2 : status === "doing" ? Clock : Circle;
              const c = status === "done" ? "text-success" : status === "doing" ? "text-accent" : "text-muted-foreground";
              return (
                <div key={i} className="flex items-center gap-2 py-2 text-sm">
                  <I className={`w-4 h-4 ${c}`} />
                  <span className={status === "done" ? "line-through text-muted-foreground" : ""}>{it.t}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function stepNameAt(progress: number) {
  const items = PLAN.flatMap(p => p.items);
  const idx = Math.min(items.length - 1, Math.floor((progress / 100) * items.length));
  return items[idx].t;
}
