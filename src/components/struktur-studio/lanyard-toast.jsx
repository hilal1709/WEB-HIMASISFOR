"use client";
import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const Ctx = createContext(() => {});
/** `push(title, { tone: ok|live|info|warn|error, detail, action: {label,onClick}, duration })` */
export const useLanyard = () => useContext(Ctx);

const TONE = {
  ok: { clip: "bg-[#3aa57a]", tag: "Tersimpan" },
  live: { clip: "bg-gold", tag: "Langsung" },
  info: { clip: "bg-[#6b8bd6]", tag: "Info" },
  warn: { clip: "bg-[#e0a43a]", tag: "Perhatian" },
  error: { clip: "bg-[#e86a7c]", tag: "Gagal" },
};

/**
 * Toast "kartu pengenal": tiap pesan turun dari atas layar tergantung tali, berayun pelan
 * (GSAP elastic) lalu diam; saat selesai ditarik kembali ke atas. Maks. 3 kartu bertumpuk.
 */
export function LanyardToaster({ children }) {
  const [items, setItems] = useState([]);
  const seq = useRef(0);

  const remove = useCallback((id) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  const push = useCallback((title, opts = {}) => {
    const id = ++seq.current;
    setItems((xs) => [...xs.slice(-2), { id, title, tone: "ok", duration: 4200, ...opts }]);
    return id;
  }, []);

  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 top-0 z-[300] flex flex-col items-end gap-2 sm:right-8">
        {items.map((t, i) => (
          <Card key={t.id} t={t} index={i} onDone={() => remove(t.id)} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

function Card({ t, index, onDone }) {
  const ref = useRef(null);
  const leaving = useRef(false);
  const tone = TONE[t.tone] ?? TONE.ok;

  const leave = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    if (prefersReducedMotion() || !ref.current) return onDone();
    gsap.to(ref.current, { y: -180, rotate: 4, opacity: 0, duration: 0.45, ease: "power3.in", onComplete: onDone });
  }, [onDone]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!prefersReducedMotion()) {
      gsap.fromTo(el, { y: -200, rotate: -9 }, { y: 0, rotate: 0, duration: 1.4, ease: "elastic.out(1, 0.45)" });
    }
    const timer = setTimeout(leave, t.duration);
    return () => clearTimeout(timer);
  }, [leave, t.duration]);

  return (
    <div ref={ref} style={{ transformOrigin: "50% -60px", marginTop: index === 0 ? 0 : -4 }} className="pointer-events-auto relative flex flex-col items-center">
      {/* tali */}
      <span aria-hidden className="h-6 w-[2px] bg-gradient-to-b from-transparent via-white/40 to-white/70" />
      <span aria-hidden className="-mt-0.5 h-2.5 w-5 rounded-sm border border-white/50 bg-navy-deep" />
      <div
        role={t.tone === "error" ? "alert" : "status"}
        className="relative -mt-0.5 w-[300px] overflow-hidden rounded-xl border border-white/10 bg-[#0f1830]/95 text-white shadow-[0_30px_60px_-24px_rgb(0_0_0/0.7)] backdrop-blur"
      >
        <span aria-hidden className="absolute left-1/2 top-2 h-1.5 w-10 -translate-x-1/2 rounded-full bg-white/10" />
        <div className="flex gap-3 px-4 pb-3.5 pt-5">
          <span aria-hidden className={cn("mt-1 h-9 w-1.5 shrink-0 rounded-full", tone.clip)} />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">{tone.tag}</p>
            <p className="mt-0.5 text-[14px] font-medium leading-snug">{t.title}</p>
            {t.detail && <p className="mt-1 text-[12.5px] leading-relaxed text-white/55">{t.detail}</p>}
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action.onClick();
                  leave();
                }}
                className="mt-2.5 rounded-md border border-gold/40 px-2.5 py-1 text-[12px] font-semibold text-gold-soft transition-colors hover:bg-gold hover:text-navy"
              >
                {t.action.label}
              </button>
            )}
          </div>
          <button type="button" onClick={leave} aria-label="Tutup" className="-mr-1 -mt-1 grid size-6 shrink-0 place-items-center rounded text-white/40 transition-colors hover:bg-white/10 hover:text-white">
            <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
