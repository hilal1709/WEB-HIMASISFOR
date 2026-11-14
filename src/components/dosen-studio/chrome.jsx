"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { fid } from "./fields";

/**
 * Loader Ruang Dosen: dinding loker 4×3 yang terisi amplop satu per satu (anime.js), lalu dikosongkan
 * dan berulang. Dipakai saat memuat isi & sebagai fallback layar penuh.
 */
export function RuangLoader({ label = "Membuka Ruang Dosen…", className }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const mails = el.querySelectorAll("[data-mail]");
    const a = animate(mails, {
      translateY: [{ from: -26, to: 0, duration: 420, ease: "outBack(1.6)" }],
      opacity: [{ from: 0, to: 1, duration: 200 }],
      delay: stagger(90, { grid: [4, 3], from: "first" }),
      loop: true,
      alternate: true,
      loopDelay: 380,
    });
    return () => a.pause();
  }, []);
  return (
    <div ref={ref} role="status" aria-live="polite" className={cn("flex flex-col items-center gap-5", className)}>
      <div className="grid grid-cols-4 gap-1.5 rounded-md bg-navy p-2 shadow-[0_24px_50px_-24px_rgb(20_33_61/0.8)]">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} className="relative h-9 w-11 overflow-hidden rounded-[3px] bg-navy-deep shadow-[inset_0_3px_6px_rgb(0_0_0/0.45)]">
            <span data-mail className={cn("absolute inset-x-1.5 bottom-1 h-5 rounded-[2px]", i % 5 === 2 ? "bg-gold" : "bg-cream")}>
              <span aria-hidden className="absolute inset-x-0 top-0 h-2.5 [clip-path:polygon(0_0,100%_0,50%_100%)] bg-black/10" />
            </span>
            <span aria-hidden className="absolute inset-x-2 top-1 h-[3px] rounded-full bg-gold/40" />
          </span>
        ))}
      </div>
      <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-navy/60">{label}</p>
    </div>
  );
}

/** Kerangka map berkas saat berpindah dosen/section. */
export function DossierSkeleton() {
  return (
    <div aria-hidden className="space-y-4">
      <div className="h-7 w-1/3 animate-pulse rounded bg-navy/[0.07]" />
      <div className="h-10 animate-pulse rounded bg-navy/[0.05]" />
      <div className="h-10 animate-pulse rounded bg-navy/[0.05]" />
      <div className="h-24 animate-pulse rounded bg-navy/[0.05]" />
    </div>
  );
}

const STRIP = {
  draft: { bg: "bg-gold-soft/80", ink: "text-navy", tag: "DRAF" },
  remote: { bg: "bg-navy", ink: "text-white", tag: "LIVE" },
  warn: { bg: "bg-maroon", ink: "text-white", tag: "CEK" },
  ok: { bg: "bg-emerald-50", ink: "text-emerald-900", tag: "BERES" },
};

/**
 * Banner "sobekan berperforasi": strip kertas turun dari atas dengan tepi lubang-lubang; menutup = disobek
 * (bagian kanan terlepas berputar & jatuh, sisanya menggulung naik). Semua via anime.js.
 */
export function TearBanner({ tone = "draft", children, action, onDismiss, className }) {
  const ref = useRef(null);
  const right = useRef(null);
  const t = STRIP[tone] ?? STRIP.draft;
  useLayoutEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    animate(ref.current, { translateY: [-18, 0], opacity: [0, 1], rotate: [-0.6, 0], duration: 560, ease: "outElastic(1, .8)" });
  }, []);
  const tear = () => {
    if (prefersReducedMotion() || !ref.current) return onDismiss?.();
    animate(right.current, { translateY: [0, 40], rotate: [0, 14], opacity: [1, 0], duration: 420, ease: "inQuad" });
    animate(ref.current, { scaleY: [1, 0], opacity: [1, 0], duration: 380, delay: 160, ease: "inQuart", onComplete: () => onDismiss?.() });
  };
  return (
    <div ref={ref} role="status" className={cn("perforated relative flex origin-top items-stretch overflow-hidden rounded-sm shadow-[0_10px_24px_-18px_rgb(20_33_61/0.6)]", t.bg, t.ink, className)}>
      <span className="grid shrink-0 place-items-center border-r-2 border-dotted border-current/25 px-3 font-mono text-[10.5px] font-bold tracking-[0.22em]">{t.tag}</span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1 px-3.5 py-2 text-[13.5px] leading-snug">{children}</div>
      <div ref={right} className="flex shrink-0 items-center gap-1 border-l-2 border-dotted border-current/25 pl-2 pr-1.5">
        {action && (
          <button type="button" onClick={action.onClick} className="rounded-sm px-2.5 py-1 text-[12.5px] font-semibold underline-offset-2 hover:underline">
            {action.label}
          </button>
        )}
        {onDismiss && (
          <button type="button" onClick={tear} aria-label="Sobek & tutup" title="Sobek & tutup" className="grid size-7 place-items-center rounded-sm text-[15px] opacity-70 hover:opacity-100">
            ✂
          </button>
        )}
      </div>
    </div>
  );
}

