"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronLeft, ChevronRight, CloudOff, Eye, GripHorizontal, History, Monitor, Redo2, RotateCcw, Smartphone, Tablet, Undo2, X } from "lucide-react";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { LordIcon } from "@/components/media/lord-icon";
import { LAYERS } from "@/lib/struktur-cms/schema";
import { cn } from "@/lib/utils";
import { IconBtn } from "./fields";

/* ───────────────────────── bilah kerja (atas) ───────────────────────── */

const STATUS = {
  idle: ["bg-white/30", "Siap"],
  typing: ["bg-gold animate-pulse", "Mengetik…"],
  saving: ["bg-gold animate-pulse", "Menyimpan draf…"],
  saved: ["bg-[#3aa57a]", "Draf tersimpan"],
  error: ["bg-[#e86a7c]", "Gagal menyimpan"],
};

export function Toolbar({ status, dirty, canUndo, onUndo, onRedo, onHistory, onPreview, previewOn, onDiscard, onPublish, connection, members, me }) {
  const [dot, text] = STATUS[status] ?? STATUS.idle;
  const others = (members ?? []).filter((m) => m.id !== me);
  return (
    <header className="relative z-30 flex h-14 shrink-0 items-center gap-2 border-b border-white/[0.07] bg-[#0b1224]/90 px-3 backdrop-blur sm:px-4">
      <Link href="/admin/dashboard" className="group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] text-white/55 transition-colors hover:bg-white/5 hover:text-white">
        <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        <span className="hidden sm:inline">Admin</span>
      </Link>
      <span className="h-5 w-px bg-white/10" />
      <div className="min-w-0 px-1">
        <p className="truncate font-serif text-[15px] leading-none text-white">Studio Bagan</p>
        <p className="mt-1 hidden text-[11px] leading-none text-white/40 sm:block">Struktur Organisasi</p>
      </div>

      <div className="ml-2 hidden items-center gap-2 rounded-full border border-white/10 px-3 py-1 md:flex" aria-live="polite">
        <span className={cn("size-1.5 rounded-full", dot)} />
        <span className="text-[12px] text-white/60">{text}</span>
        {dirty && status !== "saving" && status !== "typing" && <span className="rounded bg-gold/15 px-1.5 text-[10.5px] font-semibold text-gold-soft">belum terbit</span>}
      </div>

      <div className="ml-auto flex items-center gap-1">
        {others.length > 0 && (
          <span className="mr-1 hidden -space-x-2 sm:flex" title={`Juga membuka studio: ${others.map((m) => m.name).join(", ")}`}>
            {others.slice(0, 3).map((m) => (
              <span key={m.id} className="grid size-7 place-items-center rounded-full bg-[#2a3a63] text-[11px] font-semibold text-white ring-2 ring-[#0b1224]">
                {(m.name || "A")[0]}
              </span>
            ))}
          </span>
        )}
        {connection === "unavailable" && (
          <span title="Sinkron langsung tidak tersedia; perubahan tetap tersimpan" className="mr-1 text-white/40">
            <CloudOff className="size-4" />
          </span>
        )}
        <IconBtn label="Urungkan (Ctrl+Z)" onClick={onUndo} disabled={!canUndo}>
          <Undo2 className="size-4" />
        </IconBtn>
        <IconBtn label="Ulangi (Ctrl+Shift+Z)" onClick={onRedo}>
          <Redo2 className="size-4" />
        </IconBtn>
        <IconBtn label="Riwayat terbit" onClick={onHistory}>
          <History className="size-4" />
        </IconBtn>
        <IconBtn label="Buang draf" onClick={onDiscard} disabled={!dirty}>
          <RotateCcw className="size-4" />
        </IconBtn>
        <button
          type="button"
          onClick={onPreview}
          aria-pressed={previewOn}
          className={cn("ml-1 hidden items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[12.5px] transition-colors sm:inline-flex", previewOn ? "border-gold/50 bg-gold/10 text-gold-soft" : "border-white/10 text-white/70 hover:bg-white/5")}
        >
          <Eye className="size-3.5" /> Pratinjau
        </button>
        <button
          type="button"
          onClick={onPublish}
          className="group ml-1 inline-flex items-center gap-1.5 rounded-lg bg-gold px-3 py-1.5 text-[13px] font-semibold text-navy transition-[background-color,transform] hover:bg-gold-soft active:scale-95"
        >
          <LordIcon name="check" size={18} trigger="hover" target=".group" colors="primary:#14213d,secondary:#14213d" />
          Sahkan
        </button>
      </div>
    </header>
  );
}

