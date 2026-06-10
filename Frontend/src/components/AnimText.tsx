import { ReactNode } from "react";

export function AnimText({ children, className = "" }: { children: string; className?: string }) {
  const chars = children.split("");
  return (
    <span className={`at-title-anim ${className}`}>
      <span className="at-title-text">
        {chars.map((c, i) => (
          <span key={i} style={{ ["--char" as never]: i + 1 } as React.CSSProperties}>{c === " " ? "\u00A0" : c}</span>
        ))}
      </span>
    </span>
  );
}

export function LinkSwap({ children }: { children: ReactNode }) {
  return (
    <span className="at-link-swap">
      <span className="text-1">{children}</span>
      <span className="text-2">{children}</span>
    </span>
  );
}
