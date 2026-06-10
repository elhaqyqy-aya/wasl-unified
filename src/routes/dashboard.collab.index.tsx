import { createFileRoute, Link } from "@tanstack/react-router";
import { Panel, Stat, AreaChart } from "@/components/dashboard/Bits";
import { ExecutiveHero } from "@/components/dashboard/ExecutiveHero";
import { TiltCard, Reveal, Parallax, GlowRing } from "@/components/dashboard/Wow";
import { MessageSquare, FileText, Compass, ArrowUpRight, Calendar, CheckCircle2, Sparkles, Heart, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard/collab/")({
  component: CollabHome,
});

function CollabHome() {
  return (
    <div className="space-y-5">
      <Reveal>
        <ExecutiveHero
          role="collab"
          kicker="Personal Workspace"
          name="Aya Bensaid · Collaborator"
          headline={<>Good morning, Aya.<br/><span className="text-white/55 font-light italic">Your day is set.</span></>}
          metrics={[
            { label: "Leave balance", value: "12d", trend: "+2 vs Q3" },
            { label: "Onboarding", value: "73%", trend: "Day 22 / 30" },
            { label: "Open requests", value: "1", trend: "Processing" },
          ]}
          sparkline={[40, 52, 48, 62, 70, 65, 75, 72, 80, 78, 84, 90, 88, 94]}
          primary={{ label: "Ask AI", to: "/dashboard/collab/assistant" }}
          secondary={{ label: "Documents", to: "/dashboard/collab/documents" }}
        />
      </Reveal>

      {/* STATS with tilt */}
      <div className="grid grid-cols-2 gap-2" style={{ perspective: 1200 }}>
        {[
          { l: "Leave balance", v: "12d", d: "+2 vs Q3", i: Calendar, a: false },
          { l: "Onboarding", v: "73%", d: undefined, i: Sparkles, a: true },
          { l: "Open requests", v: "1", d: "processing", i: FileText, a: false },
          { l: "Wellbeing", v: "Good", d: "↑ 8 pts", i: Heart, a: false },
        ].map((s, idx) => (
          <Reveal key={s.l} delay={idx * 0.05}>
            <TiltCard>
              <Stat label={s.l} value={s.v} delta={s.d} accent={s.a} icon={<s.i className="w-3.5 h-3.5" />} />
            </TiltCard>
          </Reveal>
        ))}
      </div>

      {/* Quick actions with tilt */}
      <div className="grid grid-cols-2 gap-2" style={{ perspective: 1200 }}>
        {[
          { i: MessageSquare, t: "AI assistant", d: "Policies · Payroll", to: "/dashboard/collab/assistant" },
          { i: FileText, t: "Documents", d: "Attestations · Forms", to: "/dashboard/collab/documents" },
          { i: Compass, t: "Onboarding", d: "30-day plan", to: "/dashboard/collab/onboarding" },
          { i: Calendar, t: "Time off", d: "Plan your leave", to: "/dashboard/collab/documents" },
        ].map((q, i) => (
          <Reveal key={q.t} delay={i * 0.06}>
            <TiltCard intensity={10}>
              <Link to={q.to} className="edunai-card p-3 group flex flex-col gap-2 block">
                <div className="w-9 h-9 rounded-xl grid place-items-center bg-foreground text-background group-hover:bg-accent transition">
                  <q.i className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-display font-bold text-sm leading-tight">{q.t}</div>
                  <div className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mt-0.5">{q.d}</div>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent transition self-end" />
              </Link>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      {/* Activity */}
      <Reveal>
        <Panel label="LAST 14 DAYS" title="Your activity">
          <AreaChart data={[40, 52, 48, 62, 70, 65, 75, 72, 80, 78, 84, 90, 88, 94]} />
          <div className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground mt-2">
            Higher engagement on Mondays & Thursdays — great rhythm.
          </div>
        </Panel>
      </Reveal>

      <Reveal>
        <Panel label="UP NEXT" title="My next steps">
          {[
            { i: CheckCircle2, t: "Complete profile · skills section", done: true, time: "Done" },
            { i: Clock, t: "Mentor 1:1 — Thursday 10:00", done: false, time: "2d" },
            { i: FileText, t: "Sign updated remote-work policy", done: false, time: "4d" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
              <s.i className={`w-4 h-4 ${s.done ? "text-success" : "text-accent"}`} />
              <span className={`text-sm flex-1 ${s.done ? "line-through text-muted-foreground" : ""}`}>{s.t}</span>
              <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground">{s.time}</span>
            </div>
          ))}
        </Panel>
      </Reveal>

      {/* GLOW RING progress */}
      <Reveal>
        <Parallax offset={20}>
          <Panel label="PROGRESS" title="Onboarding journey">
            <div className="flex items-center gap-5">
              <GlowRing value={73} label="complete" color="#5b7bff" />
              <div className="flex-1">
                <div className="text-sm font-semibold">Day 22 / 30</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  You're ahead of schedule. Finish the security training to unlock badge #03.
                </p>
                <Link to="/dashboard/collab/onboarding" className="text-[10px] tracking-[0.22em] uppercase font-bold text-accent inline-flex items-center gap-1 mt-2">
                  Continue <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </Panel>
        </Parallax>
      </Reveal>
    </div>
  );
}
