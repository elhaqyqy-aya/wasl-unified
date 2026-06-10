import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, Stat } from "@/components/dashboard/Bits";
import { ShieldAlert, Activity, Eye } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin/security")({
  component: Security,
});

function Security() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Security" title="Threats, anomalies & audit" subtitle="Live signals from access controls and the AI behavior watcher." />
      <div className="grid sm:grid-cols-3 gap-4">
        <Stat label="Critical alerts (7d)" value="3" delta="-2 vs last week" accent />
        <Stat label="Blocked AI queries" value="184" delta="contained" />
        <Stat label="Audit events / hour" value="612" />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title="Incident classification">
          {[
            { lv: "critical", n: 3, c: "bg-destructive" },
            { lv: "high", n: 11, c: "bg-warning" },
            { lv: "medium", n: 27, c: "bg-accent" },
            { lv: "low", n: 142, c: "bg-success" },
          ].map(x => (
            <div key={x.lv} className="mb-3 last:mb-0">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="capitalize font-medium">{x.lv}</span><span className="text-muted-foreground">{x.n}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full ${x.c} transition-all duration-700`} style={{ width: `${Math.min(100, x.n * 4)}%` }} />
              </div>
            </div>
          ))}
        </Panel>
        <Panel title="Live audit feed">
          {[
            { i: ShieldAlert, t: "Attempted access · payroll dataset", u: "u-482", time: "now" },
            { i: Activity, t: "AI policy override request", u: "u-203", time: "3m" },
            { i: Eye, t: "Document exported · contract.pdf", u: "u-091", time: "12m" },
            { i: Activity, t: "Unusual login geo · Casablanca", u: "u-377", time: "34m" },
            { i: ShieldAlert, t: "Prompt injection detected", u: "u-512", time: "1h" },
          ].map((e, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
              <e.i className="w-4 h-4 text-accent" />
              <div className="flex-1 text-sm font-medium">{e.t}</div>
              <div className="text-xs text-muted-foreground">{e.u} · {e.time}</div>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
