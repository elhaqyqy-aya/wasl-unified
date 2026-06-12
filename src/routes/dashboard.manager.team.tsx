import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/dashboard/Bits";
import { Mail, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard/manager/team")({
  component: Team,
});

const TEAM = [
  { n: "Yasmine AMRI", role: "Senior Engineer", since: "3y", eng: 62, wl: 92, risk: "high" },
  { n: "Omar El Idrissi", role: "Engineer", since: "2y", eng: 81, wl: 78, risk: "medium" },
  { n: "Karim Naciri", role: "Engineer", since: "1y", eng: 86, wl: 64, risk: "low" },
  { n: "Hind Alaoui", role: "Designer", since: "4y", eng: 79, wl: 71, risk: "low" },
  { n: "Mehdi Ziani", role: "Junior Engineer", since: "3m", eng: 90, wl: 55, risk: "low" },
];

function Team() {
  return (
    <div className="space-y-6">
      <PageHeader kicker="People" title="My team" subtitle="A human view of your direct reports — engagement, workload and risk." />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEAM.map((m) => (
          <div key={m.n} className="glow-card rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full grid place-items-center text-white font-semibold" style={{ background: "var(--grad-brand)" }}>{m.n.slice(0,1)}</div>
              <div className="flex-1">
                <div className="font-semibold">{m.n}</div>
                <div className="text-xs text-muted-foreground">{m.role} · {m.since}</div>
              </div>
              <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                m.risk === "high" ? "bg-destructive/15 text-destructive" :
                m.risk === "medium" ? "bg-warning/20 text-warning" :
                "bg-success/15 text-success"}`}>{m.risk}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="bg-secondary/60 rounded-lg p-3">
                <div className="text-muted-foreground mb-1">Engagement</div>
                <div className="font-bold text-base">{m.eng}%</div>
              </div>
              <div className="bg-secondary/60 rounded-lg p-3">
                <div className="text-muted-foreground mb-1">Workload</div>
                <div className="font-bold text-base">{m.wl}%</div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="btn-ghost flex-1 justify-center text-xs"><MessageCircle className="w-3.5 h-3.5"/> Chat</button>
              <button className="btn-ghost flex-1 justify-center text-xs"><Mail className="w-3.5 h-3.5"/> Email</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
