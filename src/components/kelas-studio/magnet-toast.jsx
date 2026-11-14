"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const Ctx = createContext(() => {});
export const useMagnetToast = () => useContext(Ctx);

const TONES = {
  ok: { pin: "bg-gold", bar: "bg-gold", tilt: -2 },
  live: { pin: "bg-emerald-500", bar: "bg-emerald-500", tilt: 1.5 },
  info: { pin: "bg-navy", bar: "bg-navy/60", tilt: -1 },
  warn: { pin: "bg-orange-400", bar: "bg-orange-400", tilt: 2 },
  error: { pin: "bg-maroon", bar: "bg-maroon", tilt: -2.5 },
};

/**
 * Toast "kartu magnet" Papan Jadwal: kartu kertas ditarik magnet ke pojok kanan bawah papan —
 * meluncur, sedikit miring, lalu "klik" menempel (anime.js spring). Garis bawah memendek = sisa waktu;
 * hover menjeda. Keluar dengan terangkat dari papan.
 */
export function MagnetToaster({ children }) {
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
      <div aria-live="polite" className="pointer-events-none fixed bottom-5 right-4 z-[220] flex w-[min(340px,calc(100vw-2rem))] flex-col-reverse gap-3 sm:right-6">
        {items.map((t) => (
          <MagnetCard key={t.id} toast={t} onDone={() => remove(t.id)} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

function MagnetCard({ toast, onDone }) {
  const ref = useRef(null);
  const pin = useRef(null);
  const bar = useRef(null);
  const anim = useRef(null);
  const tone = TONES[toast.tone] ?? TONES.ok;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    animate(ref.current, { translateX: [120, 0], rotate: [8, tone.tilt], opacity: [0, 1], duration: 700, ease: "outElastic(1, .75)" });
    animate(pin.current, { scale: [1.8, 1], duration: 420, delay: 380, ease: "outBack(3)" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    anim.current = animate(bar.current, { scaleX: [1, 0], duration: toast.duration, ease: "linear", onComplete: () => leave() });
    return () => anim.current?.pause();
  }, [toast.duration]); // eslint-disable-line react-hooks/exhaustive-deps

  const leave = () => {
    if (prefersReducedMotion() || !ref.current) return onDone();
    animate(ref.current, { translateY: [0, -18], scale: [1, 1.04], opacity: [1, 0], duration: 300, ease: "inQuad", onComplete: onDone });
  };

  return (
    <div
      ref={ref}
      role={toast.tone === "error" ? "alert" : "status"}
      onPointerEnter={() => anim.current?.pause()}
      onPointerLeave={() => anim.current?.play()}
      style={{ rotate: `${tone.tilt}deg` }}
      className="pointer-events-auto relative overflow-hidden rounded-[6px] border border-navy/10 bg-[#fffdf7] py-3 pl-9 pr-9 text-navy shadow-[0_18px_30px_-18px_rgb(20_33_61/0.55),0_2px_0_rgb(20_33_61/0.06)]"
    >
      <span ref={pin} aria-hidden className={cn("absolute left-3 top-3.5 size-3.5 rounded-full shadow-[inset_-2px_-2px_0_rgb(0_0_0/0.18),0_2px_3px_rgb(0_0_0/0.25)]", tone.pin)} />
      <p className="text-[13.5px] font-semibold leading-snug">{toast.title}</p>
      {toast.detail && <p className="mt-0.5 text-[12px] leading-snug text-text/60">{toast.detail}</p>}
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action.onClick?.();
            leave();
          }}
          className="mt-2 rounded-[4px] border border-navy/20 px-2.5 py-1 text-[12px] font-semibold text-navy transition-[background-color,transform] hover:bg-navy hover:text-white active:scale-95"
        >
          {toast.action.label}
        </button>
      )}
      <button type="button" aria-label="Tutup notifikasi" onClick={leave} className="absolute right-3 top-2.5 text-text/35 transition-colors hover:text-maroon">
        ×
      </button>
      <span ref={bar} aria-hidden className={cn("absolute inset-x-0 bottom-0 h-[3px] origin-left", tone.bar)} />
    </div>
  );
}
