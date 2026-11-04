"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

const n = (v) => Math.round(v * 10) / 10;
// Kurva diagonal seperti versi asli Aceternity, digeser sedikit per beam.
const PATHS = Array.from({ length: 14 }, (_, i) => {
  const o = i * 14;
  const x0 = n(-380 + o), y0 = n(-189 - o * 0.9);
  const x1 = n(-312 + o), y1 = n(216 - o * 0.9);
  const x2 = n(152 + o), y2 = n(343 - o * 0.9);
  const x3 = n(616 + o), y3 = n(470 - o * 0.9);
  const x4 = n(684 + o), y4 = n(875 - o * 0.9);
  return `M${x0} ${y0}C${x0} ${y0} ${x1} ${y1} ${x2} ${y2}C${x3} ${y3} ${x4} ${y4} ${x4} ${y4}`;
});

/** Aceternity "Background Beams" — di-port dari motion ke GSAP. */
export default function BackgroundBeams({ className }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      const beams = ref.current.querySelectorAll("[data-beam]");
      beams.forEach((p, i) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: `${len * 0.18} ${len}`, strokeDashoffset: len * 1.18 });
        gsap.to(p, { strokeDashoffset: 0, duration: 6 + (i % 5), delay: i * 0.45, repeat: -1, ease: "none" });
      });
    },
    { scope: ref }
  );
  return (
    <div ref={ref} aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]", className)}>
      <svg className="absolute h-full w-full" width="100%" height="100%" viewBox="0 0 696 316" fill="none" preserveAspectRatio="xMidYMid slice">
        {PATHS.map((d, i) => (
          <path key={`b${i}`} d={d} stroke="#fecaca" strokeOpacity="0.35" strokeWidth="0.5" />
        ))}
        {PATHS.map((d, i) => (
          <path key={`a${i}`} data-beam d={d} stroke="url(#beam-gradient)" strokeWidth="1" strokeLinecap="round" />
        ))}
        <defs>
          <linearGradient id="beam-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#dc2626" stopOpacity="0" />
            <stop offset="0.4" stopColor="#dc2626" />
            <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
