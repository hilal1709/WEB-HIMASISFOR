"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { animate } from "animejs";
import { ArrowDown, ArrowUp, GripVertical, Plus, X } from "lucide-react";
import { isSafeUrl } from "@/lib/cms/shape";
import { MASCOT_POSES } from "@/lib/struktur-cms/schema";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** id DOM per path field — dipakai Pita Status untuk melompat ke field. */
export const fid = (path) => `bagan-${String(path).replace(/\./g, "-")}`;

const POSE_LABEL = { wave: "Melambai", "thumbs-up": "Jempol", confident: "Yakin", proud: "Bangga", think: "Berpikir", laugh: "Tertawa", run: "Berlari" };

/** Kelompok field dengan judul kecil & garis tipis. */
export function Group({ title, hint, children, aside }) {
  return (
    <section className="border-t border-white/[0.07] px-5 py-5 first:border-t-0">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-soft/90">{title}</h3>
          {hint && <p className="mt-1 text-[12px] leading-relaxed text-white/40">{hint}</p>}
        </div>
        {aside}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/**
 * Field kotak kaca: label mengambang di dalam kotak, cincin emas saat fokus, penghitung sisa
 * muncul mendekati batas. `flag` = sorot merah muda (kalimat berulang / wajib diisi).
 */
export function Field({ path, label, value, onChange, max, multiline = false, rows = 3, placeholder, hint, flag, mono = false, className }) {
  const id = fid(path);
  const len = (value ?? "").length;
  const near = max && len > max * 0.8;
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={cn(
          "group/f relative block rounded-xl border bg-white/[0.035] px-3.5 pb-2 pt-6 transition-[border-color,background-color,box-shadow] duration-300",
          "focus-within:border-gold/60 focus-within:bg-white/[0.06] focus-within:shadow-[0_0_0_4px_rgb(214_182_108/0.12)]",
          flag ? "border-[#e86a7c]/70 bg-[#e86a7c]/[0.06]" : "border-white/10 hover:border-white/20"
        )}
      >
        <span className="absolute left-3.5 top-2 flex w-[calc(100%-1.75rem)] items-center justify-between text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/45 group-focus-within/f:text-gold-soft">
          {label}
          {near && <span className={cn("tabular-nums tracking-normal", len >= max ? "text-[#e86a7c]" : "text-white/40")}>{max - len}</span>}
        </span>
        <Tag
          id={id}
          value={value ?? ""}
          rows={multiline ? rows : undefined}
          maxLength={max}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "block w-full resize-none bg-transparent text-[14px] leading-relaxed text-white outline-none placeholder:text-white/25",
            mono && "font-mono text-[13px]"
          )}
        />
      </label>
      {hint && <p className="mt-1.5 px-1 text-[11.5px] leading-relaxed text-white/40">{hint}</p>}
    </div>
  );
}

/** Tautan internal/eksternal: ditandai bila skema tidak aman. */
export function LinkField({ path, label = "Tautan", value, onChange }) {
  const bad = value && !isSafeUrl(value);
  return <Field path={path} label={label} value={value} onChange={onChange} max={500} mono flag={bad} placeholder="/halaman atau https://…" hint={bad ? "Gunakan / , # , https:// , mailto: atau tel:" : undefined} />;
}

/** Saklar pil; bulatan memantul (anime.js) saat dibalik. */
export function Switch({ checked, onChange, label, hint }) {
  const knob = useRef(null);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      onClick={() => {
        if (!prefersReducedMotion() && knob.current) animate(knob.current, { scale: [0.6, 1], duration: 480, ease: "outElastic(1, .6)" });
        onChange(!checked);
      }}
      className="flex w-full items-start gap-3 rounded-xl px-1 py-1 text-left"
    >
      <span className={cn("relative mt-0.5 h-[22px] w-10 shrink-0 rounded-full border transition-colors duration-300", checked ? "border-gold/60 bg-gold/80" : "border-white/15 bg-white/[0.06]")}>
        <span ref={knob} className={cn("absolute top-[2px] size-4 rounded-full shadow transition-[left,background-color] duration-300 ease-cinematic", checked ? "left-[20px] bg-navy-deep" : "left-[2px] bg-white/70")} />
      </span>
      <span>
        <span className="block text-[13.5px] font-medium text-white">{label}</span>
        {hint && <span className="block text-[12px] leading-relaxed text-white/45">{hint}</span>}
      </span>
    </button>
  );
}

