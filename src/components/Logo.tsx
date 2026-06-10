import wasl from "@/assets/wasl-logo.png";
import humanai from "@/assets/humanai-logo.png";

export function Logo({
  variant = "wasl",
  className = "h-10",
  showByline = true,
}: {
  variant?: "wasl" | "humanai";
  className?: string;
  showByline?: boolean;
}) {
  const src = variant === "wasl" ? wasl : humanai;
  return (
    <div className="inline-flex items-center gap-2">
      <img src={src} alt="Wasl by Humanai" className={`${className} w-auto object-contain`} />
      {showByline && variant === "wasl" && (
        <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground leading-none">
          by<br />Humanai
        </span>
      )}
    </div>
  );
}
