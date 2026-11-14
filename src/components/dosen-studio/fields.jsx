"use client";
import { createContext, useContext, useId, useRef, useState } from "react";
import Image from "next/image";
import { animate } from "animejs";
import { prefersReducedMotion } from "@/lib/motion";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** id DOM untuk field (dipakai lompat dari daftar kalimat kembar). */
export const fid = (path) => `ruang-${String(path).replace(/[^a-z0-9]+/gi, "-")}`;

/** Konteks: buka pustaka media dari field mana pun. */
export const PickerCtx = createContext({ open: () => {} });

/** Label kecil gaya label map arsip: huruf kapital renggang + nomor rak opsional. */
function Caption({ htmlFor, label, hint, count, max }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <Label htmlFor={htmlFor} className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-navy/60">
        {label}
      </Label>
      <span className="flex items-baseline gap-2 text-[11px] text-text/45">
        {hint}
        {max ? (
          <span className={cn("tabular transition-colors", count > max * 0.9 ? "text-maroon" : undefined)}>
            {count}/{max}
          </span>
        ) : null}
      </span>
    </div>
  );
}

/** Teks satu baris / banyak baris dengan penghitung karakter. */
export function Field({ path, label, value, onChange, max = 200, multiline = false, rows = 3, hint, placeholder, className, type = "text" }) {
  const id = fid(path);
  const Cmp = multiline ? Textarea : Input;
  return (
    <div className={cn("group/f", className)}>
      <Caption htmlFor={id} label={label} hint={hint} count={(value ?? "").length} max={max} />
      <Cmp
        id={id}
        type={multiline ? undefined : type}
        rows={multiline ? rows : undefined}
        value={value ?? ""}
        maxLength={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border-navy/15 bg-white text-[14.5px] text-navy placeholder:text-navy/35 shadow-[inset_0_1px_0_rgb(20_33_61/0.03)] transition-[border-color,box-shadow] focus-visible:border-maroon/50 focus-visible:ring-maroon/15"
      />
    </div>
  );
}

/** Saklar geser (pill) dengan label. */
export function Toggle({ label, checked, onChange, hint }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-md border border-navy/10 bg-white px-3.5 py-2.5 transition-colors hover:border-navy/25">
      <span>
        <span className="block text-[14px] font-medium text-navy">{label}</span>
        {hint && <span className="block text-[12px] text-text/50">{hint}</span>}
      </span>
      <span className="relative inline-flex">
        <input type="checkbox" className="peer sr-only" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-navy/15 transition-colors duration-300 peer-checked:bg-maroon peer-focus-visible:ring-2 peer-focus-visible:ring-maroon/30" />
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-300 ease-cinematic peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

/** Pilihan segmen (mis. pose maskot). */
export function Segmented({ label, value, options, onChange }) {
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
              value === v ? "border-navy bg-navy text-white" : "border-navy/15 bg-white text-navy/75 hover:border-navy/40"
            )}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Daftar tag: Enter / koma menambah, × menghapus, ← → menggeser urutan. */
export function TagList({ path, label, value = [], onChange, max = 12, itemMax = 80, placeholder = "Ketik lalu Enter", hint }) {
  const [draft, setDraft] = useState("");
  const id = fid(path);
  const add = () => {
    const parts = draft
      .split(/[,;]/)
      .map((s) => s.trim().slice(0, itemMax))
      .filter((s) => s && !value.includes(s));
    if (!parts.length) return setDraft("");
    onChange([...value, ...parts].slice(0, max));
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
      <div className="flex flex-wrap gap-1.5 rounded-md border border-navy/15 bg-white p-2 focus-within:border-maroon/50">
        {value.map((t, i) => (
          <span key={`${t}-${i}`} className="group/t inline-flex items-center gap-1 rounded bg-cream px-2 py-1 text-[13px] text-navy animate-in fade-in-0 zoom-in-95">
            <button type="button" aria-label={`Geser ${t} ke kiri`} onClick={() => move(i, -1)} className="hidden text-navy/35 hover:text-navy group-hover/t:inline">
              ‹
            </button>
            {t}
            <button type="button" aria-label={`Geser ${t} ke kanan`} onClick={() => move(i, 1)} className="hidden text-navy/35 hover:text-navy group-hover/t:inline">
              ›
            </button>
            <button type="button" aria-label={`Hapus ${t}`} onClick={() => onChange(value.filter((_, j) => j !== i))} className="ml-0.5 text-navy/40 hover:text-maroon">
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
            className="min-w-[10ch] flex-1 bg-transparent px-1 py-1 text-[13.5px] text-navy outline-none placeholder:text-text/35"
          />
        )}
      </div>
    </div>
  );
}

/** Daftar baris berurutan (mata kuliah, riset) — tiap baris bernomor, bisa digeser & dihapus. */
export function LineList({ path, label, value = [], onChange, max = 12, itemMax = 200, addLabel = "Tambah baris", placeholder }) {
  const [focus, setFocus] = useState(null);
  const listRef = useRef(null);
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div id={fid(path)}>
      <Caption label={label} hint={`${value.length}/${max}`} />
      <ol ref={listRef} className="divide-y divide-navy/10 rounded-md border border-navy/15 bg-white">
        {value.map((t, i) => (
          <li key={i} className={cn("group/l flex items-center gap-2 px-2.5 py-1.5 transition-colors", focus === i && "bg-cream/60")}>
            <span className="tabular w-6 shrink-0 font-serif text-[14px] text-maroon">{String(i + 1).padStart(2, "0")}</span>
            <input
              data-row={i}
              value={t}
              maxLength={itemMax}
              placeholder={placeholder}
              onFocus={() => setFocus(i)}
              onBlur={() => setFocus(null)}
              onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && value.length < max) {
                  e.preventDefault();
                  onChange([...value.slice(0, i + 1), "", ...value.slice(i + 1)]);
                  requestAnimationFrame(() => listRef.current?.querySelector(`[data-row="${i + 1}"]`)?.focus());
                }
                if (e.key === "Backspace" && !t) {
                  e.preventDefault();
                  onChange(value.filter((_, j) => j !== i));
                  requestAnimationFrame(() => listRef.current?.querySelector(`[data-row="${Math.max(0, i - 1)}"]`)?.focus());
                }
              }}
              className="min-w-0 flex-1 bg-transparent py-1 text-[14px] text-navy outline-none placeholder:text-text/35"
            />
            <span className="flex opacity-0 transition-opacity group-focus-within/l:opacity-100 group-hover/l:opacity-100">
              <MiniBtn label="Naik" onClick={() => move(i, -1)}>↑</MiniBtn>
              <MiniBtn label="Turun" onClick={() => move(i, 1)}>↓</MiniBtn>
              <MiniBtn label="Hapus" onClick={() => onChange(value.filter((_, j) => j !== i))} danger>
                ×
              </MiniBtn>
            </span>
          </li>
        ))}
        {value.length < max && (
          <li>
            <button
              type="button"
              onClick={() => {
                onChange([...value, ""]);
                requestAnimationFrame(() => listRef.current?.querySelector(`[data-row="${value.length}"]`)?.focus());
              }}
              className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[13px] font-medium text-navy/55 transition-colors hover:bg-cream/50 hover:text-maroon"
            >
              <span className="w-6 text-center">+</span>
              {addLabel}
            </button>
          </li>
        )}
      </ol>
    </div>
  );
}

