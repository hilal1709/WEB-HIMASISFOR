"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

const PRESETS = {
  "fade-up": { opacity: 0, y: 24 },
  "fade-down": { opacity: 0, y: -24 },
  "drop": { opacity: 0, y: -16, scale: 0.98 },
  "zoom": { opacity: 0, scale: 0.9 },
  "fade": { opacity: 0 },
};

/**
 * Animasi masuk berbasis GSAP untuk satu blok.
 * - Default: berjalan saat komponen dipasang (cocok untuk dropdown, konten yang berganti).
 * - `onScroll`: berjalan saat masuk viewport (ScrollTrigger).
 * <Reveal preset="drop" className="…">…</Reveal>
 */
export default function Reveal({ as: Tag = "div", preset = "fade-up", duration = 0.5, delay = 0, stagger = 0, onScroll = false, className, children, ...props }) {
  const ref = useRef(null);
  useGSAP(
    () => {
      const targets = stagger ? ref.current.children : ref.current;
      const from = PRESETS[preset] || PRESETS["fade-up"];
      const to = { opacity: 1, x: 0, y: 0, scale: 1, duration, delay, stagger, ease: "power3.out" };
      if (onScroll) {
        gsap.registerPlugin(ScrollTrigger);
        to.scrollTrigger = { trigger: ref.current, start: "top 85%", once: true };
      }
      gsap.fromTo(targets, from, to);
    },
    { scope: ref }
  );
  return (
    <Tag ref={ref} className={className} {...props}>
      {children}
    </Tag>
  );
}
