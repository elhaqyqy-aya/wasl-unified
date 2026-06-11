import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Stat } from "@/components/dashboard/Bits";
import { ShieldAlert, Activity, Eye, Bot, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getRecentAuditLogs, getAlerts } from "@/lib/dashboard.functions";

export const Route = createFileRoute("/dashboard/admin/security")({
  component: Security,
});

function iconFor(action: string) {
  if (action.includes("suspicious")) return ShieldAlert;
  if (action.startsWith("ai.")) return Bot;
  if (action.includes("document")) return FileText;
  if (action.includes("view") || action.includes("read")) return Eye;
  return Activity;
}

function ago(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function Security() {
  const fetchAudit = useServerFn(getRecentAuditLogs);
  const fetchAlerts = useServerFn(getAlerts);
  const audit = useQuery({ queryKey: ["audit"], queryFn: () => fetchAudit(), refetchInterval: 15000 });
  const alerts = useQuery({ queryKey: ["alerts"], queryFn: () => fetchAlerts(), refetchInterval: 15000 });

  const logs = audit.data ?? [];
  const alertRows = alerts.data ?? [];

  const counts = alertRows.reduce(
    (acc, a) => {
      acc[a.severity] = (acc[a.severity] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const week = Date.now() - 7 * 86400000;
  const critical7d = alertRows.filter((a) => a.severity === "critical" && new Date(a.created_at).getTime() > week).length;
  const flaggedAi = logs.filter((l) => l.action === "ai.chat.suspicious").length;

  return (
    <div className="space-y-6">
      <PageHeader kicker="Security" title="Threats, anomalies & audit" subtitle="Live signals from access controls and the AI behavior watcher." />
      <div className="grid sm:grid-cols-3 gap-4">
        <Stat label="Critical alerts (7d)" value={String(critical7d)} accent />
        <Stat label="Flagged AI queries" value={String(flaggedAi)} delta="last 50 events" />
        <Stat label="Audit events" value={String(logs.length)} delta="recent" />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title="Incident classification">
          {([
            { lv: "critical", c: "bg-destructive" },
            { lv: "high", c: "bg-warning" },
            { lv: "medium", c: "bg-accent" },
            { lv: "low", c: "bg-success" },
          ] as const).map((x) => {
            const n = counts[x.lv] ?? 0;
            const max = Math.max(1, ...Object.values(counts));
            return (
              <div key={x.lv} className="mb-3 last:mb-0">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="capitalize font-medium">{x.lv}</span><span className="text-muted-foreground">{n}</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className={`h-full ${x.c} transition-all duration-700`} style={{ width: `${(n / max) * 100}%` }} />
                </div>
              </div>
            );
          })}
          {alertRows.length === 0 && !alerts.isLoading && (
            <div className="text-xs text-muted-foreground mt-2">No alerts yet. They appear automatically when the AI detects suspicious queries.</div>
          )}
        </Panel>
        <Panel title="Live audit feed">
          {audit.isLoading && <div className="text-xs text-muted-foreground">Loading…</div>}
          {logs.slice(0, 12).map((e) => {
            const Icon = iconFor(e.action);
            const meta = (e.metadata ?? {}) as Record<string, unknown>;
            const preview = (meta.prompt_preview as string | undefined) ?? e.entity ?? "";
            return (
              <div key={e.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                <Icon className={`w-4 h-4 ${e.action.includes("suspicious") ? "text-destructive" : "text-accent"}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{e.action}</div>
                  {preview && <div className="text-xs text-muted-foreground truncate">{preview}</div>}
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{ago(e.created_at)}</div>
              </div>
            );
          })}
          {!audit.isLoading && logs.length === 0 && (
            <div className="text-xs text-muted-foreground">No activity logged yet. Try the AI assistant — every interaction is audited here.</div>
          )}
        </Panel>
      </div>
    </div>
  );
}
