import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/dashboard/Bits";
import { CheckCircle2, Circle, Clock, Sparkles, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { advanceOnboarding, getMyOnboarding } from "@/lib/workflows.functions";
import { generateMyOnboardingPlan } from "@/lib/onboarding-ai.functions";
import { useMemo } from "react";

export const Route = createFileRoute("/dashboard/collab/onboarding")({
  component: Onboarding,
});

const FALLBACK_PLAN = [
  { w: "Week 1", items: [
    "Meet your team",
    "Setup laptop & accounts",
    "Read culture handbook",
    "1:1 with manager",
  ]},
  { w: "Week 2", items: [
    "Shadow a senior colleague",
    "Complete security training",
    "Ship first deliverable",
  ]},
  { w: "Week 3", items: [
    "Cross-team intro round",
    "Pick a buddy",
  ]},
  { w: "Week 4", items: [
    "30-day feedback",
    "Set first OKRs",
  ]},
];

function Onboarding() {
  const qc = useQueryClient();
  const getFn = useServerFn(getMyOnboarding);
  const advFn = useServerFn(advanceOnboarding);
  const planFn = useServerFn(generateMyOnboardingPlan);
  const { data } = useQuery({ queryKey: ["my-onb"], queryFn: () => getFn() });
  const ob = data?.onboarding;
  const { data: planData, isFetching: planLoading } = useQuery({
    queryKey: ["my-onb-plan"],
    queryFn: () => planFn(),
    staleTime: 30 * 60 * 1000,
  });
  const PLAN = useMemo(() => planData?.plan?.weeks ?? FALLBACK_PLAN, [planData]);
  const total = PLAN.flatMap(p => p.items).length;
  const pct = ob?.progress ?? 0;
  const done = Math.round((pct / 100) * total);
  const advance = useMutation({
    mutationFn: (progress: number) => advFn({ data: { id: ob!.id, progress, current_step: stepNameAt(progress, PLAN) } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-onb"] }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="30-day plan"
        title="Your onboarding"
        subtitle={planData?.source === "ai" ? "AI-personalised for your role & team." : "A guided path to feel at home — built for your role and team."}
        right={planLoading ? <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Personalising</span>
               : planData?.source === "ai" ? <span className="text-[10px] uppercase tracking-[0.2em] text-accent inline-flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI plan</span> : null}
      />
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
                  <span className={status === "done" ? "line-through text-muted-foreground" : ""}>{it}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function stepNameAt(progress: number, plan: { w: string; items: string[] }[]) {
  const items = plan.flatMap(p => p.items);
  const idx = Math.min(items.length - 1, Math.floor((progress / 100) * items.length));
  return items[idx];
}
