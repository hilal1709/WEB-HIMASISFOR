"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { cn } from "@/lib/utils";

const Ctx = createContext(() => {});
export const useMeter = () => useContext(Ctx);

const SEGMENTS = 14;
/** Nada toast → jumlah segmen menyala & warna puncak (seperti VU meter). */
const TONES = {
  ok: { lit: 9, peak: "#3ddc97", word: "SAVE" },
  live: { lit: 14, peak: "#d9b23a", word: "ON AIR" },
  info: { lit: 6, peak: "#8fb3ff", word: "INFO" },
  warn: { lit: 11, peak: "#f5c542", word: "PEAK" },
  error: { lit: 14, peak: "#ff5d6c", word: "CLIP" },
};

/**
 * Toast "VU meter" Konsol Bidang: pita gelap di kanan bawah. Saat masuk, segmen meter menyala
 * berurutan sampai level nadanya (anime.js stagger), lalu turun pelan sebagai penanda waktu.
 * Hover menjeda. Aksi opsional (mis. Urungkan).
 */
export function MeterToaster({ children }) {
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
      <div className="pointer-events-none fixed bottom-24 right-4 z-[210] flex flex-col-reverse gap-2.5 sm:right-6" aria-live="polite">
        {items.map((t) => (
          <Meter key={t.id} toast={t} onDone={() => remove(t.id)} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

function Meter({ toast, onDone }) {
  const ref = useRef(null);
  const segs = useRef(null);
  const [paused, setPaused] = useState(false);
  const tone = TONES[toast.tone] ?? TONES.ok;
  const remaining = useRef(toast.duration);

  useEffect(() => {
    animate(ref.current, { translateX: [60, 0], opacity: [0, 1], duration: 520, ease: "outExpo" });
    const lit = [...segs.current.children].slice(0, tone.lit);
    animate(lit, { opacity: [0.12, 1], scaleY: [0.4, 1], delay: stagger(28), duration: 260, ease: "outQuad" });
  }, [tone.lit]);

  useEffect(() => {
    if (paused) return;
    const start = Date.now();
    const t = setTimeout(() => {
      animate(ref.current, { translateX: 40, opacity: 0, duration: 240, ease: "inQuad", onComplete: onDone });
    }, remaining.current);
    return () => {
      clearTimeout(t);
      remaining.current -= Date.now() - start;
    };
  }, [paused, onDone]);

  return (
    <div
      ref={ref}
      role="status"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className="pointer-events-auto flex w-[min(360px,calc(100vw-2rem))] items-stretch gap-3 overflow-hidden rounded-xl border border-white/15 bg-[#0f1729]/95 p-3 pr-4 text-[#f3ece0] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9)] backdrop-blur"
    >
      <div ref={segs} aria-hidden className="flex w-3 shrink-0 flex-col-reverse gap-[3px] rounded bg-black/40 p-[3px]">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span
            key={i}
            className="h-full flex-1 origin-bottom rounded-[1px] opacity-[0.12]"
            style={{ background: i >= SEGMENTS - 3 ? tone.peak : i >= SEGMENTS - 6 ? "#f5c542" : "#3ddc97" }}
          />
        ))}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <p className="font-mono text-[9.5px] tracking-[0.22em]" style={{ color: tone.peak }}>
          {tone.word}
        </p>
        <p className="mt-0.5 font-serif text-[16px] leading-snug">{toast.title}</p>
        {toast.detail && <p className="mt-0.5 text-[12.5px] leading-snug text-white/65">{toast.detail}</p>}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action.onClick();
              onDone();
            }}
            className={cn("mt-2 rounded-md border border-white/15 px-2.5 py-1 text-[12px] font-semibold transition-colors hover:border-[#d9b23a] hover:text-[#d9b23a]")}
          >
            {toast.action.label}
          </button>
        )}
      </div>
    </div>
  );
}