export function MiniBtn({ label, onClick, children, danger }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn("grid size-7 place-items-center rounded text-[13px] text-navy/45 transition-colors hover:bg-cream", danger ? "hover:text-maroon" : "hover:text-navy")}
    >
      {children}
    </button>
  );
}

/** Gambar dari pustaka media (/api/upload). */
export function ImageField({ path, label, value, onChange, fallback, kind = "image", aspect = "aspect-[4/5]", className }) {
  const { open } = useContext(PickerCtx);
  const shown = value || fallback;
  return (
    <div id={fid(path)} className={className}>
      <Caption label={label} hint={!value && fallback ? "ikut Bagan" : undefined} />
      <div className="flex items-end gap-3">
        <button
          type="button"
          onClick={() => open({ path, kind, current: value, onPick: onChange })}
          className={cn("group/img relative w-28 shrink-0 overflow-hidden rounded-md border border-dashed border-navy/25 bg-cream-2 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-maroon", aspect)}
        >
          {shown ? (
            kind === "image" ? (
              <Image src={shown} alt="" fill sizes="112px" className={cn("object-cover object-top", !value && "opacity-70 grayscale-[0.4]")} />
            ) : (
              <span className="grid size-full place-items-center px-2 text-center text-[11px] text-navy/60">{shown.split("/").pop()}</span>
            )
          ) : (
            <span className="grid size-full place-items-center text-[12px] text-navy/45">Pilih berkas</span>
          )}
          <span className="absolute inset-x-0 bottom-0 translate-y-full bg-navy/85 py-1 text-center text-[11px] font-medium text-white transition-transform duration-300 group-hover/img:translate-y-0">Ganti</span>
        </button>
        {value && (
          <button type="button" onClick={() => onChange(undefined)} className="text-[12.5px] font-medium text-navy/55 underline-offset-2 hover:text-maroon hover:underline">
            {fallback ? "Ikut Bagan lagi" : "Kosongkan"}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Field identitas yang mewarisi Studio Bagan. Kosong (undefined) = ikut Bagan; nilai Bagan tampil sebagai
 * placeholder abu. Menimpa → pita emas "ditimpa" + tombol kembali ikut Bagan (dengan kilat balik).
 */
export function InheritField({ path, label, value, inherited, onChange, max = 160, custom = false }) {
  const id = fid(path);
  const ref = useRef(null);
  const overridden = !custom && value !== undefined;
  const reset = () => {
    onChange(undefined);
    if (ref.current && !prefersReducedMotion()) animate(ref.current, { backgroundColor: ["rgba(201,162,39,0.28)", "rgba(255,255,255,1)"], duration: 900, ease: "outQuad" });
  };
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <Label htmlFor={id} className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-navy/60">
          {label}
        </Label>
        {!custom &&
          (overridden ? (
            <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-gold hover:text-maroon">
              <span aria-hidden className="size-1.5 rounded-full bg-gold" />
              ditimpa · ikut Bagan lagi
            </button>
          ) : (
            <span className="text-[11px] text-text/40">ikut Studio Bagan</span>
          ))}
      </div>
      <Input
        ref={ref}
        id={id}
        value={value ?? ""}
        maxLength={max}
        placeholder={inherited || "—"}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "rounded-md bg-white text-[14.5px] text-navy transition-[border-color,box-shadow] placeholder:text-navy/40 focus-visible:border-maroon/50 focus-visible:ring-maroon/15",
          overridden ? "border-gold/70 shadow-[inset_3px_0_0_var(--gold)]" : "border-navy/15"
        )}
      />
    </div>
  );
}

/** Baris tautan { label, href } dengan pengurutan. */
export function LinkRows({ path, label, value = [], onChange, max = 5, fields = [["label", "Label", 60], ["href", "Tautan", 300]], addLabel = "Tambah", blank }) {
  const uid = useId();
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div id={fid(path)}>
      <Caption label={label} hint={`${value.length}/${max}`} />
      <ul className="space-y-2">
        {value.map((row, i) => (
          <li key={i} className="group/r relative rounded-md border border-navy/12 bg-white p-3 pr-10 animate-in fade-in-0 slide-in-from-top-1">
            <div className="grid gap-2 sm:grid-cols-2">
              {fields.map(([k, l, m]) => (
                <label key={k} className={cn("block", fields.length > 2 && k === "body" && "sm:col-span-2")}>
                  <span className="sr-only">{l}</span>
                  <input
                    id={`${uid}-${i}-${k}`}
                    value={row[k] ?? ""}
                    maxLength={m}
                    placeholder={l}
                    onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)))}
                    className="h-9 w-full rounded border border-navy/10 bg-cream/40 px-2.5 text-[13.5px] text-navy outline-none transition-colors placeholder:text-text/40 focus:border-maroon/40 focus:bg-white"
                  />
                </label>
              ))}
            </div>
            <span className="absolute right-1.5 top-1.5 flex flex-col">
              <MiniBtn label="Naik" onClick={() => move(i, -1)}>↑</MiniBtn>
              <MiniBtn label="Turun" onClick={() => move(i, 1)}>↓</MiniBtn>
              <MiniBtn label="Hapus" onClick={() => onChange(value.filter((_, j) => j !== i))} danger>
                ×
              </MiniBtn>
            </span>
          </li>
        ))}
      </ul>
      {value.length < max && (
        <button
          type="button"
          onClick={() => onChange([...value, blank ?? Object.fromEntries(fields.map(([k]) => [k, ""]))])}
          className="mt-2 w-full rounded-md border border-dashed border-navy/20 py-2 text-[13px] font-medium text-navy/60 transition-colors hover:border-maroon hover:text-maroon"
        >
          + {addLabel}
        </button>
      )}
    </div>
  );
}

/** Kelompok field berjudul, gaya halaman berkas: nomor folio di kiri. */
export function Folio({ no, title, desc, children, className }) {
  return (
    <section className={cn("relative border-t border-navy/10 pt-6 first:border-t-0 first:pt-0", className)}>
      <div className="mb-4 flex items-baseline gap-3">
        {no && <span className="tabular font-mono text-[11px] text-maroon/70">{no}</span>}
        <div>
          <h3 className="font-serif text-[1.2rem] leading-tight text-navy">{title}</h3>
          {desc && <p className="mt-0.5 text-[13px] text-text/55">{desc}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