const DEVICES = [
  ["desktop", "Desktop", "100%"],
  ["tablet", "Tablet", "820px"],
  ["mobile", "Ponsel", "390px"],
];

/**
 * Pratinjau draf sebagai "jendela ruang dosen": lembar bawah setinggi layar, bingkai kaca navy,
 * iframe halaman /dosen dalam draft mode. Menerima `refreshKey` & `anchor` untuk sinkron.
 */
export function PreviewSheet({ open, onOpenChange, refreshKey, anchor }) {
  const frame = useRef(null);
  const [device, setDevice] = useState("desktop");
  const [loading, setLoading] = useState(true);
  const post = (msg) => frame.current?.contentWindow?.postMessage({ source: "katalog-dosen", ...msg }, window.location.origin);
  useEffect(() => {
    if (open) post({ type: "refresh" });
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open && anchor) post({ type: "scroll", anchor });
  }, [anchor, open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open) setLoading(true);
  }, [open]);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[94dvh] max-h-[94dvh] overflow-hidden rounded-t-2xl border-0 bg-navy p-0 text-white">
        <div className="flex items-center gap-3 px-5 py-3 pr-16">
          <span aria-hidden className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-maroon" />
            <span className="size-2.5 rounded-full bg-gold" />
            <span className="size-2.5 rounded-full bg-white/25" />
          </span>
          <SheetTitle className="font-serif text-lg font-normal">Pratinjau draf</SheetTitle>
          <SheetDescription>Halaman dosen dengan isi draf</SheetDescription>
          <div className="ml-auto flex gap-1 rounded-full bg-white/10 p-1">
            {DEVICES.map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setDevice(k)}
                className={cn("rounded-full px-3 py-1 text-[12.5px] transition-colors", device === k ? "bg-gold text-navy" : "text-white/70 hover:text-white")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="relative flex-1 overflow-hidden bg-navy-deep p-3">
          {loading && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-navy-deep">
              <RuangLoader label="Menyiapkan pratinjau…" className="[&_p]:text-white/60" />
            </div>
          )}
          {open && (
            <iframe
              ref={frame}
              title="Pratinjau halaman dosen"
              src="/api/dosen-cms/preview"
              onLoad={() => setLoading(false)}
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
export function jumpToField(path) {
  const el = document.getElementById(fid(path));
  if (!el) return false;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
  setTimeout(() => {
    el.focus?.({ preventScroll: true });
    gsap.fromTo(el, { boxShadow: "0 0 0 6px rgb(201 162 39 / 0.45)" }, { boxShadow: "0 0 0 0px rgb(201 162 39 / 0)", duration: 1.6, ease: "power2.out", clearProps: "boxShadow" });
  }, 420);
  return true;
}

/** Status simpan sebagai lampu meja kecil. */
export function SaveLamp({ status, connection }) {
  const map = {
    idle: ["bg-navy/25", "Siap"],
    typing: ["bg-gold animate-pulse", "Mengetik…"],
    saving: ["bg-gold animate-pulse", "Menyimpan draf…"],
    saved: ["bg-emerald-500", "Draf tersimpan"],
    error: ["bg-maroon", "Gagal menyimpan"],
  };
  const [dot, text] = map[status] ?? map.idle;
  return (
    <span className="inline-flex items-center gap-2 text-[12.5px] text-navy/60" aria-live="polite">
      <span className={cn("size-2 rounded-full", dot)} />
      {text}
      {connection === "connected" && <span className="hidden rounded bg-navy/5 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-navy/50 sm:inline">REALTIME</span>}
    </span>
  );
}
