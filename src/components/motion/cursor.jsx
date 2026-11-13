"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Kursor pengiring (desktop, pointer halus saja). Kursor asli tetap tampil.
 * Elemen dengan `data-cursor="Teks"` membuat titik membesar menjadi cincin berlabel.
 */
export function Cursor() {
  const ref = useRef(null);
  const [label, setLabel] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const x = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" });
    let shown = false;
    const move = (e) => {
      if (!shown) {
        gsap.set(el, { x: e.clientX, y: e.clientY });
        gsap.to(el, { autoAlpha: 1, duration: 0.3 });
        shown = true;
      }
      x(e.clientX);
      y(e.clientY);
      const t = e.target.closest?.("[data-cursor]");
      const next = t ? t.getAttribute("data-cursor") : "";
      setLabel((prev) => (prev === next ? prev : next));
    };
    const leave = () => {
      gsap.to(el, { autoAlpha: 0, duration: 0.3 });
      shown = false;
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  const big = Boolean(label);
  return (
    <div ref={ref} aria-hidden className="cursor-dot invisible hidden md:block">
      <div
        className="grid place-items-center rounded-full bg-primary text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition-[width,height,background-color] duration-500 ease-cinematic"
        style={{ width: big ? 84 : 10, height: big ? 84 : 10, backgroundColor: big ? "var(--brand-deep)" : undefined }}
      >
        <span className={big ? "opacity-100 transition-opacity delay-150 duration-300" : "opacity-0"}>{label}</span>
      </div>
    </div>
  );
}
