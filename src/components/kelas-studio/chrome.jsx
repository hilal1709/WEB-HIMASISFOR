"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { AnimatePresence, motion } from "motion/react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { ClassPathsIllustration } from "@/components/illustrations/line-illustrations";
import { cn } from "@/lib/utils";

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
/** Blok contoh untuk loader: [hari, mulai (0–1), tinggi (0–1), warna]. */
const DEMO = [
  [0, 0.05, 0.22, "bg-maroon"],
  [0, 0.4, 0.18, "bg-maroon"],
  [1, 0.12, 0.2, "bg-gold/70"],
  [2, 0.02, 0.3, "bg-maroon"],
  [2, 0.55, 0.16, "bg-navy"],
  [3, 0.2, 0.25, "bg-maroon"],
  [4, 0.08, 0.14, "bg-navy"],
  [5, 0.3, 0.28, "bg-gold/70"],
];

/* ───────────── Loader: blok magnet jatuh lalu menempel di kisi minggu ───────────── */
export function BoardLoader({ label = "Menyusun Papan Jadwal" }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
      tl.fromTo("[data-block]", { y: -160, opacity: 0, rotate: () => gsap.utils.random(-14, 14) }, { y: 0, opacity: 1, rotate: 0, duration: 0.7, ease: "bounce.out", stagger: 0.12 })
        .to("[data-block]", { opacity: 0, scale: 0.9, duration: 0.35, stagger: 0.04, delay: 0.8 });
    }, el);
    const days = animate(el.querySelectorAll("[data-day]"), { translateY: [6, 0], opacity: [0, 1], duration: 500, delay: stagger(70) });
    const dots = animate(el.querySelectorAll("[data-dot]"), { opacity: [0.2, 1], duration: 500, delay: stagger(160), loop: true, alternate: true });
    return () => {
      ctx.revert();
      days.revert?.();
      dots.revert?.();
    };
  }, []);
  return (
    <div ref={ref} role="status" aria-label={label} className="papan-room grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="papan-sheet rounded-[12px] p-4 sm:p-6">
          <div className="grid grid-cols-7 gap-1.5 border-b border-navy/10 pb-2">
            {DAYS.map((d) => (
              <span key={d} data-day className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-text/45">
                {d}
              </span>
            ))}
          </div>
          <div className="relative mt-2 grid h-52 grid-cols-7 gap-1.5">
            {DAYS.map((d, i) => (
              <span key={d} className={cn("rounded-sm", i >= 5 ? "bg-maroon/[0.04]" : "bg-navy/[0.03]")} />
            ))}
            {DEMO.map(([day, top, h, c], i) => (
              <span
                key={i}
                data-block
                className={cn("absolute rounded-[5px] shadow-[0_6px_10px_-6px_rgb(20_33_61/0.6)]", c)}
                style={{ left: `calc(${(day / 7) * 100}% + 3px)`, width: `calc(${100 / 7}% - 6px)`, top: `${top * 100}%`, height: `${h * 100}%` }}
              />
            ))}
          </div>
        </div>
        <p className="mt-6 text-center font-serif text-2xl text-navy">
          Papan <em className="text-maroon">Jadwal</em>
        </p>
        <p className="mt-1 text-center text-[13px] text-text/55">
          {label}
          <span data-dot>.</span>
          <span data-dot>.</span>
          <span data-dot>.</span>
        </p>
      </div>
    </div>
  );
}

/* ───────────── Banner: strip magnet yang menempel di tepi papan ───────────── */
const STRIP = {
  draft: { bar: "bg-gold", text: "text-navy", knob: "bg-navy" },
  info: { bar: "bg-white", text: "text-navy", knob: "bg-gold" },
  conflict: { bar: "bg-maroon", text: "text-white", knob: "bg-white" },
  lint: { bar: "bg-orange-200", text: "text-orange-950", knob: "bg-orange-500" },
  offline: { bar: "bg-navy/10", text: "text-navy", knob: "bg-text/40" },
};

/** Strip pengumuman: meluncur dari kiri, lalu dua magnet bulat "klik" menahan ujungnya. */
export function MagnetStrip({ tone = "draft", children, action, onDismiss }) {
  const ref = useRef(null);
  const t = STRIP[tone] ?? STRIP.draft;
  useLayoutEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, { x: -30, opacity: 0, rotate: -0.8 }, { x: 0, opacity: 1, rotate: 0, duration: 0.6, ease: "back.out(2)" });
      gsap.fromTo("[data-knob]", { scale: 0 }, { scale: 1, duration: 0.35, ease: "back.out(3)", stagger: 0.08, delay: 0.35 });
    }, ref.current);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={ref} role="status" className={cn("relative flex items-center gap-3 rounded-[4px] py-2 pl-8 pr-8 text-[13px] font-medium shadow-[0_8px_16px_-12px_rgb(20_33_61/0.6)]", t.bar, t.text)}>
      <span data-knob aria-hidden className={cn("absolute left-2.5 top-1/2 size-3 -translate-y-1/2 rounded-full shadow-[inset_-1px_-1px_0_rgb(0_0_0/0.2)]", t.knob)} />
      <span className="min-w-0 flex-1">{children}</span>
      {action && <span className="shrink-0">{action}</span>}
      {onDismiss ? (
        <button type="button" onClick={onDismiss} aria-label="Sembunyikan" className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100">
          ×
        </button>
      ) : (
        <span data-knob aria-hidden className={cn("absolute right-2.5 top-1/2 size-3 -translate-y-1/2 rounded-full shadow-[inset_-1px_-1px_0_rgb(0_0_0/0.2)]", t.knob)} />
      )}
    </div>
  );
}

