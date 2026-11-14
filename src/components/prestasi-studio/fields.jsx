"use client";
import { createContext, useContext, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { fid, jumpToField } from "./chrome";

/** Buka pustaka media dari field mana pun. */
export const PickerCtx = createContext({ open: () => {} });
/** Temuan redundansi per path (dari lint.js). */
export const LintCtx = createContext({});

function Caption({ htmlFor, label, hint, count, max }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--k-mute)]">
        {label}
      </label>
      <span className="flex items-baseline gap-2 text-[11px] text-[var(--k-faint)]">
        {hint}
        {max ? <span className={cn("tabular-nums transition-colors", count > max * 0.9 && "text-[var(--k-gold)]")}>{count}/{max}</span> : null}
      </span>
    </div>
  );
}

/** Catatan kalimat kembar di bawah field, dengan lompatan ke field pasangannya. */
function Echo({ path }) {
  const hits = useContext(LintCtx)[path];
  if (!hits?.length) return null;
  return (
    <div className="mt-1.5 space-y-1">
      {hits.map((h, i) => {
        const other = h.a.path === path ? h.b : h.a;
        return (
          <p key={i} className="flex items-start gap-1.5 text-[12px] leading-snug text-[#e9a0ab] animate-in fade-in-0 slide-in-from-top-1">
            <span aria-hidden className="mt-[3px] size-1.5 shrink-0 rounded-full bg-[var(--k-maroon)]" />
            <span>
              Mirip kalimat di{" "}
              <button type="button" onClick={() => jumpToField(other.path)} className="font-semibold underline decoration-dotted underline-offset-2 hover:text-white">
                {other.label}
              </button>
            </span>
          </p>
        );
      })}
    </div>
  );
}

/** Teks satu/banyak baris + penghitung karakter + peringatan kalimat kembar. Token `{x}` diterangkan lewat `hint`. */
export function Field({ path, label, value, onChange, max = 200, multiline = false, rows = 3, hint, placeholder, className, type = "text" }) {
  const id = fid(path);
  const warn = Boolean(useContext(LintCtx)[path]?.length);
  const props = {
    id,
    value: value ?? "",
    maxLength: max,
    placeholder,
    "aria-invalid": warn || undefined,
    onChange: (e) => onChange(e.target.value),
    className: cn("k-field", multiline && "resize-y"),
  };
  return (
    <div className={className}>
      <Caption htmlFor={id} label={label} hint={hint} count={(value ?? "").length} max={max} />
      {multiline ? <textarea rows={rows} {...props} /> : <input type={type} {...props} />}
      <Echo path={path} />
    </div>
  );
}

export function NumberField({ path, label, value, onChange, min, max, hint }) {
  const id = fid(path);
  const set = (n) => onChange(Math.min(max, Math.max(min, n)));
  return (
    <div>
      <Caption htmlFor={id} label={label} hint={hint} />
      <div className="flex h-10 items-stretch overflow-hidden rounded-[10px] border border-[var(--k-line-2)] bg-black/25">
        <button type="button" aria-label="Kurangi" onClick={() => set((value ?? min) - 1)} className="w-10 text-[var(--k-mute)] transition-colors hover:bg-white/5 hover:text-[var(--k-ink)]">
          −
        </button>
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          value={value ?? ""}
          onChange={(e) => e.target.value !== "" && set(Number(e.target.value))}
          className="w-full min-w-0 bg-transparent text-center font-mono text-[14px] tabular-nums text-[var(--k-ink)] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button type="button" aria-label="Tambah" onClick={() => set((value ?? min) + 1)} className="w-10 text-[var(--k-mute)] transition-colors hover:bg-white/5 hover:text-[var(--k-ink)]">
          +
        </button>
      </div>
    </div>
  );
}

/** Saklar "lampu sorot": bulatan menyala emas saat aktif. */
export function Toggle({ label, checked, onChange, hint }) {
  return (
    <label className="group flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[var(--k-line)] bg-white/[0.02] px-3.5 py-2.5 transition-colors hover:border-[var(--k-line-2)]">
      <span>
        <span className="block text-[14px] font-medium text-[var(--k-ink)]">{label}</span>
        {hint && <span className="block text-[12px] text-[var(--k-faint)]">{hint}</span>}
      </span>
      <span className="relative inline-flex">
        <input type="checkbox" className="peer sr-only" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-6 w-11 rounded-full border border-[var(--k-line-2)] bg-black/40 transition-colors duration-300 peer-checked:border-[var(--k-gold)]/60 peer-checked:bg-[var(--k-gold)]/20 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--k-gold)]/40" />
        <span className="absolute left-1 top-1 size-4 rounded-full bg-white/40 transition-[transform,background-color,box-shadow] duration-300 ease-cinematic peer-checked:translate-x-5 peer-checked:bg-[var(--k-gold)] peer-checked:shadow-[0_0_12px_var(--k-gold)]" />
      </span>
    </label>
  );
}

