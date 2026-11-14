"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { animate, createSpring } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

const Ctx = createContext(() => {});
/** `toast(title, { tone, detail, action, duration })` — tone: ok | info | warn | error | live */
export const useMedal = () => useContext(Ctx);

const TONES = {
  ok: { disc: "var(--k-gold)", ribbon: ["#9b2335", "#6e1423"], glyph: "★" },
  info: { disc: "#c7ccd8", ribbon: ["#2c3346", "#1d2230"], glyph: "i" },
  warn: { disc: "#e0a64a", ribbon: ["#5c1a24", "#3d1118"], glyph: "!" },
  error: { disc: "#b8475a", ribbon: ["#3d1118", "#2a0b10"], glyph: "×" },
  live: { disc: "var(--k-gold)", ribbon: ["#14213d", "#0e1830"], glyph: "◉" },
};

/**
 * Toast "pita medali": medali tergantung pita jatuh dari atas kanan dan berayun dengan pegas
 * (anime.js createSpring), lalu tertarik ke atas saat hilang. Bisa membawa tombol aksi (mis. Urungkan).
 */
export function MedalToaster({ children }) {
  const [list, setList] = useState([]);
  const push = useCallback((title, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    setList((l) => [...l.slice(-3), { id, title, tone: "ok", duration: 3800, ...opts }]);
    return id;
  }, []);
  const drop = useCallback((id) => setList((l) => l.filter((t) => t.id !== id)), []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 top-0 z-[200] flex flex-col items-end gap-1 sm:right-8">
        {list.map((t) => (
          <Medal key={t.id} t={t} onDone={() => drop(t.id)} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

function Medal({ t, onDone }) {
  const ref = useRef(null);
  const swing = useRef(null);
  const leaving = useRef(false);
  const tone = TONES[t.tone] ?? TONES.ok;

  const leave = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    if (!ref.current || prefersReducedMotion()) return onDone();
    animate(ref.current, { translateY: [0, -140], opacity: [1, 0], duration: 420, ease: "inBack(1.4)", onComplete: onDone });
  }, [onDone]);

  useEffect(() => {
    const el = ref.current;
    if (el && !prefersReducedMotion()) {
      animate(el, { translateY: [-160, 0], duration: 900, ease: createSpring({ stiffness: 140, damping: 11 }) });
      animate(swing.current, { rotate: [-14, 9, -5, 2.5, 0], duration: 1600, ease: "outSine" });
    }
    const id = setTimeout(leave, t.duration);
    return () => clearTimeout(id);
  }, [leave, t.duration]);

  return (
    <div ref={ref} role="status" className="pointer-events-auto flex flex-col items-center">
      <div ref={swing} className="flex origin-top flex-col items-center">
        {/* pita */}
        <span aria-hidden className="flex h-8 w-9 overflow-hidden">
          <span className="h-full w-1/2 -skew-x-[18deg]" style={{ background: tone.ribbon[0] }} />
          <span className="h-full w-1/2 skew-x-[18deg]" style={{ background: tone.ribbon[1] }} />
        </span>
        <div className="flex max-w-[22rem] items-center gap-3 rounded-2xl border border-[var(--k-line-2)] bg-[var(--k-raise)]/95 py-2.5 pl-2.5 pr-3 text-[var(--k-ink)] shadow-[0_24px_50px_-20px_rgb(0_0_0/0.8)] backdrop-blur-md">
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-full font-serif text-[15px] font-bold text-[var(--k-gold-ink)] shadow-[inset_0_-3px_0_rgb(0_0_0/0.18),0_0_0_3px_rgb(255_255_255/0.06)]"
            style={{ background: `radial-gradient(circle at 35% 30%, #fff6, transparent 45%), ${tone.disc}` }}
          >
            {tone.glyph}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13.5px] font-semibold leading-snug">{t.title}</span>
            {t.detail && <span className="block text-[12.5px] leading-snug text-[var(--k-mute)]">{t.detail}</span>}
          </span>
          {t.action && (
            <button
              type="button"
              onClick={() => {
                t.action.onClick();
                leave();
              }}
              className="shrink-0 rounded-lg border border-[var(--k-line-2)] px-2.5 py-1 text-[12.5px] font-semibold text-[var(--k-gold)] transition-colors hover:bg-white/5"
            >
              {t.action.label}
            </button>
          )}
          <button type="button" onClick={leave} aria-label="Tutup" className={cn("grid size-6 shrink-0 place-items-center rounded-full text-[var(--k-faint)] hover:text-[var(--k-ink)]")}>
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
