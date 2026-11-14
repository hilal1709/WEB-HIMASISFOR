"use client";
import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { motion } from "motion/react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const kid = (path) => `konsol-${String(path).replace(/[^a-z0-9]+/gi, "-")}`;

/* ───────────── Loader: tujuh fader naik-turun berirama ───────────── */
export function KonsolLoader({ label = "Menyetel konsol" }) {
  const ref = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const caps = ref.current.querySelectorAll("[data-cap]");
    const a = animate(caps, {
      translateY: () => [0, -(18 + Math.random() * 54), 0],
      duration: 1100,
      delay: stagger(90),
      loop: true,
      ease: "inOutSine",
    });
    return () => a.pause();
  }, []);
  return (
    <div className="konsol grid min-h-dvh place-items-center">
      <div ref={ref} className="flex flex-col items-center gap-7" role="status" aria-label={label}>
        <div className="flex h-28 items-end gap-3 rounded-2xl border border-[var(--k-line)] bg-[var(--k-panel)] px-6 py-5">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="k-groove relative h-full w-1.5 rounded-full bg-black/40">
              <span data-cap className="absolute -left-[7px] bottom-1 h-3 w-5 rounded-[3px] bg-gradient-to-b from-[#e8e1d4] to-[#a59d90] shadow-[0_2px_0_rgb(0_0_0/0.5)]" />
            </span>
          ))}
        </div>
        <div className="text-center">
          <p className="font-serif text-2xl">Konsol Bidang</p>
          <p className="mt-1 font-mono text-[11px] tracking-[0.25em] text-[var(--k-mute)]">{label.toUpperCase()}…</p>
        </div>
      </div>
    </div>
  );
}

/* ───────────── Banner sinyal ───────────── */
const SIGNAL = {
  draft: { color: "var(--k-led-warn)", label: "DRAF" },
  legacy: { color: "#8fb3ff", label: "IMPOR" },
  remote: { color: "var(--k-gold)", label: "LIVE" },
  error: { color: "var(--k-led-bad)", label: "GALAT" },
};
/** Strip tipis di atas rak dengan gelombang sinyal beranimasi; dipakai untuk status draf, impor isi lama, admin lain. */
export function SignalBanner({ tone = "draft", children, action, onDismiss }) {
  const s = SIGNAL[tone] ?? SIGNAL.draft;
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-3 rounded-xl border border-[var(--k-line)] bg-[var(--k-panel)]/80 px-3 py-2 text-[13px]"
      role="status"
    >
      <span className="font-mono text-[10px] tracking-[0.22em]" style={{ color: s.color }}>{s.label}</span>
      <svg aria-hidden viewBox="0 0 64 16" className="k-signal hidden h-4 w-16 shrink-0 sm:block" style={{ color: s.color }}>
        <path d="M0 8 Q 4 0 8 8 T 16 8 T 24 8 T 32 8 T 40 8 T 48 8 T 56 8 T 64 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <p className="min-w-0 flex-1 text-[var(--k-mute)]">{children}</p>
      {action}
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Tutup" className="grid size-6 place-items-center rounded-md text-[var(--k-faint)] hover:bg-white/5 hover:text-[var(--k-ink)]">
          ×
        </button>
      )}
    </motion.div>
  );
}

/* ───────────── Ilustrasi: meja mixer (garis) ───────────── */
export function ConsoleIllustration({ className }) {
  return (
    <svg viewBox="0 0 240 150" fill="none" className={className} aria-hidden>
      <path d="M20 118 L40 40 H200 L220 118 Z" stroke="currentColor" strokeOpacity=".5" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M20 118 H220 V130 H20 Z" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.5" />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 62 + i * 23;
        const y = 60 + ((i * 17) % 34);
        return (
          <g key={i}>
            <path d={`M${x} 52 V108`} stroke="currentColor" strokeOpacity=".3" strokeWidth="1.5" strokeLinecap="round" />
            <rect x={x - 6} y={y} width="12" height="7" rx="2" fill="var(--k-gold)" />
          </g>
        );
      })}
      <circle cx="52" cy="48" r="2.5" fill="var(--k-led-ok)" />
      <circle cx="188" cy="48" r="2.5" fill="var(--k-maroon)" />
      <path d="M120 18 C 128 8, 140 8, 146 16" stroke="var(--k-gold)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M126 24 C 131 18, 138 18, 141 22" stroke="var(--k-gold)" strokeOpacity=".6" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ───────────── Pratinjau (iframe draft mode) ───────────── */
