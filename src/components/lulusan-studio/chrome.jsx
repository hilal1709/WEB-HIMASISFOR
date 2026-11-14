"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { motion } from "motion/react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { GraduatePathIllustration } from "@/components/illustrations/line-illustrations";
import { cn } from "@/lib/utils";
import { fid } from "./fields";

/* ───────────── Loader: toga dilempar, lalu kerangka bento tersusun ───────────── */
export function TogaLoader({ label = "Menyiapkan Galeri Wisuda" }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.timeline({ repeat: -1, repeatDelay: 0.4 })
        .to("[data-cap]", { y: -70, rotate: -200, duration: 0.7, ease: "power2.out" })
        .to("[data-cap]", { y: 0, rotate: -360, duration: 0.8, ease: "bounce.out" })
        .set("[data-cap]", { rotate: 0 });
      gsap.from("[data-skel]", { opacity: 0, y: 24, scale: 0.96, duration: 0.8, stagger: 0.07, ease: "expo.out", delay: 0.2 });
    }, el);
    const dots = animate(el.querySelectorAll("[data-dot]"), { opacity: [0.2, 1], duration: 500, delay: stagger(160), loop: true, alternate: true });
    return () => {
      ctx.revert();
      dots.revert?.();
    };
  }, []);
  return (
    <div ref={ref} role="status" aria-label={label} className="galeri-room min-h-screen overflow-hidden px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <div data-cap className="w-24">
            <LottieIllustration src="/lottie/grad-cap.json" className="w-24" />
          </div>
          <p className="mt-4 font-serif text-2xl text-white">
            Galeri <em className="text-gold-soft">Wisuda</em>
          </p>
          <p className="mt-1 text-[13px] text-white/50">
            {label}
            <span data-dot>.</span>
            <span data-dot>.</span>
            <span data-dot>.</span>
          </p>
        </div>
        <div aria-hidden className="mt-10 grid auto-rows-[120px] grid-cols-2 gap-3 lg:grid-cols-6">
          {["lg:col-span-4 lg:row-span-2", "lg:col-span-2", "lg:col-span-2", "lg:col-span-3 lg:row-span-2", "lg:col-span-3", "lg:col-span-3"].map((c, i) => (
            <div key={i} data-skel className={cn("animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.03]", c)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────── Banner pita selempang ───────────── */
const SASH = {
  draft: "bg-gold text-[#0d1830]",
  info: "bg-white/90 text-[#0d1830]",
  conflict: "bg-[#e86a7c] text-white",
  lint: "bg-orange-300 text-[#0d1830]",
  offline: "bg-white/15 text-white",
};

/** Pita miring dengan ujung berpotongan seperti selempang wisuda; masuk dengan sapuan clip-path. */
export function SashBanner({ tone = "draft", children, action, onDismiss }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    gsap.fromTo(ref.current, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.9, ease: "expo.out" });
  }, []);
  return (
    <div
      ref={ref}
      role="status"
      className={cn("relative flex items-center gap-3 py-2.5 pl-7 pr-8 text-[13px] font-medium sm:-skew-x-6", SASH[tone])}
      style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 14px) 50%, 100% 100%, 0 100%, 14px 50%)" }}
    >
      <span className="min-w-0 flex-1 sm:skew-x-6">{children}</span>
      {action && <span className="shrink-0 sm:skew-x-6">{action}</span>}
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Sembunyikan" className="shrink-0 opacity-60 hover:opacity-100 sm:skew-x-6">
          ×
        </button>
      )}
    </div>
  );
}

/* ───────────── Cincin kelengkapan ───────────── */
export function Ring({ value = 1, size = 30, className }) {
  const r = (size - 4) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }} title={`${Math.round(value * 100)}% terisi`}>
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="2" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={value >= 1 ? "var(--gold)" : "rgb(253 186 116)"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - value) }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <span className="text-[9px] font-semibold tabular-nums text-white/60">{Math.round(value * 100)}</span>
    </span>
  );
}

/* ───────────── Status simpan ───────────── */
export function SaveState({ status }) {
  const ref = useRef(null);
  const label = { idle: "Tersimpan", typing: "Mengetik…", saving: "Menyimpan…", saved: "Draf tersimpan", error: "Gagal simpan" }[status] ?? "Tersimpan";
  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    animate(ref.current, { translateY: [6, 0], opacity: [0, 1], duration: 380, ease: "outQuad" });
  }, [label]);
  return (
    <span className="inline-flex items-center gap-2 text-[12px] text-white/55">
      <span className={cn("size-1.5 rounded-full", status === "error" ? "bg-[#e86a7c]" : status === "saving" || status === "typing" ? "animate-pulse bg-gold" : "bg-emerald-400")} />
      <span ref={ref}>{label}</span>
    </span>
  );
}

/* ───────────── Pratinjau mengambang (picture-in-picture) ───────────── */
const DEVICES = { desktop: { w: 1280, box: 440 }, mobile: { w: 390, box: 230 } };

/**
 * Jendela pratinjau draf yang mengambang di kanan bawah: bisa diseret, diperkecil,
 * diganti desktop/ponsel. Di layar kecil menjadi lembar bawah selebar layar.
 */
