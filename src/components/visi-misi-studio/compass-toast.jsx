"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const Ctx = createContext(() => {});
export const useCompassToast = () => useContext(Ctx);

/** Arah jarum per nada: utara = beres, timur = info, barat = perhatian, selatan = gagal. */
const TONES = {
  ok: { deg: 0, ring: "ring-gold/60", needle: "fill-gold", word: "U" },
  live: { deg: 0, ring: "ring-emerald-500/60", needle: "fill-emerald-500", word: "U" },
  info: { deg: 90, ring: "ring-white/30", needle: "fill-white", word: "T" },
  warn: { deg: 270, ring: "ring-orange-400/60", needle: "fill-orange-400", word: "B" },
  error: { deg: 180, ring: "ring-[#e86a7c]/70", needle: "fill-[#e86a7c]", word: "S" },
};

/**
 * Toast "chip kompas" Ruang Kompas: kapsul navy di tengah bawah. Jarum berputar beberapa kali lalu
 * berhenti menunjuk arah status (anime.js, pegas). Garis emas di tepi bawah = sisa waktu; hover menjeda.
 */
export function CompassToaster({ children }) {
  const [items, setItems] = useState([]);
  const remove = useCallback((id) => setItems((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((title, { tone = "ok", detail, action, duration = 4200 } = {}) => {
    const id = Math.random().toString(36).slice(2);
    setItems((t) => [...t.slice(-2), { id, title, tone, detail, action, duration }]);
    return id;
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[210] flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <Chip key={t.id} toast={t} onDone={() => remove(t.id)} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

function Chip({ toast, onDone }) {
  const ref = useRef(null);
  const needle = useRef(null);
  const bar = useRef(null);
  const timer = useRef(null);
  const tone = TONES[toast.tone] ?? TONES.ok;

  useEffect(() => {
    if (prefersReducedMotion()) {
      needle.current.style.transform = `rotate(${tone.deg}deg)`;
      return;
    }
    animate(ref.current, { translateY: [24, 0], scale: [0.92, 1], opacity: [0, 1], duration: 520, ease: "outBack(1.6)" });
    animate(needle.current, { rotate: [-200, 720 + tone.deg], duration: 1400, ease: "outElastic(1, .55)" });
  }, [tone.deg]);

  const anim = useRef(null);
  useEffect(() => {
    anim.current = animate(bar.current, { scaleX: [1, 0], duration: toast.duration, ease: "linear", onComplete: () => leave() });
    return () => anim.current?.pause();
  }, [toast.duration]); // eslint-disable-line react-hooks/exhaustive-deps

  const leave = () => {
    clearTimeout(timer.current);
    if (prefersReducedMotion() || !ref.current) return onDone();
    animate(ref.current, { translateY: [0, 16], opacity: [1, 0], duration: 260, ease: "inQuad", onComplete: onDone });
  };

  return (
    <div
      ref={ref}
      role={toast.tone === "error" ? "alert" : "status"}
      onPointerEnter={() => anim.current?.pause()}
      onPointerLeave={() => anim.current?.play()}
      className="pointer-events-auto relative flex w-full max-w-md items-center gap-3 overflow-hidden rounded-full bg-navy-deep py-2 pl-2 pr-4 text-white shadow-[0_24px_50px_-20px_rgb(14_24_48/0.8)]"
    >
      <span className={cn("relative grid size-10 shrink-0 place-items-center rounded-full bg-navy ring-1", tone.ring)} aria-hidden>
        <svg viewBox="0 0 40 40" className="absolute inset-0 size-10 text-white/25">
          {[0, 90, 180, 270].map((d) => (
            <line key={d} x1="20" y1="4" x2="20" y2="7" stroke="currentColor" strokeWidth="1.4" transform={`rotate(${d} 20 20)`} />
          ))}
        </svg>
        <svg ref={needle} viewBox="0 0 40 40" className="size-10" style={{ transformOrigin: "50% 50%" }}>
          <path d="M20 8l3.2 12H16.8z" className={tone.needle} />
          <path d="M20 32l-3.2-12h6.4z" className="fill-white/30" />
          <circle cx="20" cy="20" r="1.8" className="fill-navy-deep" />
        </svg>
      </span>
      <div className="min-w-0 flex-1 py-0.5">
        <p className="truncate text-[13.5px] font-semibold">{toast.title}</p>
        {toast.detail && <p className="truncate text-[12px] text-white/60">{toast.detail}</p>}
      </div>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action.onClick?.();
            leave();
          }}
          className="shrink-0 rounded-full bg-gold px-3 py-1 text-[12px] font-semibold text-navy-deep transition-transform hover:scale-105 active:scale-95"
        >
          {toast.action.label}
        </button>
      )}
      <button type="button" aria-label="Tutup notifikasi" onClick={leave} className="shrink-0 text-white/40 transition-colors hover:text-white">
        ×
      </button>
      <span ref={bar} aria-hidden className="absolute inset-x-6 bottom-0 h-[2px] origin-left rounded-full bg-gold/80" />
    </div>
  );
}
