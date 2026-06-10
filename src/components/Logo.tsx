import wasl from "@/assets/wasl-logo.png";
import humanai from "@/assets/humanai-logo.png";

export function Logo({ variant = "wasl", className = "h-10" }: { variant?: "wasl" | "humanai"; className?: string }) {
  const src = variant === "wasl" ? wasl : humanai;
  return <img src={src} alt="HumaNai" className={`${className} w-auto object-contain`} />;
}
