"use client";
import { useId, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { MASCOT_POSES } from "@/lib/profil-lulusan-cms/schema";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";

/** id DOM untuk field (dipakai lompat dari daftar kalimat kembar). */
export const fid = (path) => `galeri-${String(path).replace(/[^a-z0-9]+/gi, "-")}`;

/** Pindahkan satu elemen array. */
export const moveItem = (arr, from, to) => {
  const next = [...arr];
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
};

/** Panel kaca berjudul — satu kelompok isian. */
export function Panel({ title, hint, aside, children, className }) {
  return (
    <section className={cn("rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6", className)}>
      {(title || aside) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h3 className="font-serif text-[1.25rem] leading-tight text-white">{title}</h3>}
            {hint && <p className="mt-1 text-[12.5px] text-white/45">{hint}</p>}
          </div>
          {aside}
        </header>
      )}
      <div className="space-y-5">{children}</div>
    </section>
  );
}

const Flag = () => (
  <span className="rounded-full bg-orange-400/15 px-2 py-0.5 text-[10.5px] font-semibold text-orange-300">kalimat kembar</span>
);

/**
 * Field teks: label kecil di atas, garis emas mengalir dari kiri saat fokus,
 * penghitung karakter muncul saat fokus dan memerah mendekati batas.
 */
export function Field({ path, label, value, onChange, max, multiline = false, rows = 3, placeholder, hint, flag, size = "body", className }) {
  const id = useId();
  const v = value ?? "";
  const near = max && v.length > max * 0.9;
  const Tag = multiline ? "textarea" : "input";
  return (
    <div id={path ? fid(path) : undefined} className={cn("group relative scroll-mt-28", className)}>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45 transition-colors group-focus-within:text-gold-soft">
          {label}
        </label>
        <span className="flex items-center gap-2">
          {flag && <Flag />}
          {max && <span className={cn("text-[11px] tabular-nums opacity-0 transition-opacity group-focus-within:opacity-100", near ? "text-orange-300" : "text-white/35")}>{v.length}/{max}</span>}
        </span>
      </div>
      <div className={cn("relative rounded-lg border bg-black/20 transition-colors", flag ? "border-orange-400/50" : "border-white/10 group-hover:border-white/20 group-focus-within:border-gold/50")}>
        <Tag
          id={id}
          value={v}
          rows={multiline ? rows : undefined}
          maxLength={max}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "block w-full resize-y bg-transparent px-3.5 py-2.5 text-white placeholder:text-white/25 focus:outline-none",
            size === "title" ? "font-serif text-[1.35rem] leading-snug" : "text-[14.5px] leading-relaxed"
          )}
        />
        <span aria-hidden className="pointer-events-none absolute inset-x-3 -bottom-px h-px origin-left scale-x-0 bg-gold transition-transform duration-500 ease-cinematic group-focus-within:scale-x-100" />
      </div>
      {hint && <p className="mt-1.5 text-[12px] text-white/40">{hint}</p>}
    </div>
  );
}

/** Dua field berdampingan: bagian biasa + bagian miring (aksen judul). */
export function TitlePair({ path, top, accent, onTop, onAccent, label = "Judul", hint }) {
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field path={path && `${path}.titleTop`} label={`${label} · awal`} value={top} onChange={onTop} max={60} size="title" />
        <Field path={path && `${path}.titleAccent`} label={`${label} · aksen miring`} value={accent} onChange={onAccent} max={60} size="title" />
      </div>
      <p className="mt-2 font-serif text-[1.1rem] text-white/80" aria-hidden>
        {top} <em className="text-gold-soft">{accent}</em>
      </p>
      {hint && <p className="mt-1 text-[12px] text-white/40">{hint}</p>}
    </div>
  );
}

/** Saklar pegas. */
export function Switch({ checked, onChange, label, hint }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start justify-between gap-4">
      <span>
        <span className="block text-[14px] text-white">{label}</span>
        {hint && <span className="mt-0.5 block text-[12px] text-white/45">{hint}</span>}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={!!checked}
        onClick={() => onChange(!checked)}
        className={cn("relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-300", checked ? "bg-gold" : "bg-white/15")}
      >
        <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 32 }} className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow", checked ? "right-0.5" : "left-0.5")} />
      </button>
    </label>
  );
}

