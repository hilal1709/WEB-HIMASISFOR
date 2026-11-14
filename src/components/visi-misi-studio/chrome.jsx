"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, stagger, svg } from "animejs";
import { motion } from "motion/react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { SCENES } from "@/lib/visi-misi-cms/schema";
import { HorizonIllustration } from "@/components/illustrations/line-illustrations";
import { MovingBorder } from "@/components/home-studio/fx";
import { LordIcon } from "@/components/media/lord-icon";
import { cn } from "@/lib/utils";
import { fieldDomId } from "./fields";

/* ───────────── Loader: cakrawala tergambar, matahari naik, jarum kompas mencari utara ───────────── */
export function KompasLoader({ label = "Menyiapkan Ruang Kompas…" }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const a = animate(svg.createDrawable(el.querySelectorAll("[data-line]")), { draw: ["0 0", "0 1"], duration: 1400, delay: stagger(60), ease: "inOutCubic", loop: true, alternate: true });
    const b = animate(el.querySelector("[data-needle]"), { rotate: [0, 340, 300, 360], duration: 2200, ease: "inOutSine", loop: true });
    const c = animate(el.querySelectorAll("[data-dot]"), { opacity: [0.2, 1], duration: 600, delay: stagger(180), loop: true, alternate: true });
    return () => [a, b, c].forEach((x) => x.revert?.());
  }, []);
  return (
    <div ref={ref} role="status" aria-label={label} className="kompas-room grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="relative mx-auto w-full max-w-sm text-navy">
          <HorizonIllustration className="h-auto w-full text-navy" />
          <svg data-needle viewBox="0 0 40 40" className="absolute left-1/2 top-[18%] size-12 -translate-x-1/2" style={{ transformOrigin: "50% 50%" }} aria-hidden>
            <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeOpacity=".2" />
            <path d="M20 6l3.4 14h-6.8z" fill="var(--maroon)" />
            <path d="M20 34l-3.4-14h6.8z" fill="currentColor" fillOpacity=".25" />
          </svg>
        </div>
        <p className="mt-6 font-serif text-xl text-navy">
          Ruang <em className="text-maroon">Kompas</em>
        </p>
        <p className="mt-1 inline-flex items-center gap-1 text-[13px] text-text/55">
          {label}
          <span data-dot>.</span>
          <span data-dot>.</span>
          <span data-dot>.</span>
        </p>
      </div>
    </div>
  );
}

/** Skeleton satu adegan saat berpindah (garis cakrawala berdenyut). */
export function SceneSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-10 w-1/2 animate-pulse rounded bg-navy/[0.06]" />
      <div className="h-px w-full bg-gold/40" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-40 animate-pulse rounded-xl bg-navy/[0.05]" />
        <div className="h-40 animate-pulse rounded-xl bg-navy/[0.05]" />
      </div>
    </div>
  );
}

