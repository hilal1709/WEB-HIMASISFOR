"use client";
import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Fader vertikal (0…max, langkah 1). Seret tutupnya, klik alur untuk lompat, roda mouse,
 * atau keyboard (↑/↓, PageUp/PageDown, Home/End) — role="slider" penuh.
 * Tutup fader meluncur ke nilai baru dengan GSAP; angka di atasnya "melompat" (anime.js).
 */
export function Fader({ value, onChange, max = 10, label, short, height = 132, accent = "var(--k-gold)", onCommit }) {
  const track = useRef(null);
  const cap = useRef(null);
  const num = useRef(null);
  const [drag, setDrag] = useState(false);
  const pct = (v) => 1 - v / max;

  useEffect(() => {
    const y = pct(value) * (height - 14);
    if (drag || prefersReducedMotion()) gsap.set(cap.current, { y });
    else gsap.to(cap.current, { y, duration: 0.45, ease: "expo.out" });
    if (num.current && !prefersReducedMotion()) animate(num.current, { translateY: [-4, 0], opacity: [0.4, 1], duration: 260, ease: "outQuad" });
  }, [value, height]); // eslint-disable-line react-hooks/exhaustive-deps

  const fromPointer = (e) => {
    const r = track.current.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (e.clientY - r.top - 7) / (r.height - 14)));
    return Math.round((1 - t) * max);
  };

  const set = (v) => {
    const n = Math.max(0, Math.min(max, v));
    if (n !== value) onChange(n);
  };

  return (
    <div className="flex w-8 shrink-0 flex-col items-center gap-1.5">
      <span ref={num} className="font-mono text-[11px] tabular-nums text-[var(--k-ink)]">{value}</span>
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-orientation="vertical"
        title={label}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDrag(true);
          set(fromPointer(e));
        }}
        onPointerMove={(e) => drag && set(fromPointer(e))}
        onPointerUp={() => {
          setDrag(false);
          onCommit?.();
        }}
        onWheel={(e) => {
          if (document.activeElement !== e.currentTarget) return;
          set(value + (e.deltaY < 0 ? 1 : -1));
        }}
        onKeyDown={(e) => {
          const k = e.key;
          const d = k === "ArrowUp" || k === "ArrowRight" ? 1 : k === "ArrowDown" || k === "ArrowLeft" ? -1 : k === "PageUp" ? 3 : k === "PageDown" ? -3 : 0;
          if (d) set(value + d);
          else if (k === "Home") set(max);
          else if (k === "End") set(0);
          else return;
          e.preventDefault();
        }}
        className={cn("group relative w-7 cursor-ns-resize touch-none rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[var(--k-gold)]/60", drag && "cursor-grabbing")}
        style={{ height }}
      >
        <span aria-hidden className="k-groove absolute inset-y-1 left-1/2 w-[5px] -translate-x-1/2 rounded-full bg-black/50" />
        <span aria-hidden className="absolute bottom-1 left-1/2 w-[3px] -translate-x-1/2 rounded-full opacity-70 transition-[height] duration-300" style={{ height: `calc(${(value / max) * 100}% - 8px)`, background: accent }} />
        <span
          ref={cap}
          aria-hidden
          className={cn(
            "absolute left-0.5 top-0 h-3.5 w-6 rounded-[3px] bg-gradient-to-b from-[#ece6da] to-[#9f978a] shadow-[0_3px_0_rgb(0_0_0/0.55),inset_0_-1px_0_rgb(0_0_0/0.25)] transition-[scale] duration-150",
            drag ? "scale-110" : "group-hover:scale-105"
          )}
        >
          <span className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-black/40" />
        </span>
      </div>
      <span className="line-clamp-2 min-h-[22px] w-8 break-words text-center text-[9px] font-semibold leading-[1.05] tracking-normal text-[var(--k-faint)]">{short}</span>
    </div>
  );
}
