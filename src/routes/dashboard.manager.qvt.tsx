import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader, Panel, Stat } from "@/components/dashboard/Bits";
import { Toast } from "@/components/Modal";
import { Activity, Loader2, ShieldAlert, TrendingDown, HeartHandshake } from "lucide-react";
import { getQvtSnapshot, runRiskScan } from "@/lib/workflows.functions";

export const Route = createFileRoute("/dashboard/manager/qvt")({ component: Qvt });

function Qvt() {
  const qc = useQueryClient();
  const [toast, setToast] = useState<string | null>(null);
  const getFn = useServerFn(getQvtSnapshot);
  const runFn = useServerFn(runRiskScan);
  const { data, isLoading } = useQuery({ queryKey: ["qvt"], queryFn: () => getFn(), refetchInterval: 30000 });
  const run = useMutation({
    mutationFn: () => runFn({}),
    onSuccess: ({ inserted }) => { qc.invalidateQueries({ queryKey: ["qvt"] }); setToast(`${inserted} new risk alert(s)`); },
    onError: (e: any) => setToast(e?.message ?? "Failed"),
  });

  const s = data;

  return (
    <div className="space-y-6">
      <PageHeader kicker="QVT · Predictive" title="Wellbeing & risk" subtitle="Live cross-signal scan: absences × engagement × workload."
        right={
          <button onClick={() => run.mutate()} disabled={run.isPending} className="pill-btn accent !text-[10px] !py-1.5 !px-3 tracking-[0.2em] uppercase">
            {run.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />} Run scan
          </button>
        } />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Avg engagement (30d)" value={`${s?.avgEngagement ?? "—"}`} accent />
        <Stat label="Absences (30d)" value={`${s?.totalAbsences ?? "—"}`} />
        <Stat label="At-risk people" value={`${s?.atRiskCount ?? "—"}`} />
        <Stat label="Open alerts" value={`${s?.activeAlerts ?? "—"}`} />
      </div>
      <Panel title="Recent risk alerts">
        {isLoading && <div className="text-xs text-muted-foreground">Loading…</div>}
        {!isLoading && (!s?.recentAlerts || s.recentAlerts.length === 0) && (
          <div className="text-xs text-muted-foreground py-4">No alerts yet. Run a scan to generate new ones from current data.</div>
        )}
        {s?.recentAlerts?.map((a: any) => {
          const Icon = a.severity === "high" || a.severity === "critical" ? ShieldAlert : a.title.includes("decline") ? TrendingDown : HeartHandshake;
          return (
            <div key={a.id} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
              <div className={`w-9 h-9 rounded-xl grid place-items-center text-white ${
                a.severity === "critical" ? "bg-destructive" :
                a.severity === "high" ? "bg-warning" :
                a.severity === "medium" ? "bg-accent" : "bg-success"
              }`}><Icon className="w-4 h-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-sm">{a.title}</div>
                  <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.description}</div>
              </div>
            </div>
          );
        })}
      </Panel>
      <Panel title="How this works">
        <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
          <li>The scan reads 30 days of absences and engagement scores per collaborator.</li>
          <li>Burnout risk = 3+ absences <em>and</em> avg engagement &lt; 55.</li>
          <li>Engagement decline = score drop &gt; 10 points over the last 2 weeks vs the 2 weeks before.</li>
          <li>Alerts older than 14 days are not duplicated.</li>
        </ul>
      </Panel>
      <Toast msg={toast} onDone={() => setToast(null)} />
    </div>
  );
}