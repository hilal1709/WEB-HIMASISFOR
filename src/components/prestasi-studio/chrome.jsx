"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, createTimeline, stagger, svg } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** id DOM untuk field (dipakai lompat dari daftar kalimat kembar). */
export const fid = (path) => `kurator-${String(path).replace(/[^a-z0-9]+/gi, "-")}`;

/* daun laurel di sepanjang busur; dihitung sekali */
const LEAVES = (() => {
  // titik di lingkaran (60,62) r=40, koordinat SVG (y ke bawah): 90° = bawah, 180° = kiri
  const out = [];
  for (let i = 0; i < 7; i++) {
    const deg = 104 + i * 19;
    const a = (deg * Math.PI) / 180;
    const x = +(60 + Math.cos(a) * 40).toFixed(2);
    const y = +(62 + Math.sin(a) * 40).toFixed(2);
    const rot = deg + 90 - 32; // searah garis singgung, condong keluar
    out.push({ x, y, rot, side: -1, i });
    out.push({ x: +(120 - x).toFixed(2), y, rot: 180 - rot, side: 1, i });
  }
  return out.sort((a, b) => a.i - b.i);
})();

/**
 * Loader "karangan laurel": batang digambar, daun tumbuh berpasangan dari bawah, medali di tengah
 * berdenyut — anime.js (createDrawable + timeline), berulang. Dipakai saat studio & pratinjau memuat.
 */
export function LaurelLoader({ label = "Membuka Ruang Kurator…", className }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const stems = svg.createDrawable(el.querySelectorAll("[data-stem]"));
    const leaves = svg.createDrawable(el.querySelectorAll("[data-leaf]"));
    const tl = createTimeline({ loop: true, loopDelay: 500, defaults: { ease: "inOutQuad" } })
      .add(stems, { draw: ["0 0", "0 1"], duration: 700 })
      .add(leaves, { draw: ["0 0", "0 1"], duration: 420, delay: stagger(55) }, "-=200")
      .add(el.querySelectorAll("[data-leaf]"), { fillOpacity: [0, 0.9], duration: 380, delay: stagger(30) }, "-=500")
      .add(el.querySelector("[data-medal]"), { scale: [0.6, 1], opacity: [0, 1], duration: 520, ease: "outBack(2)" }, "-=420")
      .add([...stems, ...leaves], { draw: ["0 1", "1 1"], fillOpacity: 0, duration: 500, delay: stagger(15) }, "+=600")
      .add(el.querySelector("[data-medal]"), { scale: 0.6, opacity: 0, duration: 300 }, "-=400");
    return () => tl.pause();
  }, []);
  return (
    <div ref={ref} role="status" aria-live="polite" className={cn("flex flex-col items-center gap-5", className)}>
      <svg viewBox="0 0 120 120" className="size-28" aria-hidden>
        <path data-stem d="M60 102 A40 40 0 0 1 32 33" fill="none" stroke="var(--k-gold)" strokeWidth="1.6" strokeLinecap="round" />
        <path data-stem d="M60 102 A40 40 0 0 0 88 33" fill="none" stroke="var(--k-gold)" strokeWidth="1.6" strokeLinecap="round" />
        {LEAVES.map((l) => (
          <path
            key={`${l.side}-${l.i}`}
            data-leaf
            d="M0 0 C 3 -5, 10 -5, 13 0 C 10 5, 3 5, 0 0 Z"
            transform={`translate(${l.x} ${l.y}) rotate(${l.rot})`}
            fill="var(--k-gold)"
            fillOpacity="0"
            stroke="var(--k-gold)"
            strokeWidth="1"
          />
        ))}
        <g data-medal style={{ transformOrigin: "60px 62px", transformBox: "view-box" }}>
          <circle cx="60" cy="62" r="17" fill="none" stroke="var(--k-gold)" strokeWidth="1.4" />
          <circle cx="60" cy="62" r="12" fill="var(--k-gold)" fillOpacity="0.18" />
          <path d="M60 54 l2.4 4.9 5.4.8-3.9 3.8.9 5.3-4.8-2.5-4.8 2.5.9-5.3-3.9-3.8 5.4-.8z" fill="var(--k-gold)" />
        </g>
      </svg>
      <p className="font-mono text-[11.5px] uppercase tracking-[0.26em] text-[var(--k-mute)]">{label}</p>
    </div>
  );
}

