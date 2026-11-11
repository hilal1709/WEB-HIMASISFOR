import { cn } from "@/lib/utils";

/**
 * Marquee tanpa JS (CSS keyframes `marquee-x`), berhenti saat hover,
 * tepi memudar via mask. Konten diduplikasi agar loop mulus.
 */
export function Marquee({ children, className, speed = 32, reverse = false }) {
  return (
    <div className={cn("group relative flex overflow-hidden", className)}>
      {[0, 1].map((k) => (
        <div
          key={k}
          aria-hidden={k === 1 || undefined}
          className="flex shrink-0 items-center gap-12 pr-12 animate-marquee-x group-hover:[animation-play-state:paused]"
          style={{ animationDuration: `${speed}s`, animationDirection: reverse ? "reverse" : "normal" }}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
