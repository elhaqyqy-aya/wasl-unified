import wasl from "@/assets/wasl-logo.png";
import humanai from "@/assets/humanai-logo.png";

export function Logo({
  variant = "wasl",
  className = "h-8",
  showByline = true,
}: {
  variant?: "wasl" | "humanai";
  className?: string;
  showByline?: boolean;
}) {
  if (variant === "humanai") {
    return <img src={humanai} alt="Humanai" className={`${className} w-auto object-contain`} />;
  }
  return (
    <div className="inline-flex items-center gap-2 leading-none">
      <img src={wasl} alt="Wasl" className={`${className} w-auto object-contain shrink-0`} />
      {showByline && (
        <span className="inline-flex items-center gap-1 text-[9px] tracking-[0.22em] uppercase text-muted-foreground border-l border-border pl-2">
          <span>by</span>
          <img src={humanai} alt="Humanai" className="h-4 w-auto object-contain" />
        </span>
      )}
    </div>
  );
}
