import { createFileRoute } from "@tanstack/react-router";
import { Panel, Stat, AreaChart, MiniBars } from "@/components/dashboard/Bits";
import { ExecutiveHero } from "@/components/dashboard/ExecutiveHero";
import { TiltCard, Reveal, GlowRing } from "@/components/dashboard/Wow";
import { Users, FileText, Bot, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/dashboard/rh/")({
  component: RHHome,
});

function RHHome() {
  return (
    <div className="space-y-5">
      <Reveal>
        <ExecutiveHero
          role="rh"
          kicker="HR Cockpit · Live"
          name="Sara RAFIK · HR Team"
          headline={<>People operations,<br/><span className="text-white/55 font-light italic">augmented.</span></>}
          metrics={[
            { label: "Open tickets", value: "18", trend: "-3 today" },
            { label: "Docs queued", value: "12", trend: "AI-prefilled" },
            { label: "Onboardings", value: "4", trend: "on track" },
          ]}
          sparkline={[30, 42, 38, 55, 49, 60, 58, 72, 68, 80, 78, 84, 90, 86]}
          primary={{ label: "Open queue", to: "/dashboard/rh/documents" }}
          secondary={{ label: "Workflows", to: "/dashboard/rh/workflows" }}
        />
      </Reveal>

      <div className="grid grid-cols-2 gap-2">
        {[
          { l: "Headcount", v: "1,284", d: undefined, i: Users, a: true },
          { l: "Docs / wk", v: "143", d: "+12%", i: FileText, a: false },
          { l: "AI tickets", v: "9.4k", d: "+8.2%", i: Bot, a: false },
          { l: "Risk flags", v: "7", d: "2 high", i: AlertTriangle, a: false },
        ].map((s, idx) => (
          <Reveal key={s.l} delay={idx * 0.05}>
            <TiltCard><Stat label={s.l} value={s.v} delta={s.d} accent={s.a} icon={<s.i className="w-3.5 h-3.5" />} /></TiltCard>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <Panel label="14 DAYS" title="HR tickets resolved">
          <AreaChart data={[12, 18, 22, 19, 28, 31, 35, 30, 38, 42, 45, 40, 48, 52]} color="#16a34a" />
        </Panel>
      </Reveal>

      <Reveal>
        <Panel label="DOCUMENTS" title="Generation pipeline">
          <MiniBars data={[8, 14, 12, 18, 22, 19, 26, 31, 28, 34, 30, 38]} />
        </Panel>
      </Reveal>

      <Reveal>
        <Panel label="WORKFLOWS" title="Active journeys">
          {[
            { t: "Onboarding · M. Ziani", p: 23, d: "Day 7 / 30" },
            { t: "Onboarding · L. Karim", p: 56, d: "Day 17 / 30" },
            { t: "Offboarding · K. Naciri", p: 88, d: "Step 7 / 8" },
            { t: "Onboarding · F. Idrissi", p: 10, d: "Day 3 / 30" },
          ].map(x => (
            <div key={x.t} className="py-3 border-b border-border last:border-0">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-semibold">{x.t}</span>
                <span className="text-muted-foreground text-xs">{x.d}</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${x.p}%`, background: "var(--accent)" }} />
              </div>
            </div>
          ))}
        </Panel>
      </Reveal>

      <Reveal>
        <Panel label="AI SUPERVISION" title="Assistant health">
          <div className="flex items-center gap-5">
            <GlowRing value={87} label="quality" color="#22c55e" />
            <div className="flex-1">
              <div className="text-sm font-semibold">Conversations · 7d</div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                94% answered autonomously · 6% escalated to a human RH referent. No policy violations detected.
              </p>
            </div>
          </div>
        </Panel>
      </Reveal>
    </div>
  );
}