/* ───────────────────────── rel lapisan (kiri) ───────────────────────── */

/** Rel vertikal lapisan; di layar kecil berubah jadi deretan geser horizontal. Titik emas = berubah dari versi terbit. */
export function LayerRail({ active, onChange, changed }) {
  const ref = useRef(null);
  const marker = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current?.querySelector(`[data-layer="${active}"]`);
    if (!el || !marker.current) return;
    const vertical = window.matchMedia("(min-width: 1024px)").matches;
    const to = vertical ? { y: el.offsetTop, height: el.offsetHeight, x: 0, width: 3 } : { x: el.offsetLeft, width: el.offsetWidth, y: el.offsetTop + el.offsetHeight - 2, height: 2 };
    if (prefersReducedMotion()) gsap.set(marker.current, to);
    else gsap.to(marker.current, { ...to, duration: 0.5, ease: "expo.out" });
  }, [active]);

  return (
    <nav aria-label="Lapisan halaman" className="relative z-20 shrink-0 border-b border-white/[0.07] bg-[#0b1224]/70 lg:w-[188px] lg:border-b-0 lg:border-r">
      <ol ref={ref} className="relative flex gap-1 overflow-x-auto px-2 py-2 [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:px-3 lg:py-4">
        <span ref={marker} aria-hidden className="absolute left-0 top-0 rounded-full bg-gold" />
        {LAYERS.map((l, i) => (
          <li key={l.key} className="shrink-0">
            <button
              type="button"
              data-layer={l.key}
              onClick={() => onChange(l.key)}
              aria-current={active === l.key}
              className={cn(
                "group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors",
                active === l.key ? "bg-white/[0.07] text-white" : "text-white/55 hover:bg-white/[0.04] hover:text-white/85"
              )}
            >
              <span className={cn("hidden w-5 font-serif text-[13px] tabular-nums lg:block", active === l.key ? "text-gold-soft" : "text-white/30")}>{i + 1}</span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 whitespace-nowrap text-[13px] font-medium">
                  {l.label}
                  {changed.includes(l.key) && <span aria-label="berubah" className="size-1.5 rounded-full bg-gold" />}
                </span>
                <span className="hidden truncate text-[11px] text-white/35 lg:block">{l.hint}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <p className="hidden px-6 pb-4 text-[10.5px] leading-relaxed text-white/25 lg:block">Ctrl+S simpan · Ctrl+P pratinjau · N tambah bawahan · Del hapus · F paskan</p>
    </nav>
  );
}

/* ───────────────────────── pita status (atas kanvas) ───────────────────────── */

const RIBBON = {
  conflict: "border-[#e86a7c]/40 bg-[#3a1724]/90 text-[#ffc2cb]",
  warn: "border-[#e0a43a]/35 bg-[#33260f]/90 text-[#f5d49a]",
  info: "border-white/10 bg-[#16213b]/90 text-white/80",
};

/**
 * Pita status: satu pesan terpenting di atas kanvas, bisa digeser ‹ › ke pesan lain.
 * Berganti pesan dengan animasi lipat (GSAP).
 */
export function StatusRibbon({ items }) {
  const [i, setI] = useState(0);
  const [hidden, setHidden] = useState(new Set());
  const ref = useRef(null);
  const list = items.filter((x) => !hidden.has(x.id));
  const cur = list[Math.min(i, list.length - 1)];

  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    gsap.fromTo(ref.current, { rotateX: -70, opacity: 0, transformOrigin: "50% 0%" }, { rotateX: 0, opacity: 1, duration: 0.55, ease: "back.out(1.6)" });
  }, [cur?.id]);

  if (!cur) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center px-3 [perspective:600px]">
      <div ref={ref} role="status" className={cn("pointer-events-auto flex max-w-[640px] items-center gap-3 rounded-2xl border px-3.5 py-2 shadow-2xl backdrop-blur", RIBBON[cur.tone])}>
        <AlertTriangle className="size-4 shrink-0 opacity-80" />
        <p className="min-w-0 text-[12.5px] leading-snug">
          <span className="font-semibold">{cur.title}</span> {cur.body && <span className="opacity-75">{cur.body}</span>}
        </p>
        {cur.action && (
          <button type="button" onClick={cur.action.onClick} className="shrink-0 rounded-lg border border-current/30 px-2.5 py-1 text-[12px] font-semibold opacity-90 hover:opacity-100">
            {cur.action.label}
          </button>
        )}
        {list.length > 1 && (
          <span className="flex shrink-0 items-center gap-0.5 text-[11px] tabular-nums opacity-70">
            <button type="button" aria-label="Pesan sebelumnya" onClick={() => setI((x) => (x - 1 + list.length) % list.length)} className="rounded p-0.5 hover:bg-white/10">
              <ChevronLeft className="size-3.5" />
            </button>
            {Math.min(i, list.length - 1) + 1}/{list.length}
            <button type="button" aria-label="Pesan berikutnya" onClick={() => setI((x) => (x + 1) % list.length)} className="rounded p-0.5 hover:bg-white/10">
              <ChevronRight className="size-3.5" />
            </button>
          </span>
        )}
        {cur.dismissible !== false && (
          <button type="button" aria-label="Sembunyikan pesan" onClick={() => setHidden((s) => new Set(s).add(cur.id))} className="shrink-0 rounded p-0.5 opacity-60 hover:bg-white/10 hover:opacity-100">
            <X className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── dok pratinjau (mengambang) ───────────────────────── */

const DEVICES = [
  ["desktop", Monitor, 1280],
  ["tablet", Tablet, 820],
  ["mobile", Smartphone, 390],
];

/**
 * Jendela pratinjau mengambang: bisa diseret dari pegangannya, berpindah pojok, dan diganti lebar
 * perangkat. Isi = halaman publik dalam draft mode (iframe), di-skalakan agar muat.
 */
export function PreviewDock({ open, onClose, frameRef, onReady }) {
  const [device, setDevice] = useState("desktop");
  const [pos, setPos] = useState(null); // {x,y} kiri-atas; null = pojok kanan bawah
  const box = useRef(null);
  const W = 460;
  const H = 320;
  const width = DEVICES.find((d) => d[0] === device)[2];
  const scale = W / width;

  useEffect(() => {
    if (!open || !box.current || prefersReducedMotion()) return;
    gsap.fromTo(box.current, { y: 40, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" });
  }, [open]);

  const grab = (e) => {
    const r = box.current.getBoundingClientRect();
    const off = { x: e.clientX - r.left, y: e.clientY - r.top };
    const move = (ev) => setPos({ x: Math.max(8, Math.min(window.innerWidth - W - 8, ev.clientX - off.x)), y: Math.max(64, Math.min(window.innerHeight - 60, ev.clientY - off.y)) });
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  if (!open) return null;
  return (
    <div
      ref={box}
      className="fixed z-40 hidden overflow-hidden rounded-2xl border border-white/15 bg-[#0b1224] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.8)] sm:block"
      style={pos ? { left: pos.x, top: pos.y, width: W } : { left: 212, bottom: 72, width: W }}
    >
      <div onPointerDown={grab} className="flex cursor-move items-center gap-2 border-b border-white/[0.07] px-3 py-2">
        <GripHorizontal className="size-4 text-white/30" />
        <span className="text-[12px] text-white/60">Pratinjau draf</span>
        <span className="ml-auto flex gap-0.5" onPointerDown={(e) => e.stopPropagation()}>
          {DEVICES.map(([k, Icon]) => (
            <IconBtn key={k} label={`Lebar ${k}`} onClick={() => setDevice(k)} className={device === k ? "bg-white/10 text-gold-soft" : ""}>
              <Icon className="size-3.5" />
            </IconBtn>
          ))}
          <IconBtn label="Tutup pratinjau" onClick={onClose}>
            <X className="size-3.5" />
          </IconBtn>
        </span>
      </div>
      <div className="relative overflow-hidden bg-cream" style={{ height: H }}>
        <iframe
          ref={frameRef}
          title="Pratinjau halaman Struktur Organisasi"
          src="/api/struktur-cms/preview"
          onLoad={onReady}
          className="absolute left-0 top-0 origin-top-left border-0 bg-cream"
          style={{ width, height: H / scale, transform: `scale(${scale})` }}
        />
      </div>
    </div>
  );
}
