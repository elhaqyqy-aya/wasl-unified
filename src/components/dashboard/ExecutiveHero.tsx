import { motion } from "framer-motion";
import { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

type Palette = {
  /** deep base color, very dark */
  base: string;
  /** mid accent for gradients */
  mid: string;
  /** bright accent for highlights / chart line */
  accent: string;
  /** soft contrast tint */
  tint: string;
};

const PALETTES: Record<"collab" | "manager" | "admin" | "rh", Palette> = {
  collab:  { base: "#070b1a", mid: "#0f1e3d", accent: "#7ea8ff", tint: "#1c2748" },
  manager: { base: "#0a0814", mid: "#1f1438", accent: "#c4b5fd", tint: "#241a3d" },
  admin:   { base: "#0a0a14", mid: "#2a0e2a", accent: "#f0abfc", tint: "#2b1438" },
  rh:      { base: "#0a1410", mid: "#103024", accent: "#86efac", tint: "#15392a" },
};

/* tiny deterministic sparkline */
function buildPath(data: number[], w: number, h: number) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 8) - 4] as const);
  return {
    line: "M " + pts.map(p => p.join(",")).join(" L "),
    area: `M ${pts.map(p => p.join(",")).join(" L ")} L ${w},${h} L 0,${h} Z`,
    pts,
  };
}

export function ExecutiveHero({
  role,
  kicker,
  name,
  headline,
  metrics,
  sparkline,
  primary,
  secondary,
}: {
  role: "collab" | "manager" | "admin" | "rh";
  kicker: string;
  name: string;
  headline: ReactNode;
  metrics: { label: string; value: string; trend?: string }[];
  sparkline: number[];
  primary: { label: string; to: string };
  secondary?: { label: string; to: string };
}) {
  const p = PALETTES[role];
  const W = 600;
  const H = 130;
  const { line, area, pts } = buildPath(sparkline, W, H);
  const lastX = pts[pts.length - 1][0];
  const lastY = pts[pts.length - 1][1];

  return (
    <div
      className="relative overflow-hidden rounded-[28px] border border-white/[0.06]"
      style={{
        background: `
          radial-gradient(120% 80% at 100% 0%, ${p.mid} 0%, transparent 55%),
          radial-gradient(80% 60% at 0% 100%, ${p.tint} 0%, transparent 60%),
          linear-gradient(180deg, ${p.base} 0%, #000 100%)
        `,
        boxShadow: `0 30px 80px -30px ${p.accent}33, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {/* Hairline grid */}
      <div
        className="absolute inset-0 opacity-[0.18] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 80%)",
        }}
      />

      {/* Animated horizon glow */}
      <motion.div
        className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(closest-side, ${p.accent}44, transparent 70%)`,
          filter: "blur(10px)",
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Vertical orbital ring (subtle, monochrome) */}
      <svg
        className="absolute -right-28 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"
        width="340" height="340" viewBox="0 0 340 340"
      >
        <defs>
          <linearGradient id={`ring-${role}`} x1="0" x2="1">
            <stop offset="0%" stopColor={p.accent} stopOpacity="0" />
            <stop offset="50%" stopColor={p.accent} stopOpacity="0.6" />
            <stop offset="100%" stopColor={p.accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.circle
          cx="170" cy="170" r="150"
          fill="none" stroke={`url(#ring-${role})`} strokeWidth="0.75"
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "170px 170px" }}
        />
        <motion.circle
          cx="170" cy="170" r="110"
          fill="none" stroke={p.accent} strokeOpacity="0.18" strokeWidth="0.5" strokeDasharray="2 6"
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "170px 170px" }}
        />
        <motion.circle
          cx="170" cy="170" r="70"
          fill="none" stroke={p.accent} strokeOpacity="0.35" strokeWidth="0.75"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "170px 170px" }}
        />
      </svg>

      {/* Content */}
      <div className="relative p-6 pb-5">
        {/* Top row: live + kicker */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex w-1.5 h-1.5">
              <span className="absolute inset-0 rounded-full animate-ping" style={{ background: p.accent }} />
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full" style={{ background: p.accent }} />
            </span>
            <div className="text-[9px] font-semibold tracking-[0.32em] uppercase text-white/55">
              {kicker}
            </div>
          </div>
          <div className="text-[9px] font-mono tracking-[0.22em] uppercase text-white/40">
            {new Date().toLocaleDateString("en-US", { weekday: "short", day: "2-digit", month: "short" })}
          </div>
        </div>

        {/* Name + headline */}
        <div className="text-white/45 text-[11px] tracking-[0.28em] uppercase font-semibold mb-1.5">
          {name}
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-bold text-white text-[28px] leading-[1.05] tracking-[-0.02em] max-w-[88%]"
          style={{ textWrap: "balance" as any }}
        >
          {headline}
        </motion.h1>

        {/* Sparkline */}
        <div className="mt-6 relative">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[110px]" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`spark-${role}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={p.accent} stopOpacity="0.42" />
                <stop offset="100%" stopColor={p.accent} stopOpacity="0" />
              </linearGradient>
              <linearGradient id={`stroke-${role}`} x1="0" x2="1">
                <stop offset="0%" stopColor={p.accent} stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
              </linearGradient>
            </defs>
            <motion.path
              d={area}
              fill={`url(#spark-${role})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.4 }}
            />
            <motion.path
              d={line}
              fill="none"
              stroke={`url(#stroke-${role})`}
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.circle
              cx={lastX} cy={lastY} r="3.5"
              fill="#fff"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7 }}
            />
            <motion.circle
              cx={lastX} cy={lastY} r="8"
              fill="none" stroke={p.accent} strokeOpacity="0.6"
              animate={{ r: [4, 14], opacity: [0.7, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
          </svg>
        </div>

        {/* KPI strip */}
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/[0.08] pt-4">
          {metrics.slice(0, 3).map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.08, duration: 0.6 }}
            >
              <div className="text-[9px] font-semibold tracking-[0.22em] uppercase text-white/40">
                {m.label}
              </div>
              <div className="font-display font-bold text-white text-[20px] leading-none mt-1.5 tracking-tight">
                {m.value}
              </div>
              {m.trend && (
                <div className="text-[10px] font-medium mt-1.5" style={{ color: p.accent }}>
                  {m.trend}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-5 flex items-center gap-3">
          <Link
            to={primary.to}
            className="group inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full text-[10px] font-bold tracking-[0.22em] uppercase text-black transition"
            style={{ background: "#fff" }}
          >
            {primary.label}
            <span
              className="w-7 h-7 rounded-full grid place-items-center transition-transform group-hover:rotate-45"
              style={{ background: p.accent, color: "#0a0a14" }}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </Link>
          {secondary && (
            <Link
              to={secondary.to}
              className="text-[10px] tracking-[0.22em] uppercase font-bold text-white/60 hover:text-white inline-flex items-center gap-1.5 transition"
            >
              {secondary.label} <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
