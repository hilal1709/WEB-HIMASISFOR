"use client";
import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Spotlight Card (pola 21st.dev): cahaya radial mengikuti kursor di permukaan & border kartu.
 * Murni CSS variable (--mx/--my) — tanpa re-render.
 */
export function SpotlightCard({ children, className, as: Tag = "div", ...props }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <Tag ref={ref} onPointerMove={onMove} className={cn("spotlight-card group relative isolate overflow-hidden", className)} {...props}>
      {children}
    </Tag>
  );
}
