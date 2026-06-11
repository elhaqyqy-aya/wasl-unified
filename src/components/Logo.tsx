import wasl from "@/assets/wasl-logo.png.asset.json";
import humanai from "@/assets/humanai-logo.png.asset.json";

export function Logo({
  variant = "wasl",
  className = "h-10",
  showByline = true,
}: {
  variant?: "wasl" | "humanai";
  className?: string;
  showByline?: boolean;
}) {
  if (variant === "humanai") {
    return <img src={humanai.url} alt="Humanai" className={`${className} w-auto object-contain`} />;
  }
  return (
    <div className="inline-flex items-end gap-2 leading-none">
      <img src={wasl.url} alt="Wasl" className={`${className} w-auto object-contain`} />
      {showByline && (
        <span className="inline-flex items-center gap-1.5 pb-1 text-[9px] tracking-[0.22em] uppercase text-muted-foreground">
          <span>by</span>
          <img src={humanai.url} alt="Humanai" className="h-3 w-auto object-contain opacity-90" />
        </span>
      )}
    </div>
  );
}