/** Kerangka plakat saat memuat isi bab / kartu. */
export function PlaqueSkeleton({ rows = 4 }) {
  return (
    <div aria-hidden className="space-y-4">
      <div className="h-6 w-1/3 animate-pulse rounded bg-white/[0.06]" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-11 animate-pulse rounded-[10px] bg-white/[0.04]" style={{ animationDelay: `${i * 90}ms` }} />
      ))}
    </div>
  );
}

const RIBBON = {
  draft: { bg: "bg-[var(--k-gold)]", ink: "text-[var(--k-gold-ink)]", tag: "Draf" },
  live: { bg: "bg-[var(--k-maroon)]", ink: "text-white", tag: "Live" },
  sample: { bg: "bg-[#2c3346]", ink: "text-[var(--k-ink)]", tag: "Contoh" },
  warn: { bg: "bg-[#5c1a24]", ink: "text-white", tag: "Cek" },
};

/**
 * Banner "pita kain": strip berujung takik (swallowtail) yang menjulur dari kiri, bergoyang sekali
 * seperti kain; menutup = pita tergulung ke kiri. Status yang ditutup diingat per `storageKey`.
 */
export function RibbonBanner({ tone = "draft", children, action, storageKey, className }) {
  const ref = useRef(null);
  const [hidden, setHidden] = useState(false);
  const t = RIBBON[tone] ?? RIBBON.draft;
  useLayoutEffect(() => {
    try {
      if (storageKey && localStorage.getItem(storageKey)) setHidden(true);
    } catch {}
  }, [storageKey]);
  useLayoutEffect(() => {
    if (hidden || !ref.current || prefersReducedMotion()) return;
    animate(ref.current, { clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)"], duration: 700, ease: "outExpo" });
    animate(ref.current, { skewY: [0, -1.2, 0.8, 0], duration: 900, delay: 300, ease: "outSine" });
  }, [hidden, tone]);
  if (hidden) return null;
  const close = () => {
    const done = () => {
      setHidden(true);
      try {
        if (storageKey) localStorage.setItem(storageKey, "1");
      } catch {}
    };
    if (prefersReducedMotion() || !ref.current) return done();
    animate(ref.current, { clipPath: ["inset(0 0% 0 0)", "inset(0 100% 0 0)"], opacity: [1, 0.4], duration: 420, ease: "inQuart", onComplete: done });
  };
  return (
    <div ref={ref} role="status" className={cn("relative flex items-stretch drop-shadow-[0_10px_18px_rgb(0_0_0/0.35)]", className)}>
      <div className={cn("flex min-w-0 flex-1 items-center gap-3 py-2 pl-3 pr-2 [clip-path:polygon(0_0,100%_0,calc(100%-14px)_50%,100%_100%,0_100%)]", t.bg, t.ink)}>
        <span className="shrink-0 rounded-sm bg-black/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.24em]">{t.tag}</span>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] leading-snug">{children}</div>
        {action && (
          <button type="button" onClick={action.onClick} className="shrink-0 rounded px-2 py-1 text-[12.5px] font-semibold underline-offset-2 hover:underline">
            {action.label}
          </button>
        )}
        {storageKey && (
          <button type="button" onClick={close} aria-label="Tutup pita" className="mr-4 grid size-7 shrink-0 place-items-center rounded-full text-[15px] opacity-70 transition-opacity hover:opacity-100">
            ×
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
 * Pratinjau draf sebagai "jendela vitrin": lembar bawah setinggi layar dengan bingkai kaca graphite
 * dan iframe /achievement dalam draft mode. `refreshKey` memicu muat ulang setelah simpan.
 */
export function PreviewSheet({ open, onOpenChange, refreshKey, anchor }) {
  const frame = useRef(null);
  const [device, setDevice] = useState("desktop");
  const [loading, setLoading] = useState(true);
  const post = (msg) => frame.current?.contentWindow?.postMessage({ source: "ruang-kurator", ...msg }, window.location.origin);
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
      <SheetContent side="bottom" className="kurator h-[94dvh] max-h-[94dvh] overflow-hidden rounded-t-2xl border-0 border-t border-[var(--k-line-2)] bg-[var(--k-panel)] p-0 text-[var(--k-ink)]">
        <div className="flex items-center gap-3 px-5 py-3 pr-16">
          <span aria-hidden className="size-2 rounded-full bg-[var(--k-gold)] shadow-[0_0_12px_var(--k-gold)]" />
          <SheetTitle className="font-serif text-lg font-normal text-[var(--k-ink)]">Jendela vitrin</SheetTitle>
          <SheetDescription className="hidden text-[13px] text-[var(--k-mute)] sm:block">Halaman Prestasi dengan isi draf</SheetDescription>
          <div className="ml-auto flex gap-1 rounded-full border border-[var(--k-line-2)] p-1">
            {DEVICES.map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setDevice(k)}
                className={cn("rounded-full px-3 py-1 text-[12.5px] transition-colors", device === k ? "bg-[var(--k-gold)] text-[var(--k-gold-ink)]" : "text-[var(--k-mute)] hover:text-[var(--k-ink)]")}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="relative flex-1 overflow-hidden bg-[var(--k-bg)] p-3">
          {loading && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-[var(--k-bg)]">
              <LaurelLoader label="Menata vitrin…" />
            </div>
          )}
          {open && (
            <iframe
              ref={frame}
              title="Pratinjau halaman prestasi"
              src="/api/prestasi-cms/preview"
              onLoad={() => setLoading(false)}
              className="mx-auto h-full rounded-xl bg-white shadow-2xl transition-[width] duration-500"
              style={{ width: DEVICES.find((d) => d[0] === device)[2] }}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** Gulir ke field & beri kilau emas. */
export function jumpToField(path) {
  const el = document.getElementById(fid(path));
  if (!el) return false;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "center" });
  setTimeout(() => {
    el.focus?.({ preventScroll: true });
    gsap.fromTo(el, { boxShadow: "0 0 0 6px rgb(214 176 74 / 0.45)" }, { boxShadow: "0 0 0 0px rgb(214 176 74 / 0)", duration: 1.6, ease: "power2.out", clearProps: "boxShadow" });
  }, 420);
  return true;
}

/** Status simpan sebagai lampu sorot kecil. */
export function SaveDot({ status, connection }) {
  const map = {
    idle: ["bg-white/25", "Siap"],
    typing: ["bg-[var(--k-gold)] animate-pulse", "Mengetik…"],
    saving: ["bg-[var(--k-gold)] animate-pulse", "Menyimpan draf…"],
    saved: ["bg-[var(--k-ok)] shadow-[0_0_10px_var(--k-ok)]", "Draf tersimpan"],
    error: ["bg-[var(--k-maroon)]", "Gagal menyimpan"],
  };
  const [dot, text] = map[status] ?? map.idle;
  return (
    <span className="inline-flex items-center gap-2 text-[12.5px] text-[var(--k-mute)]" aria-live="polite">
      <span className={cn("size-2 rounded-full transition-colors", dot)} />
      <span className="hidden whitespace-nowrap lg:inline">{text}</span>
      {connection === "connected" && <span className="hidden rounded border border-[var(--k-line-2)] px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-[var(--k-faint)] lg:inline">REALTIME</span>}
    </span>
  );
}