/** Pilihan tersegmen dengan sorotan geser. */
export function Segmented({ label, value, options, onChange }) {
  const idx = Math.max(0, options.findIndex(([v]) => v === value));
  return (
    <div>
      {label && <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/45">{label}</p>}
      <div className="relative grid rounded-xl border border-white/10 bg-white/[0.03] p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
        <span
          aria-hidden
          className="absolute inset-y-1 rounded-lg bg-white/10 transition-transform duration-500 ease-cinematic"
          style={{ width: `calc((100% - .5rem) / ${options.length})`, transform: `translateX(${idx * 100}%)`, left: ".25rem" }}
        />
        {options.map(([v, l]) => (
          <button key={v} type="button" onClick={() => onChange(v)} className={cn("relative z-10 rounded-lg px-2 py-1.5 text-[12.5px] font-medium transition-colors", v === value ? "text-white" : "text-white/50 hover:text-white/80")}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Select bawaan bergaya kotak kaca. */
export function Select({ path, label, value, options, onChange, hint }) {
  return (
    <div>
      <label htmlFor={fid(path)} className="relative block rounded-xl border border-white/10 bg-white/[0.035] px-3.5 pb-2 pt-6 transition-colors focus-within:border-gold/60 hover:border-white/20">
        <span className="absolute left-3.5 top-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/45">{label}</span>
        <select id={fid(path)} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none bg-transparent text-[14px] text-white outline-none [&>option]:bg-navy-deep">
          {options.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <svg aria-hidden viewBox="0 0 12 12" className="pointer-events-none absolute bottom-3 right-3.5 size-3 text-white/40">
          <path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </label>
      {hint && <p className="mt-1.5 px-1 text-[11.5px] text-white/40">{hint}</p>}
    </div>
  );
}

/** Chip berurutan: Enter menambah, seret untuk mengurutkan, Backspace di input kosong menghapus terakhir. */
export function Chips({ path, label, items = [], onChange, max = 8, placeholder = "Ketik lalu Enter", flagIndex }) {
  const [draft, setDraft] = useState("");
  const [drag, setDrag] = useState(null);
  const add = () => {
    const t = draft.trim();
    if (!t || items.includes(t) || items.length >= max) return;
    onChange([...items, t]);
    setDraft("");
  };
  const drop = (to) => {
    if (drag == null || drag === to) return;
    const next = [...items];
    const [x] = next.splice(drag, 1);
    next.splice(to, 0, x);
    onChange(next);
    setDrag(null);
  };
  return (
    <div id={fid(path)}>
      <p className="mb-2 flex justify-between text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/45">
        {label}
        <span className="tabular-nums tracking-normal text-white/30">
          {items.length}/{max}
        </span>
      </p>
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] p-2 transition-colors focus-within:border-gold/60">
        {items.map((t, i) => (
          <span
            key={t}
            draggable
            onDragStart={() => setDrag(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => drop(i)}
            className={cn(
              "group/chip inline-flex cursor-grab items-center gap-1 rounded-lg border py-1 pl-2 pr-1 text-[12.5px] text-white/85 transition-[background-color,border-color,opacity] active:cursor-grabbing",
              drag === i ? "opacity-40" : "",
              flagIndex === i ? "border-[#e86a7c]/70 bg-[#e86a7c]/10" : "border-white/10 bg-white/[0.06] hover:border-white/25"
            )}
          >
            {t}
            <button type="button" aria-label={`Hapus ${t}`} onClick={() => onChange(items.filter((_, j) => j !== i))} className="grid size-4 place-items-center rounded text-white/40 hover:bg-white/10 hover:text-white">
              <X className="size-3" />
            </button>
          </span>
        ))}
        {items.length < max && (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
              if (e.key === "Backspace" && !draft && items.length) onChange(items.slice(0, -1));
            }}
            onBlur={add}
            placeholder={placeholder}
            className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-[13px] text-white outline-none placeholder:text-white/25"
          />
        )}
      </div>
    </div>
  );
}

/**
 * Editor daftar objek (breadcrumb, tautan penutup, tugas): kartu bernomor yang bisa dinaikkan,
 * diturunkan, dihapus. `fields` = [{ k, label, max, multiline, link }].
 */
export function ListEditor({ path, items = [], onChange, fields, blank, max = 5, addLabel = "Tambah", title }) {
  const set = (i, k, v) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => (
        <div key={i} className="group/item rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 transition-colors hover:border-white/15">
          <div className="mb-2.5 flex items-center gap-2">
            <GripVertical className="size-3.5 text-white/20" aria-hidden />
            <span className="font-serif text-[15px] tabular-nums text-gold-soft">{String(i + 1).padStart(2, "0")}</span>
            <span className="truncate text-[12px] text-white/45">{title?.(it) ?? ""}</span>
            <span className="ml-auto flex gap-0.5 opacity-60 transition-opacity group-hover/item:opacity-100">
              <IconBtn label="Naikkan" onClick={() => move(i, -1)} disabled={i === 0}>
                <ArrowUp className="size-3.5" />
              </IconBtn>
              <IconBtn label="Turunkan" onClick={() => move(i, 1)} disabled={i === items.length - 1}>
                <ArrowDown className="size-3.5" />
              </IconBtn>
              <IconBtn label="Hapus" onClick={() => onChange(items.filter((_, j) => j !== i))} danger>
                <X className="size-3.5" />
              </IconBtn>
            </span>
          </div>
          <div className="space-y-2">
            {fields.map((f) =>
              f.link ? (
                <LinkField key={f.k} path={`${path}.${i}.${f.k}`} label={f.label} value={it[f.k]} onChange={(v) => set(i, f.k, v)} />
              ) : (
                <Field key={f.k} path={`${path}.${i}.${f.k}`} label={f.label} value={it[f.k]} max={f.max} multiline={f.multiline} rows={2} onChange={(v) => set(i, f.k, v)} />
              )
            )}
          </div>
        </div>
      ))}
      {items.length < max && (
        <button
          type="button"
          onClick={() => onChange([...items, { ...blank }])}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 py-3 text-[13px] text-white/55 transition-colors hover:border-gold/50 hover:text-gold-soft"
        >
          <Plus className="size-4" /> {addLabel}
        </button>
      )}
    </div>
  );
}

/** Pose maskot Elvo sebagai deretan kartu kecil. */
export function PosePicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {MASCOT_POSES.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-pressed={value === p}
          className={cn(
            "flex flex-col items-center gap-1 rounded-xl border px-1 pb-1.5 pt-2 transition-[border-color,background-color,transform] duration-300 active:scale-95",
            value === p ? "border-gold/60 bg-gold/10" : "border-white/[0.08] hover:border-white/20"
          )}
        >
          <Image src={`/mascot/elvo-${p}.webp`} alt="" width={40} height={40} className="h-10 w-auto object-contain" />
          <span className="text-[10.5px] text-white/60">{POSE_LABEL[p] ?? p}</span>
        </button>
      ))}
    </div>
  );
}

export function IconBtn({ label, onClick, disabled, danger, children, className }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid size-7 place-items-center rounded-lg text-white/60 transition-[background-color,color,transform] hover:bg-white/10 hover:text-white active:scale-90 disabled:pointer-events-none disabled:opacity-25",
        danger && "hover:bg-[#e86a7c]/15 hover:text-[#ff9aa8]",
        className
      )}
    >
      {children}
    </button>
  );
}
