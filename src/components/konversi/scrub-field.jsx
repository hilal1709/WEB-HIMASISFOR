"use client";
import { useLayoutEffect as useEffect, useRef } from "react";
import { animate } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Masukan angka "geser" (pola 21st.dev Number Field + Quantity Stepper):
 * - seret angka ke kiri/kanan (tiap 10px = 1 langkah), kursor ew-resize
 * - tombol − / + ditekan-tahan → berulang dan makin cepat
 * - ←/→/↑/↓, PageUp/PageDown (±5), Home/End
 * - menyentuh batas → angka bergetar halus (anime.js)
 */
export function ScrubField({ label, value, unit, min, max, onChange, hint, className }) {
  const box = useRef(null);
  const drag = useRef(null);
  const hold = useRef(null);
  const latest = useRef(value);
  latest.current = value;

  const shake = () => {
    if (!box.current || prefersReducedMotion()) return;
    animate(box.current, { translateX: [0, -5, 5, -3, 3, 0], duration: 320, ease: "outQuad" });
  };

  const step = (d) => {
    const next = Math.min(max, Math.max(min, latest.current + d));
    if (next === latest.current) {
      shake();
      return false;
    }
    latest.current = next;
    onChange(next);
    return true;
  };

  const stopHold = () => {
    clearTimeout(hold.current);
    hold.current = null;
  };
  useEffect(() => {
    window.addEventListener("pointerup", stopHold);
    return () => {
      window.removeEventListener("pointerup", stopHold);
      stopHold();
    };
  }, []);

  const startHold = (d) => {
    let delay = 360;
    const run = () => {
      if (!step(d)) return stopHold();
      delay = Math.max(45, delay * 0.78);
      hold.current = setTimeout(run, delay);
    };
    run();
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, base: latest.current };
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const d = Math.round((e.clientX - drag.current.x) / 10);
    const next = Math.min(max, Math.max(min, drag.current.base + d));
    if (next !== latest.current) {
      latest.current = next;
      onChange(next);
    } else if (drag.current.base + d !== next && !drag.current.hit) {
      drag.current.hit = true;
      shake();
    }
  };
  const onPointerUp = () => (drag.current = null);

  const onKey = (e) => {
    const map = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 5, PageDown: -5 };
    if (map[e.key]) {
      e.preventDefault();
      step(map[e.key]);
    } else if (e.key === "Home") {
      e.preventDefault();
      onChange(min);
    } else if (e.key === "End") {
      e.preventDefault();
      onChange(max);
    }
  };

  const btn = (d, aria, children) => (
    <button
      type="button"
      aria-label={aria}
      tabIndex={-1}
      onPointerDown={(e) => {
        e.preventDefault();
        startHold(d);
      }}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
      disabled={d < 0 ? value <= min : value >= max}
      className="grid size-10 shrink-0 place-items-center rounded-md border border-line bg-white text-navy transition-[background-color,border-color,transform] duration-200 hover:border-navy/40 hover:bg-cream active:scale-90 disabled:opacity-35"
    >
      {children}
    </button>
  );

  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("rounded-lg border border-line bg-white p-4", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span id={`${label}-l`} className="text-[13px] font-semibold text-navy">{label}</span>
        {hint && <span className="text-[12px] text-text/50">{hint}</span>}
      </div>
      <div className="mt-3 flex items-center gap-3">
        {btn(-1, `Kurangi ${label}`, <svg aria-hidden viewBox="0 0 16 16" className="size-4"><path d="M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>)}
        <div
          role="spinbutton"
          tabIndex={0}
          aria-labelledby={`${label}-l`}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${value} ${unit}`}
          onKeyDown={onKey}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="group relative flex min-w-0 flex-1 cursor-ew-resize touch-none select-none items-baseline justify-center gap-1.5 rounded-md py-1 outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <span ref={box} className="tabular font-serif text-[2.4rem] leading-none text-navy">{value}</span>
          <span className="text-[13px] text-text/55">{unit}</span>
          <span aria-hidden className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10.5px] text-text/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            ⟷ geser
          </span>
        </div>
        {btn(1, `Tambah ${label}`, <svg aria-hidden viewBox="0 0 16 16" className="size-4"><path d="M3 8h10M8 3v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>)}
      </div>
      {/* rel posisi nilai */}
      <div aria-hidden className="relative mt-4 h-[3px] rounded-full bg-cream-2">
        <span className="absolute inset-y-0 left-0 rounded-full bg-maroon transition-[width] duration-300 ease-out" style={{ width: `${pct}%` }} />
        <span className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-gold shadow transition-[left] duration-300 ease-out" style={{ left: `${pct}%` }} />
      </div>
    </div>
  );
}