/* ───────────── Rel cakrawala: tujuh adegan sebagai titik di satu garis ───────────── */
export function HorizonRail({ active, onSelect, changed = [], completeness = {} }) {
  const beam = useRef(null);
  const i = SCENES.findIndex((s) => s.key === active);
  useEffect(() => {
    const to = SCENES.length > 1 ? i / (SCENES.length - 1) : 0;
    if (prefersReducedMotion()) beam.current.style.transform = `scaleX(${to})`;
    else gsap.to(beam.current, { scaleX: to, duration: 0.9, ease: "expo.out" });
  }, [i]);

  return (
    <nav aria-label="Adegan halaman" className="relative mx-auto max-w-6xl px-4 sm:px-6">
      <div className="relative overflow-x-auto pb-1 [scrollbar-width:none]">
        <ol className="relative flex min-w-[640px] justify-between">
          <span aria-hidden className="absolute left-[calc(100%/14)] right-[calc(100%/14)] top-[15px] h-px bg-white/20">
            <span ref={beam} className="absolute inset-0 origin-left bg-gold" style={{ transform: "scaleX(0)" }} />
          </span>
          {SCENES.map((s, n) => {
            const on = s.key === active;
            const pct = completeness[s.key] ?? 1;
            const dirty = changed.includes(s.key);
            return (
              <li key={s.key} className="relative flex flex-1 justify-center">
                <button
                  type="button"
                  onClick={() => onSelect(s.key)}
                  aria-current={on ? "step" : undefined}
                  className="group flex flex-col items-center gap-2 focus-visible:outline-none"
                >
                  <span className={cn("relative grid size-[31px] place-items-center rounded-full bg-navy-deep transition-transform duration-500 ease-cinematic", on ? "scale-110" : "group-hover:scale-105")}>
                    <svg viewBox="0 0 32 32" className="absolute inset-0 size-full -rotate-90" aria-hidden>
                      <circle cx="16" cy="16" r="13" fill="none" stroke="rgb(255 255 255 / .15)" strokeWidth="2" />
                      <circle cx="16" cy="16" r="13" fill="none" stroke="var(--gold)" strokeWidth="2" strokeDasharray={81.7} strokeDashoffset={81.7 * (1 - pct)} className="transition-[stroke-dashoffset] duration-700" />
                    </svg>
                    <span className={cn("relative text-[11px] font-semibold tabular-nums", on ? "text-gold" : "text-white/70")}>{n + 1}</span>
                    {dirty && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[#e86a7c] ring-2 ring-navy-deep" title="Berubah dari versi tayang" />}
                    {on && <motion.span layoutId="rail-halo" className="absolute -inset-1.5 rounded-full ring-1 ring-gold/60" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                  </span>
                  <span className={cn("text-[12.5px] transition-colors", on ? "font-semibold text-white" : "text-white/55 group-hover:text-white/85")}>{s.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

/* ───────────── Bilah arah: status simpan + aksi utama ───────────── */
const STATUS = {
  idle: ["Siap", "bg-white/40"],
  typing: ["Mengetik…", "bg-gold animate-pulse"],
  saving: ["Menyimpan…", "bg-gold animate-pulse"],
  saved: ["Draf tersimpan", "bg-emerald-400"],
  error: ["Gagal menyimpan", "bg-[#e86a7c]"],
};

export function Bearing({ status, dirty, canUndo, onUndo, onTeropong, teropong, onHistory, onDiscard, onPublish, connection }) {
  const [text, dot] = STATUS[status] ?? STATUS.idle;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 inline-flex items-center gap-2 text-[12.5px] text-white/65" aria-live="polite">
        <span className={cn("size-2 rounded-full", dot)} />
        {text}
        {connection === "unavailable" && <span className="text-[#e86a7c]">· realtime terputus</span>}
      </span>
      <BarBtn onClick={onUndo} disabled={!canUndo} title="Urungkan (Ctrl+Z)">↶</BarBtn>
      <BarBtn onClick={onHistory} title="Riwayat terbit">Riwayat</BarBtn>
      {dirty && (
        <BarBtn onClick={onDiscard} title="Buang draf" className="hover:bg-maroon">
          Buang
        </BarBtn>
      )}
      <BarBtn onClick={onTeropong} aria-pressed={teropong} title="Teropong (Ctrl+P)" className={cn("teropong-btn gap-1.5", teropong && "bg-white text-navy-deep hover:bg-white")}>
        <LordIcon name="target" size={16} target=".teropong-btn" colors={teropong ? "primary:#0e1830,secondary:#6e1423" : "primary:#ffffff,secondary:#c9a227"} fallback={<span aria-hidden>◎</span>} />
        Teropong
      </BarBtn>
      <MovingBorder onClick={onPublish} disabled={!dirty} className="h-9 disabled:opacity-50" inner="px-4">
        Terbitkan
      </MovingBorder>
    </div>
  );
}

function BarBtn({ className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 items-center rounded-full px-3.5 text-[13px] font-medium text-white ring-1 ring-white/15 transition-[background-color,transform] duration-200 hover:bg-white/10 active:scale-95 disabled:pointer-events-none disabled:opacity-35",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ───────────── Banner di bawah rel ───────────── */
const BANNER = {
  draft: "bg-gold/15 text-navy ring-gold/40",
  conflict: "bg-maroon text-white ring-maroon",
  lint: "bg-[#e86a7c]/10 text-maroon ring-[#e86a7c]/40",
  info: "bg-navy/[0.05] text-navy ring-navy/10",
};

export function HorizonBanner({ tone = "info", children, action, onDismiss }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!prefersReducedMotion() && ref.current) animate(ref.current, { clipPath: ["inset(0 50% 0 50% round 12px)", "inset(0 0% 0 0% round 12px)"], opacity: [0, 1], duration: 650, ease: "outExpo" });
  }, []);
  return (
    <div ref={ref} role={tone === "conflict" ? "alert" : "status"} className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-4 py-3 text-[13.5px] ring-1", BANNER[tone])}>
      <span aria-hidden className={cn("h-px w-6 shrink-0", tone === "conflict" ? "bg-gold" : "bg-current opacity-40")} />
      <div className="min-w-0 flex-1">{children}</div>
      {action}
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Tutup banner" className="opacity-50 transition-opacity hover:opacity-100">
          ×
        </button>
      )}
    </div>
  );
}

/* ───────────── Teropong: pratinjau draf di panel bawah yang naik ───────────── */
const DEVICES = [
  ["desktop", "Desktop", "100%"],
  ["phone", "Ponsel", "390px"],
];

export function Teropong({ open, onClose, refreshKey, anchor, height, onHeight }) {
  const frame = useRef(null);
  const panel = useRef(null);
  const [device, setDevice] = useState("desktop");
  const [loading, setLoading] = useState(true);
  const ready = useRef(false);
  const post = (msg) => frame.current?.contentWindow?.postMessage({ source: "ruang-kompas", ...msg }, window.location.origin);

  useEffect(() => {
    const onMsg = (e) => {
      if (e.origin === window.location.origin && e.data?.type === "ready") {
        ready.current = true;
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
  useLayoutEffect(() => {
    const el = panel.current;
    if (!el) return;
    if (prefersReducedMotion()) return void (el.style.transform = open ? "none" : "translateY(100%)");
    gsap.to(el, { y: 0, yPercent: open ? 0 : 100, duration: 0.7, ease: open ? "expo.out" : "expo.in" });
  }, [open]);

  // tarik pegangan untuk mengubah tinggi panel
  const drag = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = height;
    const move = (ev) => onHeight(Math.min(window.innerHeight * 0.85, Math.max(220, startH + (startY - ev.clientY))));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.body.style.userSelect = "";
    };
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <section
      ref={panel}
      aria-label="Teropong pratinjau"
      aria-hidden={!open}
      inert={!open}
      className="fixed inset-x-0 bottom-0 z-[80] flex flex-col bg-navy-deep shadow-[0_-30px_60px_-30px_rgb(14_24_48/0.7)]"
      style={{ height, transform: "translateY(100%)" }}
    >
      <div onPointerDown={drag} className="group flex h-4 cursor-row-resize items-center justify-center" title="Tarik untuk mengubah tinggi">
        <span className="h-1 w-12 rounded-full bg-white/25 transition-colors group-hover:bg-gold" />
      </div>
      <div className="flex items-center gap-3 px-4 pb-2 sm:px-6">
        <p className="font-serif text-white">
          Teropong <em className="text-gold-soft">draf</em>
        </p>
        <span className="hidden text-[12px] text-white/45 sm:inline">Halaman Visi & Misi dengan isi yang belum terbit</span>
        <div className="ml-auto flex rounded-full bg-white/10 p-1">
          {DEVICES.map(([k, label]) => (
            <button key={k} type="button" onClick={() => setDevice(k)} className={cn("relative rounded-full px-3 py-1 text-[12px]", device === k ? "text-navy-deep" : "text-white/70")}>
              {device === k && <motion.span layoutId="teropong-device" className="absolute inset-0 rounded-full bg-gold" />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} aria-label="Tutup teropong" className="grid size-8 place-items-center rounded-full text-white/60 ring-1 ring-white/15 hover:bg-white/10 hover:text-white">
          ↓
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden px-3 pb-3">
        {loading && open && (
          <div className="absolute inset-3 z-10 grid place-items-center rounded-lg bg-cream">
            <p className="text-[13px] text-navy/60">Mengarahkan teropong…</p>
          </div>
        )}
        {open && (
          <iframe
            ref={frame}
            title="Pratinjau visi dan misi"
            src="/api/visi-misi-cms/preview"
            onLoad={() => setLoading(false)}
            className="mx-auto h-full rounded-lg bg-white transition-[width] duration-500 ease-cinematic"
            style={{ width: DEVICES.find((d) => d[0] === device)[2] }}
          />
        )}
      </div>
    </section>
  );
}

/** Lompat ke field & beri kilat emas. Adegan diganti dulu oleh pemanggil bila perlu. */
export function jumpToField(path) {
  const el = document.getElementById(fieldDomId(path));
  if (!el) return false;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
  setTimeout(() => {
    el.focus?.({ preventScroll: true });
    gsap.fromTo(el, { backgroundColor: "rgb(201 162 39 / 0.3)" }, { backgroundColor: "rgb(201 162 39 / 0)", duration: 1.6, ease: "power2.out", clearProps: "backgroundColor" });
  }, 400);
  return true;
}
