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
    <div className="relative inline-block leading-none">
      <img src={wasl} alt="Wasl" className={`${className} w-auto object-contain block`} />
      {showByline && (
        <span
          className="absolute -bottom-2 -right-1 translate-y-full inline-flex items-center gap-1 text-[8px] tracking-[0.2em] uppercase text-muted-foreground whitespace-nowrap"
          aria-label="by Humanai"
        >
          <span>by</span>
          <img src={humanai} alt="Humanai" className="h-2.5 w-auto object-contain" />
        </span>
      )}
    </div>
  );
}
