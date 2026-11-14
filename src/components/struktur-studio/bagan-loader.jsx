"use client";
import { useEffect, useRef } from "react";
import { animate, svg, stagger } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Loader Studio Bagan: pohon tiga tingkat yang garisnya tergambar berurutan, simpul menyala
 * satu per satu, lalu berulang. Dipakai saat memuat isi & sebagai fallback penuh layar.
 */
export function BaganLoader({ label = "Menyusun bagan…", className }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const lines = animate(svg.createDrawable(el.querySelectorAll("[data-edge]")), {
      draw: ["0 0", "0 1", "1 1"],
      duration: 1600,
      delay: stagger(110),
      ease: "inOutQuad",
      loop: true,
    });
    const dots = animate(el.querySelectorAll("[data-dot]"), {
      scale: [0.4, 1, 0.4],
      opacity: [0.3, 1, 0.3],
      duration: 1600,
      delay: stagger(110),
      loop: true,
    });
    return () => {
      lines.revert();
      dots.revert();
    };
  }, []);

  const L1 = [40, 100, 160];
  return (
    <div role="status" className={cn("flex flex-col items-center gap-5 text-white/70", className)}>
      <svg ref={ref} viewBox="0 0 200 120" className="w-44" fill="none" aria-hidden>
        <path data-edge d="M100 22V48" stroke="#d6b66c" strokeWidth="2" strokeLinecap="round" />
        {L1.map((x) => (
          <path key={x} data-edge d={`M100 48H${x}V70`} stroke="#d6b66c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {[30, 50].map((x) => (
          <path key={x} data-edge d={`M40 84V96H${x}V104`} stroke="rgba(255,255,255,.35)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        <circle data-dot cx="100" cy="14" r="8" fill="#d6b66c" style={{ transformOrigin: "100px 14px" }} />
        {L1.map((x) => (
          <rect key={x} data-dot x={x - 12} y="70" width="24" height="14" rx="4" fill="#fff" style={{ transformOrigin: `${x}px 77px` }} />
        ))}
        {[30, 50].map((x) => (
          <circle key={x} data-dot cx={x} cy="109" r="4.5" fill="rgba(255,255,255,.7)" style={{ transformOrigin: `${x}px 109px` }} />
        ))}
      </svg>
      <span className="text-[13px] tracking-wide">{label}</span>
    </div>
  );
}

/** Kerangka kanvas saat isi belum siap. */
export function CanvasSkeleton() {
  return (
    <div aria-hidden className="flex flex-col items-center gap-10 opacity-60">
      <span className="h-[86px] w-[220px] animate-pulse rounded-2xl bg-white/[0.06]" />
      <div className="flex gap-6">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-[86px] w-[200px] animate-pulse rounded-2xl bg-white/[0.05]" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
    </div>
  );
}
