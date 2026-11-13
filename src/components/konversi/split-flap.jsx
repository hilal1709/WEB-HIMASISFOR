"use client";
import { useLayoutEffect as useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789×·";

/**
 * Satu keping papan split-flap. Saat `char` berubah, keping memutar beberapa huruf acak lalu berhenti di
 * huruf tujuan; setiap pergantian membalik setengah atas (rotasi X, anime.js). Reduced-motion → langsung.
 */
function Flap({ char, delay = 0, className }) {
  const [shown, setShown] = useState(char);
  const face = useRef(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      setShown(char);
      return;
    }
    if (prefersReducedMotion()) {
      setShown(char);
      return;
    }
    const spins = 3 + Math.floor(Math.random() * 4);
    let n = 0;
    let timer;
    const start = setTimeout(function tick() {
      n += 1;
      const next = n >= spins ? char : CHARS[Math.floor(Math.random() * CHARS.length)];
      setShown(next);
      if (face.current) animate(face.current, { rotateX: [-88, 0], duration: 70, ease: "outQuad" });
      if (n < spins) timer = setTimeout(tick, 55);
    }, delay);
    return () => {
      clearTimeout(start);
      clearTimeout(timer);
    };
  }, [char, delay]);

  return (
    <span className={cn("relative inline-grid h-[1.55em] w-[1.02em] place-items-center overflow-hidden rounded-[3px] bg-navy-deep text-white", className)} style={{ perspective: 200 }}>
      <span ref={face} className="relative z-10 block font-mono font-semibold leading-none" style={{ transformOrigin: "50% 100%" }}>
        {shown === " " ? " " : shown}
      </span>
      {/* engsel tengah */}
      <span aria-hidden className="absolute inset-x-0 top-1/2 z-20 h-px bg-black/45" />
    </span>
  );
}

/** Baris teks split-flap dengan lebar tetap `size` keping. */
export function SplitFlap({ text, size, className, flapClassName, stagger = 22 }) {
  const t = String(text).toUpperCase().padEnd(size, " ").slice(0, size);
  return (
    <span className={cn("inline-flex gap-[2px]", className)} aria-hidden>
      {t.split("").map((c, i) => (
        <Flap key={i} char={c} delay={i * stagger} className={flapClassName} />
      ))}
    </span>
  );
}