/** Pilihan segmen. `options` = [[nilai, label]]. */
export function Choice({ label, value, options, onChange }) {
  return (
    <div>
      <Caption label={label} />
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
        {options.map(([v, l]) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            onClick={() => onChange(v)}
            className={cn(
              "rounded-full border px-3 py-1 text-[12.5px] transition-[background-color,border-color,color] duration-300",
              value === v ? "border-[var(--k-gold)] bg-[var(--k-gold)] text-[var(--k-gold-ink)]" : "border-[var(--k-line-2)] text-[var(--k-mute)] hover:border-white/30 hover:text-[var(--k-ink)]"
            )}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Daftar kata (Enter/koma menambah, × menghapus, ‹ › menggeser). */
export function Words({ path, label, value = [], onChange, max = 12, itemMax = 40, placeholder = "Ketik lalu Enter", hint }) {
  const [draft, setDraft] = useState("");
  const id = fid(path);
  const add = () => {
    const parts = draft
      .split(/[,;]/)
      .map((s) => s.trim().slice(0, itemMax))
      .filter((s) => s && !value.includes(s));
    if (parts.length) onChange([...value, ...parts].slice(0, max));
    setDraft("");
  };
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div>
      <Caption htmlFor={id} label={label} hint={hint ?? `${value.length}/${max}`} />
      <div className="flex flex-wrap gap-1.5 rounded-[10px] border border-[var(--k-line-2)] bg-black/25 p-2 transition-colors focus-within:border-[var(--k-gold)]/60">
        {value.map((t, i) => (
          <span key={`${t}-${i}`} className="group/t inline-flex items-center gap-1 rounded-md border border-[var(--k-gold)]/25 bg-[var(--k-gold)]/10 px-2 py-1 text-[13px] text-[var(--k-ink)] animate-in fade-in-0 zoom-in-95">
            <button type="button" aria-label={`Geser ${t} ke kiri`} onClick={() => move(i, -1)} className="hidden text-[var(--k-faint)] hover:text-[var(--k-ink)] group-hover/t:inline">
              ‹
            </button>
            {t}
            <button type="button" aria-label={`Geser ${t} ke kanan`} onClick={() => move(i, 1)} className="hidden text-[var(--k-faint)] hover:text-[var(--k-ink)] group-hover/t:inline">
              ›
            </button>
            <button type="button" aria-label={`Hapus ${t}`} onClick={() => onChange(value.filter((_, j) => j !== i))} className="ml-0.5 text-[var(--k-faint)] hover:text-[#e9a0ab]">
              ×
            </button>
          </span>
        ))}
        {value.length < max && (
          <input
            id={id}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add();
              } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
            }}
            onBlur={add}
            placeholder={value.length ? "" : placeholder}
            className="min-w-[10ch] flex-1 bg-transparent px-1 py-1 text-[13.5px] text-[var(--k-ink)] outline-none placeholder:text-[var(--k-faint)]"
          />
        )}
      </div>
    </div>
  );
}

function Mini({ label, onClick, children, danger }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn("grid size-7 place-items-center rounded-md text-[13px] text-[var(--k-faint)] transition-colors hover:bg-white/5", danger ? "hover:text-[#e9a0ab]" : "hover:text-[var(--k-ink)]")}
    >
      {children}
    </button>
  );
}

/**
 * Daftar objek berurutan (tautan, peran, pemeran kisah). `fields` = [[kunci, label, max, { wide, kind }]].
 * Tiap baris = kartu bernomor romawi kecil; ↑ ↓ × di kanan.
 */
