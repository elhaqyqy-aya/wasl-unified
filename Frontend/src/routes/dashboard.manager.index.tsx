import { createFileRoute, Link } from "@tanstack/react-router";
import { Panel, Stat, AreaChart, MiniBars } from "@/components/dashboard/Bits";
import { ExecutiveHero } from "@/components/dashboard/ExecutiveHero";
import { TiltCard, Reveal, Parallax, GlowRing } from "@/components/dashboard/Wow";
import { TrendingDown, TrendingUp, Heart, Users, AlertTriangle, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/dashboard/manager/")({
  component: ManagerHome,
});

function ManagerHome() {
  return (
    <div className="space-y-5">
      <Reveal>
        <ExecutiveHero
          role="manager"
          kicker="Team Command"
          name="Yasmine El Idrissi · Manager"
          headline={<>14 people.<br/><span className="text-white/55 font-light italic">2 signals need you.</span></>}
          metrics={[
            { label: "Engagement", value: "84%", trend: "+2.1 pts" },
            { label: "Workload", value: "78%", trend: "Watch" },
            { label: "Risk signals", value: "2", trend: "Act now" },
          ]}
          sparkline={[62, 65, 68, 70, 72, 69, 74, 78, 80, 82, 84, 84]}
          primary={{ label: "Review alerts", to: "/dashboard/manager/alerts" }}
          secondary={{ label: "See team", to: "/dashboard/manager/team" }}
        />
      </Reveal>

      <div className="grid grid-cols-2 gap-2" style={{ perspective: 1200 }}>
        {[
          { l: "Team size", v: "14", d: undefined, i: Users, a: true },
          { l: "Engagement", v: "84%", d: "+2.1", i: Heart, a: false },
          { l: "Workload", v: "78%", d: "watch", i: TrendingUp, a: false },
          { l: "Risk signals", v: "2", d: "act now", i: AlertTriangle, a: false },
        ].map((s, idx) => (
          <Reveal key={s.l} delay={idx * 0.05}>
            <TiltCard><Stat label={s.l} value={s.v} delta={s.d} accent={s.a} icon={<s.i className="w-3.5 h-3.5" />} /></TiltCard>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <Panel label="12 WEEKS" title="Engagement trend">
          <AreaChart data={[62, 65, 68, 70, 72, 69, 74, 78, 80, 82, 84, 84]} />
        </Panel>
      </Reveal>

      <Reveal>
        <Panel label="WEEKLY" title="Tickets shipped">
          <MiniBars data={[18, 22, 19, 28, 24, 31, 27, 34, 30, 38, 42, 40]} />
        </Panel>
      </Reveal>

      <Reveal>
        <Panel label="LOAD" title="Workload by member">
          {[
            { n: "Yasmine", p: 92, c: "var(--destructive)" },
            { n: "Omar", p: 78, c: "var(--warning)" },
            { n: "Karim", p: 64, c: "var(--accent)" },
            { n: "Hind", p: 71, c: "var(--accent)" },
            { n: "Mehdi", p: 55, c: "var(--success)" },
          ].map(x => (
            <div key={x.n} className="mb-3 last:mb-0">
              <div className="flex justify-between text-xs mb-1.5"><span className="font-semibold">{x.n}</span><span className="text-muted-foreground tracking-wider">{x.p}%</span></div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${x.p}%`, background: x.c }} />
              </div>
            </div>
          ))}
        </Panel>
      </Reveal>

      <Reveal>
        <Panel label="ACTIONS" title="Recommended next">
          {[
            { i: Heart, t: "1:1 with Yasmine — burnout signal", c: "var(--destructive)" },
            { i: TrendingDown, t: "Redistribute 2 tickets from Omar", c: "var(--warning)" },
            { i: TrendingUp, t: "Recognize Mehdi's onboarding milestone", c: "var(--success)" },
          ].map((x, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
              <div className="w-8 h-8 rounded-lg grid place-items-center text-white shrink-0" style={{ background: x.c }}>
                <x.i className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm flex-1">{x.t}</span>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </Panel>
      </Reveal>

      <Reveal>
        <Parallax offset={20}>
          <Panel label="RETENTION" title="Predicted 90-day">
            <div className="flex items-center gap-5">
              <GlowRing value={94} label="stay" color="#22c55e" />
              <div className="flex-1">
                <div className="text-sm font-semibold">94% retention predicted</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Strong signal. One member shows attrition risk — open Insights for the scenario plan.
                </p>
              </div>
            </div>
          </Panel>
        </Parallax>
      </Reveal>
    </div>
  );
}