/* ───────────── Status simpan: jam kecil, jarum berputar saat menyimpan ───────────── */
export function SaveClock({ status }) {
  const hand = useRef(null);
  const label = { idle: "Tersimpan", typing: "Mengetik…", saving: "Menyimpan…", saved: "Draf tersimpan", error: "Gagal simpan" }[status] ?? "Tersimpan";
  const busy = status === "saving" || status === "typing";
  useEffect(() => {
    if (!hand.current || prefersReducedMotion()) return;
    const a = busy ? animate(hand.current, { rotate: "1turn", duration: status === "saving" ? 700 : 2400, loop: true, ease: "linear" }) : animate(hand.current, { rotate: 0, duration: 300 });
    return () => a.pause();
  }, [busy, status]);
  return (
    <span className="inline-flex items-center gap-2 text-[12px] text-text/60" aria-live="polite">
      <svg viewBox="0 0 16 16" className={cn("size-4", status === "error" ? "text-maroon" : busy ? "text-gold" : "text-emerald-600")} aria-hidden>
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <g ref={hand} style={{ transformOrigin: "8px 8px" }}>
          <path d="M8 8V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        <path d="M8 8l2.4 1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={label} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -6, opacity: 0 }} transition={{ duration: 0.2 }}>
          {label}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* ───────────── Pratinjau tertambat (panel kanan, bisa dilipat) ───────────── */
const DEVICES = { desktop: 1280, mobile: 390 };

/**
 * Pratinjau draf yang ditambatkan di sisi kanan papan (bukan jendela mengambang).
 * Lebar panel dibaca ResizeObserver lalu halaman diskalakan agar pas.
 */
export function PreviewDock({ open, refreshKey, anchor, onClose }) {
  const frame = useRef(null);
  const box = useRef(null);
  const [device, setDevice] = useState("desktop");
  const [width, setWidth] = useState(420);
  const [loading, setLoading] = useState(true);
  const ready = useRef(false);
  const post = (msg) => frame.current?.contentWindow?.postMessage({ source: "papan-jadwal", ...msg }, window.location.origin);

  useEffect(() => {
    if (!box.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, [open]);
  useEffect(() => {
    const onMsg = (e) => {
      if (e.origin === window.location.origin && e.data?.type === "ready") {
        ready.current = true;
        setLoading(false);
        if (anchor) post({ type: "scroll", anchor });
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [anchor]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open && ready.current) post({ type: "refresh" });
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open && ready.current && anchor) post({ type: "scroll", anchor });
  }, [anchor, open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) ready.current = false;
  }, [open]);

  const w = DEVICES[device];
  const scale = Math.min(1, width / w);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="dock"
          aria-label="Pratinjau draf"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className="papan-sheet fixed inset-x-2 bottom-2 top-[30vh] z-[70] flex flex-col overflow-hidden rounded-[12px] shadow-[0_-20px_40px_-20px_rgb(20_33_61/0.5)] xl:sticky xl:inset-auto xl:top-20 xl:z-auto xl:h-[calc(100vh-6rem)] xl:shadow-none"
        >
          <div className="flex items-center gap-2 border-b border-navy/10 px-3 py-2">
            <span aria-hidden className="size-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgb(16_185_129/0.15)]" />
            <p className="text-[12px] font-semibold text-navy">Pratinjau draf</p>
            <div className="ml-auto flex rounded-md border border-navy/10 p-0.5">
              {[["desktop", "Desktop"], ["mobile", "Ponsel"]].map(([k, l]) => (
                <button key={k} type="button" onClick={() => setDevice(k)} aria-pressed={device === k} className={cn("relative rounded px-2 py-0.5 text-[11px]", device === k ? "text-white" : "text-navy/60")}>
                  {device === k && <motion.span layoutId="dock-device" className="absolute inset-0 rounded bg-navy" />}
                  <span className="relative">{l}</span>
                </button>
              ))}
            </div>
            <a href="/api/program-kelas-cms/preview" target="_blank" rel="noopener noreferrer" className="rounded px-1.5 py-0.5 text-[11px] text-navy/60 hover:bg-navy/5 hover:text-navy">
              Tab baru ↗
            </a>
            <button type="button" onClick={onClose} aria-label="Tutup pratinjau" className="grid size-6 place-items-center rounded text-text/45 hover:bg-navy/5 hover:text-navy">
              ×
            </button>
          </div>
          <div ref={box} className="relative min-h-0 flex-1 overflow-hidden bg-cream">
            <div className="absolute left-1/2 top-0 origin-top" style={{ width: w, height: `${100 / scale}%`, transform: `translateX(-50%) scale(${scale})` }}>
              <iframe ref={frame} title="Pratinjau Program Kelas" src="/api/program-kelas-cms/preview" className="size-full border-0 bg-cream" onLoad={() => setLoading(false)} />
            </div>
            {loading && (
              <div className="absolute inset-0 grid place-items-center bg-cream">
                <LottieIllustration src="/lottie/calendar.json" className="w-20" />
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/* ───────────── Gagal muat ───────────── */
export function Failure({ message, onRetry }) {
  return (
    <div className="papan-room grid min-h-screen place-items-center px-4">
      <div className="max-w-sm text-center">
        <div className="mx-auto w-64 text-navy/60">
          <ClassPathsIllustration className="h-auto w-full text-navy/60" />
        </div>
        <p className="mt-4 font-serif text-2xl text-navy">Papan belum bisa dibuka</p>
        <p className="mt-2 text-[14px] text-text/60">{message}</p>
        <button type="button" onClick={onRetry} className="mt-5 rounded-md bg-maroon px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-maroon-deep">
          Coba lagi
        </button>
      </div>
    </div>
  );
}
