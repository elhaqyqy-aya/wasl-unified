import { createFileRoute, Link } from "@tanstack/react-router";
import { Panel, Stat, AreaChart, MiniBars } from "@/components/dashboard/Bits";
import { ExecutiveHero } from "@/components/dashboard/ExecutiveHero";
import { TiltCard, Reveal, Parallax, GlowRing } from "@/components/dashboard/Wow";
import { ShieldAlert, Users, Activity, Bot, ArrowUpRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin/")({
  component: AdminHome,
});

function AdminHome() {
  return (
    <div className="space-y-5">
      <Reveal>
        <ExecutiveHero
          role="admin"
          kicker="Governance · Live"
          name="Oussama Tahiri · Administrator"
          headline={<>Platform is healthy.<br/><span className="text-white/55 font-light italic">2 critical alerts open.</span></>}
          metrics={[
            { label: "Active users", value: "1,284", trend: "+4.2% w/w" },
            { label: "AI calls / 24h", value: "9.4k", trend: "+8.2%" },
            { label: "Open alerts", value: "7", trend: "2 critical" },
          ]}
          sparkline={[42, 55, 49, 63, 71, 58, 80, 72, 88, 84, 92, 78, 95, 88]}
          primary={{ label: "Open security", to: "/dashboard/admin/security" }}
          secondary={{ label: "Users", to: "/dashboard/admin/users" }}
        />
      </Reveal>

      <div className="grid grid-cols-2 gap-2" style={{ perspective: 1200 }}>
        {[
          { l: "Active users", v: "1,284", d: undefined, i: Users, a: true },
          { l: "AI / 24h", v: "9.4k", d: "+8.2%", i: Bot, a: false },
          { l: "Open alerts", v: "7", d: "2 critical", i: ShieldAlert, a: false },
          { l: "Audit events", v: "42k", d: "+1.4%", i: Activity, a: false },
        ].map((s, idx) => (
          <Reveal key={s.l} delay={idx * 0.05}>
            <TiltCard><Stat label={s.l} value={s.v} delta={s.d} accent={s.a} icon={<s.i className="w-3.5 h-3.5" />} /></TiltCard>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <Panel label="14 DAYS" title="Platform usage">
          <AreaChart data={[42, 55, 49, 63, 71, 58, 80, 72, 88, 84, 92, 78, 95, 88]} />
        </Panel>
      </Reveal>

      <Reveal>
        <Panel label="HOURLY" title="AI request load">
          <MiniBars data={[220, 290, 310, 285, 360, 410, 470, 520, 480, 540, 590, 610]} />
        </Panel>
      </Reveal>

      <Reveal>
        <Panel label="INCIDENTS" title="Recent alerts">
          {[
            { i: ShieldAlert, t: "Unauthorized payroll query", lv: "critical", time: "2m" },
            { i: Bot, t: "AI prompt injection blocked", lv: "high", time: "27m" },
            { i: Activity, t: "Unusual access · user #482", lv: "medium", time: "1h" },
            { i: Users, t: "Role escalation request", lv: "low", time: "3h" },
          ].map(({ i: I, t, lv, time }) => (
            <div key={t} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
              <I className="w-4 h-4 text-accent shrink-0" />
              <span className="text-sm font-medium flex-1 leading-tight">{t}</span>
              <span className={`text-[9px] uppercase px-2 py-0.5 rounded-full font-bold tracking-wider ${
                lv === "critical" ? "bg-destructive/15 text-destructive" :
                lv === "high" ? "bg-warning/20 text-warning" :
                "bg-muted text-muted-foreground"
              }`}>{lv}</span>
              <span className="text-[10px] text-muted-foreground tracking-wider">{time}</span>
            </div>
          ))}
        </Panel>
      </Reveal>

      <Reveal>
        <Panel label="DISTRIBUTION" title="Roles">
          <div className="space-y-3">
            {[{ r: "Collaborators", p: 78, n: 1002 }, { r: "Managers", p: 18, n: 231 }, { r: "Admins", p: 4, n: 51 }].map(x => (
              <div key={x.r}>
                <div className="flex justify-between text-xs mb-1.5"><span className="font-semibold">{x.r}</span><span className="text-muted-foreground">{x.n}</span></div>
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${x.p}%`, background: "var(--accent)" }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </Reveal>

      <Reveal>
        <Parallax offset={20}>
          <Panel label="POSTURE" title="Security score">
            <div className="flex items-center gap-5">
              <GlowRing value={92} label="secure" color="#22c55e" />
              <div className="flex-1">
                <div className="text-sm font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-success" /> A+ posture
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  All critical guardrails active. 2 medium recommendations in the Security tab.
                </p>
              </div>
            </div>
          </Panel>
        </Parallax>
      </Reveal>
    </div>
  );
}