const DEVICES = [
  ["desktop", "Desktop", "100%"],
  ["phone", "Ponsel", "390px"],
];
export function PreviewSheet({ open, onOpenChange, refreshKey, anchor, slug }) {
  const frame = useRef(null);
  const [device, setDevice] = useState("desktop");
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const post = (msg) => frame.current?.contentWindow?.postMessage({ source: "konsol-bidang", ...msg }, window.location.origin);
  useEffect(() => {
    if (open) post({ type: "refresh" });
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open && anchor) post({ type: "scroll", anchor });
  }, [anchor, open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open) {
      setLoading(true);
      setFailed(false);
    }
  }, [open, slug]);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[min(100vw,1000px)] border-l border-[var(--k-line)] bg-[#0b1222] p-0 text-[var(--k-ink)]">
        <div className="flex items-center gap-3 border-b border-[var(--k-line)] px-5 py-3 pr-16">
          <span className="k-led size-2 rounded-full text-[var(--k-maroon)]" aria-hidden />
          <SheetTitle className="font-serif text-lg font-normal">Monitor draf</SheetTitle>
          <SheetDescription className="sr-only">Halaman Bidang Keahlian dengan isi draf</SheetDescription>
          <div className="ml-auto flex rounded-full bg-white/5 p-1 ring-1 ring-[var(--k-line)]">
            {DEVICES.map(([k, label]) => (
              <button key={k} type="button" onClick={() => setDevice(k)} className={cn("relative rounded-full px-3 py-1 text-[12.5px]", device === k ? "text-[#1a1406]" : "text-[var(--k-mute)]")}>
                {device === k && <motion.span layoutId="konsol-device" className="absolute inset-0 rounded-full bg-[var(--k-gold)]" />}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="relative flex-1 overflow-hidden p-3">
          {loading && !failed && (
            <div className="absolute inset-0 z-10 grid place-items-center">
              <p className="font-mono text-[11px] tracking-[0.25em] text-[var(--k-mute)]">MENYAMBUNGKAN MONITOR…</p>
            </div>
          )}
          {failed && (
            <div className="absolute inset-0 z-10 grid place-items-center p-6 text-center">
              <div>
                <p className="font-serif text-xl text-[var(--k-ink)]">Monitor tidak tersambung</p>
                <p className="mt-2 text-[13px] text-[var(--k-mute)]">Pastikan sesi admin masih aktif, lalu tutup dan buka pratinjau lagi.</p>
              </div>
            </div>
          )}
          {open && (
            <iframe
              key={`${slug ?? "page"}-${refreshKey}`}
              ref={frame}
              title="Pratinjau Bidang Keahlian"
              src={`/api/bidang-cms/preview?${slug ? `slug=${encodeURIComponent(slug)}&` : ""}v=${refreshKey}`}
              onLoad={() => { setLoading(false); setFailed(false); }}
              onError={() => { setLoading(false); setFailed(true); }}
              className="mx-auto h-full rounded-lg bg-white shadow-2xl transition-[width] duration-500"
              style={{ width: DEVICES.find((d) => d[0] === device)[2] }}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Gulir ke field & beri kilat emas. */
export function jumpTo(path) {
  const el = document.getElementById(kid(path));
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => {
    el.querySelector("input,textarea,button")?.focus?.({ preventScroll: true });
    gsap.fromTo(el, { boxShadow: "0 0 0 2px rgb(217 178 58 / 0.9)" }, { boxShadow: "0 0 0 0px rgb(217 178 58 / 0)", duration: 1.6, ease: "power2.out", clearProps: "boxShadow" });
  }, 420);
  return true;
}