export function Repeater({ path, label, value = [], onChange, max = 6, fields, addLabel = "Tambah", blank, hint }) {
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const set = (i, k, v) => onChange(value.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (
    <div id={fid(path)}>
      <Caption label={label} hint={hint ?? `${value.length}/${max}`} />
      <ul className="space-y-2">
        {value.map((row, i) => (
          <li key={i} className="group/r relative rounded-xl border border-[var(--k-line)] bg-white/[0.02] p-3 pr-10 animate-in fade-in-0 slide-in-from-top-1">
            <span aria-hidden className="absolute -left-px top-3 h-5 w-[3px] rounded-r bg-[var(--k-gold)]/60" />
            <div className="grid gap-2 sm:grid-cols-2">
              {fields.map(([k, l, m, opt = {}]) =>
                opt.kind === "image" ? (
                  <MediaField key={k} path={`${path}.${i}.${k}`} label={l} value={row[k]} onChange={(v) => set(i, k, v ?? "")} compact />
                ) : (
                  <div key={k} className={cn(opt.wide && "sm:col-span-2")}>
                    <label className="sr-only" htmlFor={fid(`${path}.${i}.${k}`)}>
                      {l}
                    </label>
                    <input
                      id={fid(`${path}.${i}.${k}`)}
                      value={row[k] ?? ""}
                      maxLength={m}
                      placeholder={l}
                      onChange={(e) => set(i, k, e.target.value)}
                      className="k-field h-9 py-1.5 text-[13.5px]"
                    />
                    <Echo path={`${path}.${i}.${k}`} />
                  </div>
                )
              )}
            </div>
            <span className="absolute right-1.5 top-1.5 flex flex-col opacity-60 transition-opacity group-hover/r:opacity-100 group-focus-within/r:opacity-100">
              <Mini label="Naik" onClick={() => move(i, -1)}>↑</Mini>
              <Mini label="Turun" onClick={() => move(i, 1)}>↓</Mini>
              <Mini label="Hapus" onClick={() => onChange(value.filter((_, j) => j !== i))} danger>
                ×
              </Mini>
            </span>
          </li>
        ))}
      </ul>
      {value.length < max && (
        <button
          type="button"
          onClick={() => onChange([...value, blank ?? Object.fromEntries(fields.map(([k]) => [k, ""]))])}
          className="mt-2 w-full rounded-xl border border-dashed border-[var(--k-line-2)] py-2 text-[13px] font-medium text-[var(--k-mute)] transition-colors hover:border-[var(--k-gold)]/60 hover:text-[var(--k-gold)]"
        >
          + {addLabel}
        </button>
      )}
    </div>
  );
}

/** Berkas dari pustaka media (/api/upload): gambar, video, atau Lottie. */
export function MediaField({ path, label, value, onChange, kind = "image", aspect = "aspect-[4/3]", compact = false, className }) {
  const { open } = useContext(PickerCtx);
  const isImg = kind === "image" && value && /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(value);
  return (
    <div id={fid(path)} className={className}>
      {!compact && <Caption label={label} />}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => open({ path, kind, current: value, onPick: onChange })}
          aria-label={`Pilih ${label}`}
          className={cn(
            "group/img relative shrink-0 overflow-hidden rounded-lg border border-dashed border-[var(--k-line-2)] bg-black/30 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--k-gold)]",
            compact ? "size-9" : cn("w-24", aspect)
          )}
        >
          {isImg ? (
            <Image src={value} alt="" fill sizes="96px" className="object-cover object-top" />
          ) : value ? (
            <span className="grid size-full place-items-center px-1 text-center font-mono text-[9.5px] leading-tight text-[var(--k-mute)]">{value.split("/").pop()}</span>
          ) : (
            <span className="grid size-full place-items-center text-[18px] text-[var(--k-faint)]">+</span>
          )}
          {!compact && (
            <span className="absolute inset-x-0 bottom-0 translate-y-full bg-[var(--k-gold)] py-0.5 text-center text-[10.5px] font-semibold text-[var(--k-gold-ink)] transition-transform duration-300 group-hover/img:translate-y-0">Ganti</span>
          )}
        </button>
        <div className="min-w-0 flex-1">
          {compact && <span className="block text-[12px] text-[var(--k-mute)]">{label}</span>}
          <span className="block truncate font-mono text-[11.5px] text-[var(--k-faint)]">{value || "belum dipilih"}</span>
          {value && (
            <button type="button" onClick={() => onChange(undefined)} className="text-[12px] font-medium text-[var(--k-mute)] underline-offset-2 hover:text-[#e9a0ab] hover:underline">
              Kosongkan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Kelompok field: "plakat" berjudul dengan nomor inventaris. */
export function Plate({ no, title, desc, children, className, aside }) {
  const ref = useRef(null);
  return (
    <section ref={ref} className={cn("k-plaque rounded-2xl border border-[var(--k-line)] bg-[var(--k-panel)] p-5 sm:p-6", className)}>
      <header className="mb-5 flex items-start gap-3">
        {no && <span className="mt-1 rounded border border-[var(--k-gold)]/40 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-[var(--k-gold)]">{no}</span>}
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-[1.25rem] leading-tight text-[var(--k-ink)]">{title}</h3>
          {desc && <p className="mt-0.5 text-[13px] text-[var(--k-mute)]">{desc}</p>}
        </div>
        {aside}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
