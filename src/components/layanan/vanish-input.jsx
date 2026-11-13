"use client";
import { useCallback, useLayoutEffect as useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Pola Aceternity "Placeholders And Vanish Input": placeholder bergilir saat kosong; saat dikirim, teks digambar ke
 * kanvas, dipecah jadi partikel per piksel, lalu "menguap" ke kanan sebelum kolom dikosongkan.
 * `onChange(value)` dipanggil tiap ketikan; `onSubmit(value)` saat Enter / tombol kirim.
 */
export function VanishInput({ placeholders, value, onChange, onSubmit, label = "Cari layanan", className }) {
  const [ph, setPh] = useState(0);
  const [vanishing, setVanishing] = useState(false);
  const input = useRef(null);
  const canvas = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    if (value || prefersReducedMotion()) return;
    const t = setInterval(() => setPh((i) => (i + 1) % placeholders.length), 3000);
    return () => clearInterval(t);
  }, [value, placeholders.length]);

  const draw = useCallback(() => {
    const el = input.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const ctx = cv.getContext("2d");
    const dpr = 2;
    const { width, height } = el.getBoundingClientRect();
    cv.width = width * dpr;
    cv.height = height * dpr;
    ctx.clearRect(0, 0, cv.width, cv.height);
    const style = getComputedStyle(el);
    ctx.font = `${parseFloat(style.fontSize) * dpr}px ${style.fontFamily}`;
    ctx.fillStyle = style.color;
    ctx.textBaseline = "middle";
    const padLeft = parseFloat(style.paddingLeft) * dpr;
    ctx.fillText(el.value, padLeft, cv.height / 2);
    const { data } = ctx.getImageData(0, 0, cv.width, cv.height);
    const out = [];
    for (let y = 0; y < cv.height; y += 2) {
      for (let x = 0; x < cv.width; x += 2) {
        const i = (y * cv.width + x) * 4;
        if (data[i + 3] > 120) out.push({ x, y, r: 1.4, color: `rgba(${data[i]},${data[i + 1]},${data[i + 2]},${data[i + 3] / 255})` });
      }
    }
    particles.current = out;
  }, []);

  const animateOut = useCallback((start) => {
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!ctx) return;
    const frame = (pos) => {
      const next = [];
      for (const p of particles.current) {
        if (p.x < pos) next.push(p);
        else {
          if (p.r <= 0) continue;
          p.x += Math.random() > 0.5 ? 1 : -1;
          p.y += Math.random() > 0.5 ? 1 : -1;
          p.r -= 0.05 * Math.random();
          next.push(p);
        }
      }
      particles.current = next;
      ctx.clearRect(pos, 0, cv.width, cv.height);
      for (const p of next) {
        if (p.x > pos && p.r > 0) {
          ctx.beginPath();
          ctx.rect(p.x, p.y, p.r, p.r);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
      }
      if (next.length > 0) requestAnimationFrame(() => frame(pos - 8));
      else {
        ctx.clearRect(0, 0, cv.width, cv.height);
        setVanishing(false);
      }
    };
    frame(start);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const v = value.trim();
    if (!v || vanishing) return;
    onSubmit?.(v);
    if (prefersReducedMotion()) {
      onChange("");
      return;
    }
    setVanishing(true);
    draw();
    onChange("");
    const maxX = particles.current.reduce((m, p) => Math.max(m, p.x), 0);
    animateOut(maxX);
  };

  return (
    <form onSubmit={submit} role="search" className={cn("relative flex h-14 w-full items-center overflow-hidden rounded-full border border-line bg-white shadow-[0_18px_40px_-28px_rgb(20_33_61/0.55)] transition-[border-color,box-shadow] duration-300 focus-within:border-navy/30 focus-within:shadow-[0_18px_40px_-22px_rgb(20_33_61/0.6)]", className)}>
      <svg aria-hidden viewBox="0 0 20 20" className="ml-5 size-5 shrink-0 text-text/40">
        <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M14 14l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <canvas ref={canvas} aria-hidden className={cn("pointer-events-none absolute left-9 top-0 h-full origin-top-left", vanishing ? "opacity-100" : "opacity-0")} style={{ width: "calc(100% - 3rem)" }} />
      <input
        ref={input}
        value={value}
        onChange={(e) => !vanishing && onChange(e.target.value)}
        aria-label={label}
        type="search"
        enterKeyHint="go"
        className={cn("relative z-10 h-full w-full bg-transparent pl-4 pr-16 text-[16px] text-navy outline-none [&::-webkit-search-cancel-button]:hidden", vanishing && "text-transparent")}
      />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-[3.25rem] flex items-center">
        <AnimatePresence mode="wait">
          {!value && !vanishing && (
            <motion.span
              key={ph}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.3, ease: "linear" }}
              className="truncate text-[15.5px] text-text/45"
            >
              {placeholders[ph]}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <button
        type="submit"
        disabled={!value}
        aria-label="Buka hasil teratas"
        className="absolute right-2 z-20 grid size-10 place-items-center rounded-full bg-navy text-white transition-[background-color,opacity,transform] duration-300 hover:bg-maroon disabled:bg-cream-2 disabled:text-text/30"
      >
        <motion.svg viewBox="0 0 16 16" className="size-4" initial={false}>
          <motion.path d="M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" initial={{ pathLength: 1 }} animate={{ pathLength: value ? 1 : 0.5 }} />
          <path d="M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>
    </form>
  );
}
