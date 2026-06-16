import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Panel } from "@/components/dashboard/Bits";
import { Heart, Activity, AlertTriangle, Stethoscope, Flame, ShieldAlert } from "lucide-react";
import { getMedicalSnapshot } from "@/lib/medical.functions";

export const Route = createFileRoute("/dashboard/rh/medical")({ component: Medical });

function Stat({ icon: Icon, label, value, sub, tone = "default" }: { icon: any; label: string; value: string | number; sub?: string; tone?: "default" | "warn" | "danger" | "good" }) {
  const colors = { default: "var(--accent)", warn: "#f59e0b", danger: "#dc2626", good: "#16a34a" } as const;
  return (
    <div className="edunai-card p-3">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl grid place-items-center text-white" style={{ background: colors[tone] }}><Icon className="w-4 h-4"/></div>
        <div className="bracket-tag">{label}</div>
      </div>
      <div className="font-display font-bold text-2xl mt-2">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Medical() {
  const fn = useServerFn(getMedicalSnapshot);
  const { data, isLoading, error } = useQuery({ queryKey: ["medical"], queryFn: () => fn(), refetchInterval: 60000 });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (error) return <div className="text-sm text-red-600">{(error as Error).message}</div>;

  return (
    <div className="space-y-6">
      <PageHeader kicker="Occupational health" title="Medical & QVT" subtitle="Aggregated wellbeing signals from absences, engagement pulses and AI escalations (last 90 days)." />
      <div className="grid grid-cols-2 gap-2">
        <Stat icon={Stethoscope} label="Sick days (90d)" value={data!.sickDays} tone="warn" />
        <Stat icon={Activity} label="All absences" value={data!.totalAbsences} />
        <Stat icon={Heart} label="Avg engagement" value={`${data!.avgEngagement}/100`} tone={data!.avgEngagement < 60 ? "danger" : "good"} />
        <Stat icon={Flame} label="Burnout candidates" value={data!.burnoutCandidates} tone={data!.burnoutCandidates > 0 ? "danger" : "good"} sub="≥3 absences + engagement <55" />
      </div>

      <Panel title="Active alerts">
        {data!.recentAlerts.length === 0 ? <p className="text-sm text-muted-foreground">No alerts.</p> : (
          <div className="divide-y divide-border/60">
            {data!.recentAlerts.map((a: any) => (
              <div key={a.id} className="py-2 flex items-start gap-2">
                <AlertTriangle className={`w-4 h-4 mt-0.5 ${a.severity === "critical" || a.severity === "high" ? "text-red-600" : a.severity === "medium" || a.severity === "warning" ? "text-amber-600" : "text-muted-foreground"}`}/>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{a.title}</div>
                  {a.description && <div className="text-xs text-muted-foreground line-clamp-2">{a.description}</div>}
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{a.severity} · {new Date(a.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="AI escalations to a human">
        {data!.escalations.length === 0 ? <p className="text-sm text-muted-foreground">No sensitive requests pending.</p> : (
          <div className="space-y-2">
            {data!.escalations.map((e: any) => (
              <div key={e.id} className="border border-border/70 rounded-xl p-3 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5"/>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold capitalize">{e.topic.replace("_", " ")}</div>
                  <div className="text-xs text-muted-foreground italic line-clamp-2">"{e.prompt_excerpt}"</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{e.status} · {new Date(e.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}