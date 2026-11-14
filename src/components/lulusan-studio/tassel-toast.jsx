"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const Ctx = createContext(() => {});
export const useTasselToast = () => useContext(Ctx);

const TONES = {
  ok: { knot: "bg-gold", strand: "stroke-gold", bead: "fill-gold", edge: "border-gold/40" },
  live: { knot: "bg-emerald-400", strand: "stroke-emerald-400", bead: "fill-emerald-400", edge: "border-emerald-400/40" },
  info: { knot: "bg-white/80", strand: "stroke-white/70", bead: "fill-white/70", edge: "border-white/20" },
  warn: { knot: "bg-orange-400", strand: "stroke-orange-400", bead: "fill-orange-400", edge: "border-orange-400/40" },
  error: { knot: "bg-[#e86a7c]", strand: "stroke-[#e86a7c]", bead: "fill-[#e86a7c]", edge: "border-[#e86a7c]/50" },
};

/**
 * Toast "tali toga" Galeri Wisuda: kartu menggantung dari tepi atas kanan pada seutas tali,
 * rumbai di sudutnya berayun lalu reda (anime.js). Tali memendek = sisa waktu; hover menjeda.
 */
export function TasselToaster({ children }) {
  const [items, setItems] = useState([]);
  const remove = useCallback((id) => setItems((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((title, { tone = "ok", detail, action, duration = 4400 } = {}) => {
    const id = Math.random().toString(36).slice(2);
    setItems((t) => [...t.slice(-2), { id, title, tone, detail, action, duration }]);
    return id;
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 top-0 z-[220] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3 sm:right-6">
        {items.map((t, i) => (
          <Tassel key={t.id} toast={t} first={i === 0} onDone={() => remove(t.id)} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

function Tassel({ toast, first, onDone }) {
  const ref = useRef(null);
  const tassel = useRef(null);
  const cord = useRef(null);
  const anim = useRef(null);
  const tone = TONES[toast.tone] ?? TONES.ok;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    animate(ref.current, { translateY: [-90, 0], rotate: [-4, 0], opacity: [0, 1], duration: 900, ease: "outElastic(1, .6)" });
    animate(tassel.current, { rotate: [38, -24, 14, -8, 4, 0], duration: 1800, ease: "outSine" });
  }, []);

  useEffect(() => {
    anim.current = animate(cord.current, { scaleY: [1, 0], duration: toast.duration, ease: "linear", onComplete: () => leave() });
    return () => anim.current?.pause();
  }, [toast.duration]); // eslint-disable-line react-hooks/exhaustive-deps

  const leave = () => {
    if (prefersReducedMotion() || !ref.current) return onDone();
    animate(ref.current, { translateY: [0, -40], opacity: [1, 0], duration: 320, ease: "inBack(1.4)", onComplete: onDone });
  };

  return (
    <div
      ref={ref}
      role={toast.tone === "error" ? "alert" : "status"}
      onPointerEnter={() => anim.current?.pause()}
      onPointerLeave={() => anim.current?.play()}
      className={cn("pointer-events-auto relative", first ? "pt-10" : "pt-0")}
    >
      {first && <span ref={cord} aria-hidden className="absolute left-8 top-0 h-10 w-px origin-top bg-gold/70" />}
      {!first && <span ref={cord} aria-hidden className="hidden" />}
      <div className={cn("relative rounded-2xl border bg-[#0d1830]/95 py-3 pl-4 pr-10 text-white shadow-[0_30px_60px_-24px_rgb(5_10_25/0.9)] backdrop-blur-xl", tone.edge)}>
        <span aria-hidden className={cn("absolute left-[1.8rem] top-0 size-2 -translate-y-1/2 rounded-full ring-2 ring-[#0d1830]", tone.knot)} />
        <p className="text-[13.5px] font-semibold leading-snug">{toast.title}</p>
        {toast.detail && <p className="mt-0.5 text-[12px] leading-snug text-white/60">{toast.detail}</p>}
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action.onClick?.();
              leave();
            }}
            className="mt-2 rounded-full bg-gold px-3 py-1 text-[12px] font-semibold text-[#0d1830] transition-transform hover:scale-105 active:scale-95"
          >
            {toast.action.label}
          </button>
        )}
        <button type="button" aria-label="Tutup notifikasi" onClick={leave} className="absolute right-3 top-2.5 text-white/40 transition-colors hover:text-white">
          ×
        </button>
        {/* rumbai toga di sudut kanan bawah */}
        <svg ref={tassel} aria-hidden viewBox="0 0 20 34" className="absolute -bottom-6 right-5 h-8 w-5" style={{ transformOrigin: "50% 0%" }}>
          <path d="M10 0v10" className={tone.strand} strokeWidth="1.4" />
          <circle cx="10" cy="11" r="2.4" className={tone.bead} />
          {[-4, -2, 0, 2, 4].map((dx) => (
            <path key={dx} d={`M10 13 L${10 + dx} 32`} className={tone.strand} strokeWidth="1.1" strokeLinecap="round" />
          ))}
        </svg>
      </div>
    </div>
  );
}
