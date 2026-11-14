"use client";
import { useId, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Field gaya juru gambar: label kecil di atas, garis bawah yang "tergambar" dari kiri saat fokus,
 * penghitung karakter muncul mendekati batas, dan chip token `{…}` yang bisa disisipkan.
 */
export const fieldDomId = (path) => `kf-${String(path).replace(/\./g, "-")}`;

export function Field({ label, hint, path, value, onChange, multiline, rows = 3, max, tokens, placeholder, className, mono }) {
  const id = path ? fieldDomId(path) : undefined;
  const ref = useRef(null);
  const v = value ?? "";
  const near = max && v.length > max * 0.8;
  const insert = (tok) => {
    const el = ref.current;
    const at = el?.selectionStart ?? v.length;
    const next = v.slice(0, at) + tok + v.slice(el?.selectionEnd ?? at);
    onChange(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(at + tok.length, at + tok.length);
    });
  };
  const Tag = multiline ? "textarea" : "input";
  return (
    <label className={cn("kf-field group block", className)}>
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/55 transition-colors group-focus-within:text-maroon">{label}</span>
        {near && <span className={cn("text-[11px] tabular-nums", v.length >= max ? "text-danger" : "text-text/45")}>{v.length}/{max}</span>}
      </span>
      <span className="relative mt-1.5 block">
        <Tag
          ref={ref}
          id={id}
          value={v}
          rows={multiline ? rows : undefined}
          maxLength={max}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "block w-full resize-y rounded-t-md border-0 border-b border-navy/20 bg-white/70 px-3 py-2.5 text-[14.5px] leading-relaxed text-navy outline-none transition-colors placeholder:text-text/35 focus:bg-white",
            mono && "font-mono text-[13px]"
          )}
        />
        <span aria-hidden className="kf-underline pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-maroon transition-transform duration-500 ease-cinematic group-focus-within:scale-x-100" />
      </span>
      {(hint || tokens?.length) && (
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px] text-text/50">
          {hint && <span className="mr-1">{hint}</span>}
          {tokens?.map((t) => (
            <button key={t} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => insert(`{${t}}`)} className="rounded border border-dashed border-navy/25 px-1.5 font-mono text-[11px] text-navy/70 transition-colors hover:border-maroon hover:text-maroon">
              {`{${t}}`}
            </button>
          ))}
        </span>
      )}
    </label>
  );
}

export function NumberField({ label, path, value, onChange, min = 0, max = 100, suffix, className }) {
  const id = path ? fieldDomId(path) : undefined;
  return (
    <label className={cn("kf-field group block", className)}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/55 group-focus-within:text-maroon">{label}</span>
      <span className="relative mt-1.5 flex items-center rounded-t-md border-b border-navy/20 bg-white/70 focus-within:bg-white">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          className="w-full bg-transparent px-3 py-2.5 text-[14.5px] tabular-nums text-navy outline-none"
        />
        {suffix && <span className="pr-3 text-[12.5px] text-text/45">{suffix}</span>}
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-maroon transition-transform duration-500 ease-cinematic group-focus-within:scale-x-100" />
      </span>
    </label>
  );
}

/** Saklar wesel: tuas yang bergeser di rel kecil. */
export function Toggle({ label, hint, checked, onChange }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-[14px] font-semibold text-navy">{label}</span>
        {hint && <span className="mt-0.5 block text-[12.5px] text-text/55">{hint}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={Boolean(checked)}
        onClick={() => onChange(!checked)}
        className={cn("relative h-7 w-12 shrink-0 rounded-full border-2 transition-colors duration-300", checked ? "border-maroon bg-maroon" : "border-navy/20 bg-cream-2")}
      >
        <span aria-hidden className="absolute inset-x-2 top-1/2 h-px -translate-y-1/2 bg-white/40" />
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-[left] duration-300 ease-cinematic", checked ? "left-[22px]" : "left-0.5")} />
      </button>
    </div>
  );
}

