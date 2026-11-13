"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Kata berganti dengan flip per huruf (pola 21st.dev "Word Rotate").
 * Kata pertama dirender di server (aman SEO); rotasi hanya visual (aria-live off).
 */
export function WordRotate({ words, interval = 2600, className, start = true }) {
  const [i, setI] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!start || prefersReducedMotion() || words.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [start, interval, words.length]);

  useEffect(() => {
    const chars = ref.current?.querySelectorAll("[data-ch]");
    if (!chars?.length || prefersReducedMotion()) return;
    const t = gsap.fromTo(
      chars,
      { yPercent: 110, rotateX: -80, opacity: 0 },
      { yPercent: 0, rotateX: 0, opacity: 1, duration: 0.8, ease: "expo.out", stagger: 0.025 }
    );
    return () => t.kill();
  }, [i]);

  return (
    <span className={cn("relative inline-block [perspective:600px]", className)}>
      <span key={i} ref={ref} className="inline-block whitespace-nowrap">
        {[...words[i]].map((ch, k) => (
          <span key={k} data-ch className="inline-block [transform-origin:50%_100%]">
            {ch === " " ? " " : ch}
          </span>
        ))}
      </span>
    </span>
  );
}
