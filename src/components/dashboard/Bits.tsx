import { ReactNode } from "react";

export function PageHeader({ kicker, title, subtitle, right }: { kicker?: string; title: ReactNode; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="mb-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {kicker && <div className="bracket-tag mb-2">{kicker}</div>}
      <div className="flex items-end justify-between gap-3">
        <h1 className="at-spaced-title text-[26px] leading-[1.1]">{title}</h1>
        {right}
      </div>
      {subtitle && <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

export function Stat({ label, value, delta, accent, icon }: { label: string; value: string; delta?: string; accent?: boolean; icon?: ReactNode }) {
  return (
    <div
      className={`edunai-card p-3 relative overflow-hidden transition-transform duration-500 hover:-translate-y-0.5 ${accent ? "text-white" : ""}`}
      style={accent ? { background: "#0a0a12", borderColor: "transparent" } : {}}
    >
      {accent && <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />}
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className={`text-[9px] tracking-[0.22em] uppercase ${accent ? "text-white/70" : "text-muted-foreground"}`}>{label}</div>
          {icon && (
            <div className={`w-7 h-7 rounded-lg grid place-items-center ${accent ? "bg-white/10 text-white" : "bg-secondary text-foreground"}`}>
              {icon}
            </div>
          )}
        </div>
        <div className="font-display font-bold text-2xl mt-1 leading-none tracking-tight">{value}</div>
        {delta && <div className={`text-[10px] mt-1.5 font-semibold ${accent ? "text-white/80" : "text-accent"}`}>{delta}</div>}
      </div>
    </div>
  );
}

export function Panel({ title, children, action, label }: { title: string; children: ReactNode; action?: ReactNode; label?: string }) {
  return (
    <div className="edunai-card p-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div>
          {label && <div className="bracket-tag !text-[9px] mb-1">{label}</div>}
          <h3 className="font-display font-bold text-base tracking-tight">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function MiniBars({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-700 hover:opacity-80"
          style={{
            height: `${(v / max) * 100}%`,
            background: i === data.length - 1 ? "var(--accent)" : "#0a0a12",
            animation: `bar-rise .7s ${i * 40}ms var(--basic-ease) both`,
          }}
        />
      ))}
    </div>
  );
}

/* === Area chart (SVG) === */
export function AreaChart({ data, height = 110, color = "var(--accent)" }: { data: number[]; height?: number; color?: string }) {
  const w = 300;
  const h = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 14) - 6}`);
  const line = `M ${pts.join(" L ")}`;
  const area = `${line} L ${w},${h} L 0,${h} Z`;
  const id = `g-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} className="area-anim" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" className="line-anim" />
      {pts.map((p, i) => {
        const [x, y] = p.split(",").map(Number);
        return <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 3.5 : 0} fill={color} />;
      })}
    </svg>
  );
}

/* === Donut === */
export function Donut({ value, label, color = "var(--accent)" }: { value: number; label: string; color?: string }) {
  const r = 32;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="relative w-20 h-20 mx-auto">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r={r} stroke="var(--neutral-200)" strokeWidth="7" fill="none" />
        <circle
          cx="40" cy="40" r={r} stroke={color} strokeWidth="7" fill="none"
          strokeDasharray={`${dash} ${c - dash}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s var(--basic-ease)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display font-bold text-base leading-none">{value}%</div>
        <div className="text-[8px] tracking-[0.15em] uppercase text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
}
