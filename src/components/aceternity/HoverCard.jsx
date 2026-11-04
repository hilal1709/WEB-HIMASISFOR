"use client";
import { useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

/**
 * Aceternity "Card Spotlight / Hover Effect" — cahaya mengikuti kursor + sedikit tilt (GSAP).
 */
export default function HoverCard({ children, className, tilt = 4 }) {
  const ref = useRef(null);
  const glow = useRef(null);

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    gsap.to(glow.current, { x: x - 150, y: y - 150, opacity: 1, duration: 0.4 });
    gsap.to(ref.current, { rotateY: ((x / r.width) - 0.5) * tilt, rotateX: -((y / r.height) - 0.5) * tilt, duration: 0.5, transformPerspective: 800 });
  };
  const onLeave = () => {
    gsap.to(glow.current, { opacity: 0, duration: 0.4 });
    gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.6 });
  };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={cn("group relative overflow-hidden rounded-2xl border bg-white shadow-soft will-change-transform", className)}>
      <div ref={glow} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 size-[300px] rounded-full bg-[radial-gradient(circle,rgba(220,38,38,0.14),transparent_65%)] opacity-0" />
      <div className="relative">{children}</div>
    </div>
  );
}