export function Segmented({ label, options, value, onChange, className }) {
  const lid = useId();
  return (
    <div className={className}>
      {label && <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/55">{label}</p>}
      <div role="radiogroup" aria-label={label} className="mt-1.5 inline-flex flex-wrap gap-1 rounded-lg bg-cream-2 p-1">
        {options.map(([v, l, swatch]) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            onClick={() => onChange(v)}
            className={cn("relative inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] transition-colors", value === v ? "text-white" : "text-navy/70 hover:text-navy")}
          >
            {value === v && <motion.span layoutId={`seg-${lid}`} transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute inset-0 rounded-md bg-navy" />}
            {swatch && <span aria-hidden className="relative size-2.5 rounded-full ring-1 ring-white/60" style={{ background: swatch }} />}
            <span className="relative">{l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const move = (arr, i, d) => {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const out = [...arr];
  [out[i], out[j]] = [out[j], out[i]];
  return out;
};

function RowTools({ i, n, onMove, onRemove, label }) {
  return (
    <span className="flex shrink-0 items-center gap-0.5 opacity-60 transition-opacity group-hover/row:opacity-100 group-focus-within/row:opacity-100">
      <button type="button" onClick={() => onMove(i, -1)} disabled={i === 0} aria-label={`Naikkan ${label}`} className="grid size-7 place-items-center rounded text-navy/60 hover:bg-cream disabled:opacity-25">↑</button>
      <button type="button" onClick={() => onMove(i, 1)} disabled={i === n - 1} aria-label={`Turunkan ${label}`} className="grid size-7 place-items-center rounded text-navy/60 hover:bg-cream disabled:opacity-25">↓</button>
      <button type="button" onClick={() => onRemove(i)} aria-label={`Hapus ${label}`} className="grid size-7 place-items-center rounded text-maroon/70 hover:bg-maroon/10 hover:text-maroon">×</button>
    </span>
  );
}

/** Daftar teks sederhana (satu baris per item). */
export function Lines({ label, path, items = [], onChange, placeholder, max = 20, addLabel = "Tambah baris", multiline }) {
  const list = items ?? [];
  return (
    <div id={path ? fieldDomId(path) : undefined}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/55">{label}</p>
      <ol className="mt-1.5 space-y-1.5">
        <AnimatePresence initial={false}>
          {list.map((x, i) => (
            <motion.li key={i} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 16 }} className="group/row flex items-start gap-2">
              <span className="mt-2.5 w-5 shrink-0 text-right font-mono text-[11px] tabular-nums text-text/40">{i + 1}</span>
              {multiline ? (
                <textarea value={x} rows={2} placeholder={placeholder} onChange={(e) => onChange(list.map((y, j) => (j === i ? e.target.value : y)))} className="min-w-0 flex-1 resize-y rounded-md border border-navy/12 bg-white/80 px-3 py-2 text-[14px] text-navy outline-none focus:border-maroon" />
              ) : (
                <input value={x} placeholder={placeholder} onChange={(e) => onChange(list.map((y, j) => (j === i ? e.target.value : y)))} className="min-w-0 flex-1 rounded-md border border-navy/12 bg-white/80 px-3 py-2 text-[14px] text-navy outline-none focus:border-maroon" />
              )}
              <RowTools i={i} n={list.length} label={`baris ${i + 1}`} onMove={(a, d) => onChange(move(list, a, d))} onRemove={(a) => onChange(list.filter((_, j) => j !== a))} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      {list.length < max && (
        <button type="button" onClick={() => onChange([...list, ""])} className="kf-add mt-2 inline-flex items-center gap-2 rounded-md border border-dashed border-navy/25 px-3 py-1.5 text-[12.5px] font-medium text-navy/70 transition-colors hover:border-maroon hover:text-maroon">
          <span aria-hidden className="text-base leading-none">+</span>
          {addLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Daftar objek berulang (catatan kaki, bagian RPS, blok BoK…). `render(item, set, i)` menggambar isi kartu;
 * `make()` membuat item baru.
 */
export function Repeater({ label, path, items = [], onChange, make, render, max = 20, addLabel = "Tambah", itemLabel = (x, i) => `Item ${i + 1}`, fixed = false, className }) {
  const list = items ?? [];
  return (
    <div id={path ? fieldDomId(path) : undefined} className={className}>
      {label && <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/55">{label}</p>}
      <ol className="mt-2 space-y-2.5">
        <AnimatePresence initial={false}>
          {list.map((x, i) => (
            <motion.li key={x?.key ?? x?.id ?? i} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, x: 24 }} className="group/row relative rounded-xl border border-navy/10 bg-white/80 p-4 transition-shadow focus-within:shadow-[0_0_0_2px_rgb(110_20_35/0.18)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="truncate text-[12.5px] font-semibold text-navy/70">{itemLabel(x, i)}</span>
                {!fixed && <RowTools i={i} n={list.length} label={itemLabel(x, i)} onMove={(a, d) => onChange(move(list, a, d))} onRemove={(a) => onChange(list.filter((_, j) => j !== a))} />}
              </div>
              {render(x, (patch) => onChange(list.map((y, j) => (j === i ? { ...y, ...patch } : y))), i)}
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      {!fixed && list.length < max && (
        <button type="button" onClick={() => onChange([...list, make()])} className="kf-add mt-2.5 inline-flex items-center gap-2 rounded-md border border-dashed border-navy/25 px-3 py-1.5 text-[12.5px] font-medium text-navy/70 transition-colors hover:border-maroon hover:text-maroon">
          <span aria-hidden className="text-base leading-none">+</span>
          {addLabel}
        </button>
      )}
    </div>
  );
}

/** Pemilih berkas media (Lottie / gambar / PDF) dengan pratinjau nama berkas. */
export function MediaField({ label, path, value, onPick, onClear, kind = "lottie" }) {
  const name = value ? value.split("/").pop() : null;
  return (
    <div id={path ? fieldDomId(path) : undefined}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/55">{label}</p>
      <div className="mt-1.5 flex items-center gap-2 rounded-md border border-navy/12 bg-white/80 p-1.5">
        <span className="grid size-9 shrink-0 place-items-center rounded bg-cream-2 font-mono text-[10px] uppercase text-navy/60">{kind === "image" ? "img" : kind === "pdf" ? "pdf" : "json"}</span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-navy">{name ?? <span className="text-text/40">Belum dipilih</span>}</span>
        {value && onClear && (
          <button type="button" onClick={onClear} className="rounded px-2 py-1 text-[12px] text-text/50 hover:text-maroon">
            Lepas
          </button>
        )}
        <button type="button" onClick={onPick} className="rounded-md bg-navy px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-navy-deep">
          {value ? "Ganti" : "Pilih"}
        </button>
      </div>
    </div>
  );
}

/** Kelompok field berjudul (sub-bagian di meja gambar). */
export function Group({ title, note, children, className }) {
  return (
    <section className={cn("kf-group rounded-2xl border border-navy/10 bg-paper/80 p-5 backdrop-blur-sm sm:p-6", className)}>
      <header className="mb-4 flex items-baseline justify-between gap-4">
        <h3 className="font-serif text-[1.25rem] text-navy">{title}</h3>
        {note && <p className="text-right text-[12px] text-text/50">{note}</p>}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
