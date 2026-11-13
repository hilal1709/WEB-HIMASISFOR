"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { cn } from "@/lib/utils";

const Ctx = createContext(() => {});
export const usePostcard = () => useContext(Ctx);

const TONES = {
  ok: { stamp: "border-gold text-gold", word: "TERSIMPAN" },
  live: { stamp: "border-emerald-600 text-emerald-700", word: "TERBIT" },
  info: { stamp: "border-navy/50 text-navy", word: "INFO" },
  warn: { stamp: "border-orange-500 text-orange-600", word: "PERHATIAN" },
  error: { stamp: "border-maroon text-maroon", word: "GAGAL" },
};

/**
 * Toast "kartu pos" Meja Sambutan: kartu kecil miring di kiri bawah dengan perangko bergerigi
 * dan cap pos berjam. Masuk seperti diselipkan (anime.js), garis waktu di bawah, aksi opsional.
 */
export function PostcardToaster({ children }) {
  const [items, setItems] = useState([]);
  const remove = useCallback((id) => setItems((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((title, { tone = "ok", detail, action, duration = 4200 } = {}) => {
    const id = Math.random().toString(36).slice(2);
    setItems((t) => [...t.slice(-2), { id, title, tone, detail, action, duration, at: new Date() }]);
    return id;
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-24 left-4 z-[210] flex flex-col-reverse gap-3 sm:left-6">
        {items.map((t, i) => (
          <Postcard key={t.id} toast={t} tilt={i % 2 ? 1.2 : -1.6} onDone={() => remove(t.id)} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

function Postcard({ toast, tilt, onDone }) {
  const ref = useRef(null);
  const bar = useRef(null);
  const [paused, setPaused] = useState(false);
  const tone = TONES[toast.tone] ?? TONES.ok;

  useEffect(() => {
    animate(ref.current, { translateX: [-80, 0], rotate: [tilt - 8, tilt], opacity: [0, 1], duration: 650, ease: "outElastic(1, .75)" });
  }, [tilt]);

  const anim = useRef(null);
  const remaining = useRef(toast.duration);
  useEffect(() => {
    anim.current = animate(bar.current, { scaleX: [1, 0], duration: toast.duration, ease: "linear" });
    return () => anim.current?.pause();
  }, [toast.duration]);
  useEffect(() => {
    if (paused) {
      anim.current?.pause();
      return;
    }
    anim.current?.play();
    const start = Date.now();
    const t = setTimeout(() => {
      animate(ref.current, { translateY: 30, rotate: tilt + 6, opacity: 0, duration: 260, ease: "inQuad", onComplete: onDone });
    }, remaining.current);
    return () => {
      clearTimeout(t);
      remaining.current -= Date.now() - start;
    };
  }, [paused, tilt, onDone]);

  const time = toast.at.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return (
    <div
      ref={ref}
      role="status"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      style={{ transform: `rotate(${tilt}deg)` }}
      className="pointer-events-auto relative w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-[4px] bg-[#fffdf8] p-4 pr-20 text-navy opacity-0 shadow-[0_2px_0_rgb(20_33_61/0.05),0_24px_50px_-24px_rgb(20_33_61/0.55)] ring-1 ring-navy/10"
    >
      <span aria-hidden className="absolute inset-y-3 left-[62%] hidden border-l border-dashed border-navy/10" />
      {/* perangko */}
      <span
        aria-hidden
        className="absolute right-3 top-3 grid size-12 place-items-center bg-maroon text-[9px] font-bold tracking-widest text-gold-soft outline-2 outline-offset-2 outline-dashed outline-maroon/60"
      >
        SISFOR
      </span>
      {/* cap pos */}
      <span aria-hidden className={cn("absolute right-9 top-9 grid size-14 -rotate-12 place-items-center rounded-full border-2 border-dashed bg-[#fffdf8]/60 text-center text-[8px] font-bold leading-tight", tone.stamp)}>
        {tone.word}
        <br />
        {time}
      </span>
      <p className="font-serif text-[17px] leading-snug">{toast.title}</p>
      {toast.detail && <p className="mt-1 text-[13px] leading-snug text-text/60">{toast.detail}</p>}
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action.onClick();
            onDone();
          }}
          className="mt-3 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-maroon"
        >
          {toast.action.label}
        </button>
      )}
      <span ref={bar} aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-gold" />
    </div>
  );
}