/** Pilihan tersegmentasi dengan penanda yang meluncur. */
export function Segmented({ label, value, options, onChange, layoutId }) {
  const lid = useId();
  return (
    <div>
      {label && <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">{label}</p>}
      <div className="inline-flex flex-wrap rounded-full border border-white/10 bg-black/20 p-1">
        {options.map(([k, l]) => (
          <button key={k} type="button" onClick={() => onChange(k)} className={cn("relative rounded-full px-3 py-1 text-[12.5px] transition-colors", value === k ? "text-[#0d1830]" : "text-white/65 hover:text-white")}>
            {value === k && <motion.span layoutId={layoutId ?? lid} className="absolute inset-0 rounded-full bg-gold" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
            <span className="relative">{l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Daftar chip: ketik lalu Enter, klik × untuk hapus, Backspace di input kosong menghapus terakhir. */
export function Chips({ path, label, items = [], onChange, max = 8, placeholder = "Ketik lalu Enter", hint }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (!t || items.includes(t) || items.length >= max) return setDraft("");
    onChange([...items, t]);
    setDraft("");
  };
  return (
    <div id={path ? fid(path) : undefined} className="scroll-mt-28">
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">{label}</p>
        <span className="text-[11px] tabular-nums text-white/35">{items.length}/{max}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-white/10 bg-black/20 p-2 transition-colors focus-within:border-gold/50">
        {items.map((c, i) => (
          <motion.span
            key={c}
            layout
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.06] py-1 pl-2.5 pr-1 text-[12.5px] text-white"
          >
            {c}
            <button type="button" aria-label={`Hapus ${c}`} onClick={() => onChange(items.filter((_, j) => j !== i))} className="grid size-5 place-items-center rounded text-white/40 hover:bg-white/10 hover:text-white">
              ×
            </button>
          </motion.span>
        ))}
        {items.length < max && (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add();
              } else if (e.key === "Backspace" && !draft && items.length) onChange(items.slice(0, -1));
            }}
            onBlur={add}
            placeholder={placeholder}
            className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-1 text-[13px] text-white placeholder:text-white/25 focus:outline-none"
          />
        )}
      </div>
      {hint && <p className="mt-1.5 text-[12px] text-white/40">{hint}</p>}
    </div>
  );
}

/** Media: pratinjau kecil + tombol pustaka. `pick(kind, current, cb)` membuka MediaPicker. */
export function MediaField({ path, label, kind = "image", value, onChange, pick, hint, allowEmpty = true }) {
  return (
    <div id={path ? fid(path) : undefined} className="scroll-mt-28">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">{label}</p>
      <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-2">
        <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-md bg-white/[0.05]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {value && kind === "image" && <img src={value} alt="" className="absolute inset-0 size-full object-cover" />}
          {value && kind === "lottie" && <LottieIllustration src={value} className="w-12" />}
          {value && kind === "video" && <span className="text-[10px] text-white/50">video</span>}
          {!value && <span className="text-[10px] text-white/30">kosong</span>}
        </span>
        <span className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-white/55">{value || "—"}</span>
        <button type="button" onClick={() => pick(kind, value, onChange)} className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-gold hover:text-[#0d1830]">
          Pilih
        </button>
        {allowEmpty && value && (
          <button type="button" onClick={() => onChange("")} aria-label={`Kosongkan ${label}`} className="shrink-0 rounded-full px-2 py-1.5 text-[12px] text-white/40 hover:text-white">
            ×
          </button>
        )}
      </div>
      {hint && <p className="mt-1.5 text-[12px] text-white/40">{hint}</p>}
    </div>
  );
}

/** Elvo: tampil/sembunyi, pose (galeri gambar), ucapan. */
export function MascotField({ path, value = {}, onChange, flag }) {
  const set = (k, v) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      <Switch checked={value.show} onChange={(v) => set("show", v)} label="Tampilkan Elvo" hint="Maskot menyembul di pojok section ini." />
      {value.show && (
        <>
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">Pose</p>
            <div className="flex flex-wrap gap-2">
              {MASCOT_POSES.map((p) => (
                <button
                  key={p}
                  type="button"
                  title={p}
                  onClick={() => set("pose", p)}
                  className={cn("relative size-14 overflow-hidden rounded-xl border bg-white/[0.04] transition-[transform,border-color] duration-300 hover:-translate-y-0.5", value.pose === p ? "border-gold ring-2 ring-gold/30" : "border-white/10")}
                >
                  <Image src={`/mascot/elvo-${p}.webp`} alt={p} fill sizes="56px" className="object-contain p-1" />
                </button>
              ))}
            </div>
          </div>
          <Field path={path && `${path}.say`} label="Ucapan Elvo" value={value.say} onChange={(v) => set("say", v)} max={120} flag={flag} />
        </>
      )}
    </div>
  );
}

/** Tombol ikon kecil. */
export function IconBtn({ label, onClick, disabled, danger, children, className, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid size-8 place-items-center rounded-lg text-white/55 transition-colors disabled:opacity-30",
        danger ? "hover:bg-[#e86a7c]/15 hover:text-[#ff9aa8]" : "hover:bg-white/10 hover:text-white",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Pegangan seret (titik enam). */
export function Grip(props) {
  return (
    <span
      role="button"
      tabIndex={0}
      aria-label="Seret untuk mengubah urutan (atau panah atas/bawah)"
      className="grid size-8 cursor-grab touch-none place-items-center rounded-lg text-white/35 transition-colors hover:bg-white/10 hover:text-white active:cursor-grabbing"
      {...props}
    >
      <svg viewBox="0 0 12 16" className="h-4 w-3" aria-hidden>
        {[3, 8, 13].map((y) => [3, 9].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill="currentColor" />))}
      </svg>
    </span>
  );
}

/**
 * Urutan seret 2D (daftar maupun kisi): elemen mengikuti pointer, target = pusat terdekat.
 * Keyboard: panah pada pegangan memindah satu langkah.
 */
export function useSortable(onMove) {
  const refs = useRef([]);
  const [drag, setDrag] = useState(null);

  const start = (i) => (e) => {
    if (e.button !== 0) return;
    const el = refs.current[i];
    if (!el) return;
    e.preventDefault();
    const r0 = el.getBoundingClientRect();
    const sx = e.clientX;
    const sy = e.clientY;
    let over = i;
    setDrag({ from: i, over: i });
    const move = (ev) => {
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;
      el.style.transform = `translate(${dx}px, ${dy}px) scale(1.02)`;
      el.style.zIndex = "40";
      el.style.boxShadow = "0 30px 60px -30px rgb(0 0 0 / 0.8)";
      const cx = r0.left + r0.width / 2 + dx;
      const cy = r0.top + r0.height / 2 + dy;
      let best = i;
      let bd = Infinity;
      refs.current.forEach((n, j) => {
        if (!n) return;
        const r = j === i ? r0 : n.getBoundingClientRect();
        const d = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy);
        if (d < bd) {
          bd = d;
          best = j;
        }
      });
      if (best !== over) {
        over = best;
        setDrag({ from: i, over: best });
      }
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      el.style.transform = "";
      el.style.zIndex = "";
      el.style.boxShadow = "";
      setDrag(null);
      if (over !== i) onMove(i, over);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const key = (i, len) => (e) => {
    const d = { ArrowUp: -1, ArrowLeft: -1, ArrowDown: 1, ArrowRight: 1 }[e.key];
    if (!d) return;
    e.preventDefault();
    const to = i + d;
    if (to >= 0 && to < len) onMove(i, to);
  };

  return {
    drag,
    itemRef: (i) => (n) => {
      refs.current[i] = n;
    },
    handle: (i, len) => ({ onPointerDown: start(i), onKeyDown: key(i, len) }),
  };
}

/** Tombol tambah bergaris putus. */
export function AddButton({ onClick, children, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 py-3 text-[13px] font-semibold text-white/55 transition-colors hover:border-gold/60 hover:text-gold-soft disabled:pointer-events-none disabled:opacity-40"
    >
      <span className="grid size-5 place-items-center rounded-full border border-current transition-transform duration-500 group-hover:rotate-90">+</span>
      {children}
    </button>
  );
}
