"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const Ctx = createContext(() => {});
export const useReceipt = () => useContext(Ctx);

const TONES = {
  ok: { head: "DISIMPAN", ink: "text-navy", rule: "bg-navy/70" },
  live: { head: "TERBIT", ink: "text-emerald-700", rule: "bg-emerald-600" },
  info: { head: "CATATAN", ink: "text-navy/80", rule: "bg-gold" },
  warn: { head: "PERHATIAN", ink: "text-amber-700", rule: "bg-amber-500" },
  error: { head: "GAGAL", ink: "text-maroon", rule: "bg-maroon" },
};

/**
 * Toast "struk tanda terima" Ruang Dosen: kertas termal keluar dari celah printer di kanan atas
 * (tinggi tumbuh dari 0, baris tercetak satu per satu dengan anime.js), tepi bawah bergerigi sobekan.
 * Ditarik kembali ke celah saat habis waktunya; hover menahan.
 */
export function ReceiptToaster({ children }) {
  const [items, setItems] = useState([]);
  const n = useRef(0);
  const remove = useCallback((id) => setItems((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((title, { tone = "ok", detail, action, duration = 4600 } = {}) => {
    const id = Math.random().toString(36).slice(2);
    n.current += 1;
    setItems((t) => [...t.slice(-2), { id, no: n.current, title, tone, detail, action, duration, at: new Date() }]);
    return id;
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed right-4 top-[70px] z-[210] flex flex-col items-end gap-3 sm:right-8" aria-live="polite">
        {/* celah printer */}
        {items.length > 0 && <span aria-hidden className="h-2 w-[min(300px,calc(100vw-2rem))] rounded-full bg-navy-deep/90 shadow-[inset_0_2px_3px_rgb(0_0_0/0.5)]" />}
        {items.map((t) => (
          <Receipt key={t.id} toast={t} onDone={() => remove(t.id)} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

function Receipt({ toast, onDone }) {
  const ref = useRef(null);
  const [paused, setPaused] = useState(false);
  const tone = TONES[toast.tone] ?? TONES.ok;
  const remaining = useRef(toast.duration);
  const closing = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const h = el.scrollHeight;
    animate(el, { height: [0, h], duration: 520, ease: "outQuart", onComplete: () => (el.style.height = "auto") });
    animate(el.querySelectorAll("[data-line]"), { opacity: [0, 1], translateY: [-4, 0], delay: stagger(70, { start: 140 }), duration: 260, ease: "outQuad" });
  }, []);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const el = ref.current;
    if (!el || prefersReducedMotion()) return onDone();
    animate(el, { height: [el.offsetHeight, 0], opacity: [1, 0.4], duration: 320, ease: "inQuad", onComplete: onDone });
  }, [onDone]);

  useEffect(() => {
    if (paused) return;
    const start = Date.now();
    const t = setTimeout(close, remaining.current);
    return () => {
      clearTimeout(t);
      remaining.current -= Date.now() - start;
    };
  }, [paused, close]);

  const time = toast.at.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return (
    <div
      ref={ref}
      role="status"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className="receipt pointer-events-auto -mt-3 w-[min(280px,calc(100vw-3rem))] overflow-hidden"
    >
      <div className="bg-[#fffefb] px-4 pb-5 pt-3 font-mono text-[11.5px] leading-relaxed text-navy shadow-[0_18px_40px_-20px_rgb(20_33_61/0.55)]">
        <div data-line className="flex items-center justify-between tracking-[0.2em]">
          <span className={cn("font-bold", tone.ink)}>{tone.head}</span>
          <span className="text-navy/45">#{String(toast.no).padStart(3, "0")}</span>
        </div>
        <span data-line aria-hidden className="mt-1.5 block border-t border-dashed border-navy/25" />
        <p data-line className="mt-2 font-sans text-[14px] font-semibold leading-snug">{toast.title}</p>
        {toast.detail && (
          <p data-line className="mt-1 font-sans text-[12.5px] leading-snug text-text/60">
            {toast.detail}
          </p>
        )}
        <div data-line className="mt-2 flex items-center justify-between text-navy/45">
          <span>RUANG DOSEN</span>
          <span className="tabular">{time}</span>
        </div>
        {toast.action && (
          <button
            data-line
            type="button"
            onClick={() => {
              toast.action.onClick();
              close();
            }}
            className="mt-2.5 w-full rounded-sm border border-navy/80 py-1 font-sans text-[12px] font-semibold text-navy transition-colors hover:bg-navy hover:text-white"
          >
            {toast.action.label}
          </button>
        )}
        <span data-line aria-hidden className={cn("mt-3 block h-[3px] w-10", tone.rule)} />
      </div>
    </div>
  );
}
