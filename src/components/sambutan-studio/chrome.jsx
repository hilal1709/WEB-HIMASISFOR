"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createTimeline, stagger } from "animejs";
import { motion } from "motion/react";
import { gsap } from "@/lib/scroll";
import { LogoDraw, Skeleton } from "@/components/ui/loader";
import { LordIcon } from "@/components/media/lord-icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { MovingBorder } from "@/components/home-studio/fx";
import { CHAPTERS } from "@/lib/sambutan-cms/schema";
import { cn } from "@/lib/utils";
import { fieldDomId } from "./paper-field";

export const ROMAN = ["I", "II", "III", "IV", "V", "VI"];
export const chapterId = (key) => `bab-${key}`;

/* ───────────── Loader: logo tergambar, lalu kertas "diketik" baris demi baris ───────────── */
export function MejaLoader() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tl = createTimeline({ defaults: { ease: "outExpo" } });
    tl.add(el.querySelector("[data-sheet]"), { translateY: [40, 0], rotate: [-2, 0], opacity: [0, 1], duration: 900 }).add(
      el.querySelectorAll("[data-line]"),
      { scaleX: [0, 1], duration: 700, delay: stagger(70) },
      "-=500"
    );
    return () => tl.revert();
  }, []);
  return (
    <div ref={ref} className="meja-desk grid min-h-screen place-items-center px-4 py-16">
      <div className="w-full max-w-xl">
        <div className="mx-auto mb-8 w-fit">
          <LogoDraw label="Meja Sambutan" sub="Merapikan kertas surat…" loop />
        </div>
        <div data-sheet className="rounded-md bg-white p-8 shadow-[0_40px_80px_-40px_rgb(20_33_61/0.4)]">
          <Skeleton data-line className="h-8 w-2/3 origin-left bg-cream-2" />
          {[100, 92, 97, 60, 0, 95, 88, 70].map((w, i) =>
            w ? <Skeleton key={i} data-line className="mt-3 h-3 origin-left bg-cream-2" style={{ width: `${w}%` }} /> : <div key={i} className="h-4" />
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────── Pita bab: penunjuk bab aktif + progres gulir dokumen ───────────── */
export function ChapterRibbon({ changed = [] }) {
  const [active, setActive] = useState(CHAPTERS[0].key);
  const bar = useRef(null);
  useEffect(() => {
    const els = CHAPTERS.map((c) => document.getElementById(chapterId(c.key))).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setActive(vis.target.id.slice(4));
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    els.forEach((e) => io.observe(e));
    const tw = gsap.to(bar.current, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
    return () => {
      io.disconnect();
      tw.scrollTrigger?.kill();
      tw.kill();
    };
  }, []);
  const go = (key) => document.getElementById(chapterId(key))?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <nav aria-label="Bab sambutan" className="sticky top-0 z-40 border-b border-navy/10 bg-cream/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] sm:justify-center">
        {CHAPTERS.map((c, i) => {
          const on = active === c.key;
          const dirty = changed.includes(c.key);
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => go(c.key)}
              aria-current={on ? "true" : undefined}
              className={cn("relative flex shrink-0 items-baseline gap-2 rounded-full px-4 py-1.5 text-sm transition-colors", on ? "text-white" : "text-navy/70 hover:text-navy")}
            >
              {on && <motion.span layoutId="meja-chapter" transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-0 -z-0 rounded-full bg-navy" />}
              <span className={cn("relative font-serif text-[12px]", on ? "text-gold-soft" : "text-gold")}>{ROMAN[i]}</span>
              <span className="relative font-medium">{c.label}</span>
              {dirty && <span title="Berbeda dari versi tayang" className="relative size-1.5 rounded-full bg-gold" />}
            </button>
          );
        })}
      </div>
      <span ref={bar} aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gold" />
    </nav>
  );
}

/* ───────────── Banner pita di kepala kertas ───────────── */
const RIBBON = {
  draft: "bg-gold/15 text-maroon ring-gold/40",
  conflict: "bg-maroon text-white ring-maroon",
  offline: "bg-orange-100 text-orange-800 ring-orange-300",
  live: "bg-emerald-50 text-emerald-800 ring-emerald-200",
};
export function PaperRibbon({ tone = "draft", children, action }) {
  return (
    <div role="status" className={cn("relative mb-3 flex items-center gap-3 rounded-md px-4 py-2.5 text-[13px] ring-1 animate-in fade-in-0 slide-in-from-top-2 duration-500", RIBBON[tone])}>
      <span aria-hidden className="absolute -left-2 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[10px] border-r-[8px] border-y-transparent border-r-current opacity-30" />
      <span className="min-w-0 flex-1">{children}</span>
      {action}
    </div>
  );
}

/* ───────────── Dok mengambang ───────────── */
const STATUS = {
  idle: ["bg-text/20", "Siap"],
  typing: ["bg-gold animate-pulse", "Mengetik…"],
  saving: ["bg-gold animate-ping", "Menyimpan draf…"],
  saved: ["bg-emerald-500", "Draf tersimpan"],
  error: ["bg-maroon", "Gagal menyimpan"],
};

export function Dock({ status, dirty, canUndo, onUndo, redundancy, onJump, history, onRestore, onPreview, onDiscard, onPublish }) {
  const [dot, text] = STATUS[status] ?? STATUS.idle;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-3">
      <div className="pointer-events-auto flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-navy/95 p-1.5 pl-3 sm:gap-1 sm:pl-4 text-white shadow-[0_30px_60px_-24px_rgb(14_24_48/0.8)] ring-1 ring-white/10 backdrop-blur-xl [scrollbar-width:none]">
        <span className="flex shrink-0 items-center gap-2 pr-2 text-[12.5px] text-white/75" aria-live="polite">
          <span className="relative flex size-2">
            <span className={cn("absolute inset-0 rounded-full opacity-70", dot)} />
            <span className={cn("relative size-2 rounded-full", dot.split(" ")[0])} />
          </span>
          <span className="hidden sm:inline">{text}</span>
        </span>

        <DockButton onClick={onUndo} disabled={!canUndo} title="Urungkan (Ctrl+Z)">
          ↶<span className="hidden md:inline"> Urungkan</span>
        </DockButton>

        <Popover>
          <PopoverTrigger asChild>
            <DockButton title="Pemeriksa kalimat berulang">
              <span className="hidden sm:inline">Redundansi</span>
              <span className="sm:hidden">Ulang</span>
              <span className={cn("ml-1.5 grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold", redundancy.length ? "bg-gold text-navy" : "bg-white/15 text-white/70")}>
                {redundancy.length}
              </span>
            </DockButton>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-80 p-0">
            <p className="border-b border-line px-4 py-3 text-[13px] font-semibold text-navy">
              {redundancy.length ? "Kalimat yang berulang" : "Tidak ada kalimat berulang"}
            </p>
            <ul className="max-h-72 overflow-y-auto p-2">
              {redundancy.map((r, i) => (
                <li key={i} className="rounded-md p-2 text-[13px] hover:bg-cream">
                  <p className="line-clamp-2 italic text-text/70">“{r.text}”</p>
                  <p className="mt-1.5 flex flex-wrap gap-1.5 text-[12px]">
                    {[r.a, r.b].map((x) => (
                      <button key={x.path} type="button" onClick={() => onJump(x.path)} className="rounded bg-white px-1.5 py-0.5 text-maroon ring-1 ring-gold/40 hover:ring-gold">
                        {x.label}
                      </button>
                    ))}
                  </p>
                </li>
              ))}
              {!redundancy.length && <li className="px-2 pb-2 text-[13px] text-text/55">Setiap kalimat di sampul, surat, dan profil unik.</li>}
            </ul>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <DockButton title="Versi terbit sebelumnya">
              <span className="hidden sm:inline">Riwayat</span>
              <span className="sm:hidden">Versi</span>
            </DockButton>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-72 p-0">
            <p className="border-b border-line px-4 py-3 text-[13px] font-semibold text-navy">Versi terbit sebelumnya</p>
            <ul className="p-2">
              {history.map((h) => (
                <li key={h.index} className="flex items-center justify-between gap-2 rounded-md p-2 text-[13px] hover:bg-cream">
                  <span>
                    <span className="block text-navy">{h.publishedAt ? new Date(h.publishedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "Tanpa tanggal"}</span>
                    <span className="text-[12px] text-text/50">oleh {h.publishedBy || "admin"}</span>
                  </span>
                  <button type="button" onClick={() => onRestore(h.index)} className="shrink-0 rounded-full border border-navy/15 px-2.5 py-1 text-[12px] text-navy hover:border-navy">
                    Pulihkan ke draf
                  </button>
                </li>
              ))}
              {!history.length && <li className="p-2 text-[13px] text-text/55">Riwayat muncul setelah terbit kedua kalinya.</li>}
            </ul>
          </PopoverContent>
        </Popover>

        <DockButton onClick={onPreview} title="Pratinjau draf" className="dock-prev">
          <LordIcon name="globe" size={18} trigger="hover" target=".dock-prev" colors="primary:#ffffff,secondary:#e6d3a1" />
          <span className="hidden sm:inline">Pratinjau</span>
        </DockButton>

        {dirty && (
          <DockButton onClick={onDiscard} title="Buang draf, kembali ke versi tayang" className="text-white/60 hover:text-white">
            Buang
          </DockButton>
        )}

        <MovingBorder onClick={onPublish} disabled={!dirty} className="ml-1 h-9 shrink-0" inner="px-3.5 text-[13px] sm:px-4">
          Terbitkan
        </MovingBorder>
      </div>
    </div>
  );
}

function DockButton({ className, children, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[13px] sm:px-3 text-white/85 transition-[background-color,color,transform] hover:bg-white/10 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-35",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ───────────── Lembar pratinjau ───────────── */
const DEVICES = [
  ["desktop", "Desktop", "100%"],
  ["phone", "Ponsel", "390px"],
];
export function PreviewSheet({ open, onOpenChange, refreshKey, anchor }) {
  const frame = useRef(null);
  const [device, setDevice] = useState("desktop");
  const [loading, setLoading] = useState(true);
  const post = (msg) => frame.current?.contentWindow?.postMessage({ source: "meja-sambutan", ...msg }, window.location.origin);
  useEffect(() => {
    if (open) post({ type: "refresh" });
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open && anchor) post({ type: "scroll", anchor });
  }, [anchor, open]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[min(100vw,980px)] border-l-0 bg-cream p-0">
        <div className="flex items-center gap-3 border-b border-navy/10 px-5 py-3 pr-16">
          <SheetTitle className="font-serif text-lg font-normal text-navy">Pratinjau draf</SheetTitle>
          <SheetDescription>Halaman sambutan dengan isi draf</SheetDescription>
          <div className="ml-auto flex rounded-full bg-white p-1 ring-1 ring-navy/10">
            {DEVICES.map(([k, label]) => (
              <button key={k} type="button" onClick={() => setDevice(k)} className={cn("relative rounded-full px-3 py-1 text-[12.5px]", device === k ? "text-white" : "text-navy/70")}>
                {device === k && <motion.span layoutId="meja-device" className="absolute inset-0 rounded-full bg-maroon" />}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="relative flex-1 overflow-hidden bg-cream-2 p-3">
          {loading && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-cream-2">
              <LogoDraw label="Pratinjau" sub="Menyiapkan halaman…" loop />
            </div>
          )}
          <iframe
            ref={frame}
            title="Pratinjau sambutan"
            src="/api/sambutan-cms/preview"
            onLoad={() => setLoading(false)}
            className="mx-auto h-full rounded-lg bg-white shadow-xl transition-[width] duration-500"
            style={{ width: DEVICES.find((d) => d[0] === device)[2] }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Gulir ke field & beri kilat emas. */
export function jumpToField(path) {
  const el = document.getElementById(fieldDomId(path));
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => {
    el.focus?.({ preventScroll: true });
    gsap.fromTo(el, { backgroundColor: "rgb(201 162 39 / 0.35)" }, { backgroundColor: "rgb(201 162 39 / 0)", duration: 1.6, ease: "power2.out", clearProps: "backgroundColor" });
  }, 450);
}