export function PipPreview({ open, onClose, refreshKey, anchor }) {
  const frame = useRef(null);
  const box = useRef(null);
  const [device, setDevice] = useState("desktop");
  const [mini, setMini] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [narrow, setNarrow] = useState(false);
  const ready = useRef(false);
  const post = (msg) => frame.current?.contentWindow?.postMessage({ source: "galeri-wisuda", ...msg }, window.location.origin);

  useEffect(() => {
    const mq = matchMedia("(max-width: 1023px)");
    const fn = () => setNarrow(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
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

  const drag = (e) => {
    if (narrow || e.button !== 0) return;
    e.preventDefault();
    const sx = e.clientX - pos.x;
    const sy = e.clientY - pos.y;
    const move = (ev) => setPos({ x: Math.min(0, ev.clientX - sx), y: Math.min(0, ev.clientY - sy) });
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.body.style.userSelect = "";
    };
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const d = DEVICES[device];
  const width = narrow ? "100vw" : d.box;
  const scale = narrow ? (device === "mobile" ? 0.9 : 0.3) : d.box / d.w;
  const h = mini ? 0 : narrow ? 300 : device === "mobile" ? 440 : 300;

  if (!open) return null;
  return (
    <motion.section
      ref={box}
      aria-label="Pratinjau draf"
      initial={{ opacity: 0, y: 40, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className={cn("fixed z-[90] overflow-hidden border border-white/10 bg-[#0a1428] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)]", narrow ? "inset-x-0 bottom-0 rounded-t-2xl" : "bottom-5 right-5 rounded-2xl")}
      style={{ width, transform: narrow ? undefined : `translate(${pos.x}px, ${pos.y}px)` }}
    >
      <div onPointerDown={drag} className={cn("flex items-center gap-2 px-3 py-2", !narrow && "cursor-grab active:cursor-grabbing")}>
        <span className="flex gap-1" aria-hidden>
          <span className="size-2 rounded-full bg-[#e86a7c]/70" />
          <span className="size-2 rounded-full bg-gold/70" />
          <span className="size-2 rounded-full bg-emerald-400/70" />
        </span>
        <p className="ml-1 text-[12px] font-semibold text-white/80">Pratinjau draf</p>
        <div className="ml-auto flex rounded-full bg-white/10 p-0.5" onPointerDown={(e) => e.stopPropagation()}>
          {[["desktop", "Desktop"], ["mobile", "Ponsel"]].map(([k, l]) => (
            <button key={k} type="button" onClick={() => setDevice(k)} className={cn("relative rounded-full px-2.5 py-0.5 text-[11px]", device === k ? "text-[#0d1830]" : "text-white/65")}>
              {device === k && <motion.span layoutId="pip-device" className="absolute inset-0 rounded-full bg-gold" />}
              <span className="relative">{l}</span>
            </button>
          ))}
        </div>
        <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={() => setMini((m) => !m)} aria-label={mini ? "Perbesar pratinjau" : "Perkecil pratinjau"} className="grid size-6 place-items-center rounded text-white/55 hover:bg-white/10 hover:text-white">
          {mini ? "▴" : "▾"}
        </button>
        <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={onClose} aria-label="Tutup pratinjau" className="grid size-6 place-items-center rounded text-white/55 hover:bg-white/10 hover:text-white">
          ×
        </button>
      </div>
      <motion.div animate={{ height: h }} transition={{ type: "spring", stiffness: 300, damping: 34 }} className="relative overflow-hidden bg-cream">
        <div className="absolute left-1/2 top-0 origin-top" style={{ width: d.w, height: h / scale, transform: `translateX(-50%) scale(${scale})` }}>
          <iframe ref={frame} title="Pratinjau Profil Lulusan" src="/api/profil-lulusan-cms/preview" className="size-full border-0 bg-cream" onLoad={() => setLoading(false)} />
        </div>
        {loading && (
          <div className="absolute inset-0 grid place-items-center bg-[#0a1428]">
            <LottieIllustration src="/lottie/grad-cap.json" className="w-16" />
          </div>
        )}
      </motion.div>
    </motion.section>
  );
}

/* ───────────── Gagal muat ───────────── */
export function Failure({ message, onRetry }) {
  return (
    <div className="galeri-room grid min-h-screen place-items-center px-4">
      <div className="max-w-sm text-center">
        <div className="mx-auto w-56 text-gold-soft opacity-70">
          <GraduatePathIllustration className="h-auto w-full" />
        </div>
        <p className="mt-4 font-serif text-2xl text-white">Galeri belum bisa dibuka</p>
        <p className="mt-2 text-[14px] text-white/55">{message}</p>
        <button type="button" onClick={onRetry} className="mt-5 rounded-full bg-gold px-5 py-2.5 text-[14px] font-semibold text-[#0d1830] hover:bg-gold-soft">
          Coba lagi
        </button>
      </div>
    </div>
  );
}

/** Gulir ke field & beri kilat emas. */
export function jumpToField(path) {
  const el = document.getElementById(fid(path));
  if (!el) return false;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
  if (!prefersReducedMotion()) gsap.fromTo(el, { boxShadow: "0 0 0 3px rgb(201 162 39 / 0.7)" }, { boxShadow: "0 0 0 0px rgb(201 162 39 / 0)", duration: 1.6, delay: 0.3, ease: "power2.out", borderRadius: 12 });
  el.querySelector("input,textarea")?.focus({ preventScroll: true });
  return true;
}
