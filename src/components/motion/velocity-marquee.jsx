"use client";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Marquee yang kecepatannya mengikuti kecepatan scroll (pola "scroll velocity").
 * Arah ikut arah scroll; saat diam kembali ke kecepatan dasar.
 */
export function VelocityMarquee({ children, base = 60, className, reverse = false }) {
  const track = useRef(null);

  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    let x = 0;
    let dir = reverse ? 1 : -1;
    let boost = 0;
    const half = () => el.scrollWidth / 2;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        boost = Math.min(Math.abs(self.getVelocity()) / 8, 900);
        dir = (self.direction === 1 ? -1 : 1) * (reverse ? -1 : 1);
      },
    });
    const tick = (_, dt) => {
      boost *= 0.92;
      x += (dir * (base + boost) * dt) / 1000;
      const w = half();
      if (w) {
        if (x <= -w) x += w;
        if (x > 0) x -= w;
      }
      gsap.set(el, { x });
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
    };
  }, [base, reverse]);

  return (
    <div className={cn("overflow-hidden", className)}>
      <div ref={track} className="flex w-max will-change-transform">
        {[0, 1].map((k) => (
          <div key={k} aria-hidden={k === 1 || undefined} className="flex shrink-0 items-center">
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
