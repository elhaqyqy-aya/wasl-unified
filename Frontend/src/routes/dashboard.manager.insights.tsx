import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel, MiniBars, Stat } from "@/components/dashboard/Bits";

export const Route = createFileRoute("/dashboard/manager/insights")({
  component: Insights,
});

function Insights() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="Predictive" title="Team insights" subtitle="What the data says — and what to do next." />
      <div className="grid sm:grid-cols-3 gap-4">
        <Stat label="Predicted turnover (90d)" value="6%" delta="↓ improving" accent />
        <Stat label="Absenteeism" value="3.2%" delta="stable" />
        <Stat label="Skills gap" value="Backend" delta="hire signal" />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <Panel title="Engagement vs workload">
          <MiniBars data={[70,72,68,75,80,78,82,79,84,86,84,88]} />
          <div className="text-xs text-muted-foreground mt-3">Engagement holds despite rising workload — likely thanks to recent recognition program.</div>
        </Panel>
        <Panel title="Scenarios">
          {[
            { t: "Redistribute Yasmine's load", o: "Burnout risk ↓ 38%, delivery delay +3d" },
            { t: "Hire 1 backend engineer", o: "Workload ↓ 12% across team within 2 sprints" },
            { t: "Skip Q2 hackathon", o: "Engagement ↓ ~5pt, time saved 80h" },
          ].map((s, i) => (
            <div key={i} className="py-3 border-b border-border last:border-0">
              <div className="font-medium text-sm">{s.t}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.o}</div>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
