"use client";
import { useId, useRef, useState } from "react";
import Image from "next/image";
import { animate } from "animejs";
import { isSafeUrl } from "@/lib/cms/shape";
import { MASCOT_POSES } from "@/lib/visi-misi-cms/schema";
import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** id DOM per path field — dipakai banner redundansi untuk melompat ke field. */
export const fieldDomId = (path) => `kompas-${path.replace(/\./g, "-")}`;

const POSE_LABEL = { wave: "Melambai", "thumbs-up": "Jempol", confident: "Yakin", proud: "Bangga", think: "Berpikir", laugh: "Tertawa", run: "Berlari" };

/**
 * Field garis cakrawala: label kecil di atas, garis bawah yang memanjang emas dari tengah saat fokus,
 * penghitung sisa karakter muncul saat mendekati batas. `flag` = sorot merah (mis. kalimat berulang).
 */
export function Line({ path, label, value, onChange, max, multiline = false, rows = 3, placeholder, hint, flag, tone = "light", className, inputClassName, size = "md" }) {
  const id = fieldDomId(path);
  const len = (value ?? "").length;
  const near = max && len > max * 0.8;
  const Tag = multiline ? "textarea" : "input";
  const dark = tone === "dark";
  return (
    <label htmlFor={id} className={cn("group/line block", className)}>
      {label && (
        <span className={cn("flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.14em]", dark ? "text-gold-soft/80" : "text-navy/50")}>
          {label}
          {near && <span className={cn("tabular-nums tracking-normal", len >= max ? "text-[#e86a7c]" : dark ? "text-white/50" : "text-text/45")}>{max - len}</span>}
        </span>
      )}
      <span className="relative mt-1.5 block">
        <Tag
          id={id}
          value={value ?? ""}
          rows={multiline ? rows : undefined}
          maxLength={max}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "block w-full resize-none border-0 border-b bg-transparent px-0 pb-2 pt-1 outline-none transition-colors placeholder:opacity-40",
            size === "lg" ? "font-serif text-[clamp(1.4rem,2.4vw,2rem)] leading-tight" : size === "sm" ? "text-[13.5px]" : "text-[15px] leading-relaxed",
            dark ? "border-white/15 text-white placeholder:text-white" : "border-navy/15 text-navy",
            flag && "border-[#e86a7c] bg-[#e86a7c]/5",
            inputClassName
          )}
        />
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-center scale-x-0 bg-gold transition-transform duration-500 ease-cinematic group-focus-within/line:scale-x-100" />
      </span>
      {hint && <span className={cn("mt-1.5 block text-[12px]", dark ? "text-white/45" : "text-text/45")}>{hint}</span>}
    </label>
  );
}

/** Saklar geser bergaya jarum: bulatan melompat dengan pegas. */
export function Toggle({ checked, onChange, label, hint, tone = "light" }) {
  const knob = useRef(null);
  const flip = () => {
    if (!prefersReducedMotion() && knob.current) animate(knob.current, { scale: [0.7, 1], duration: 420, ease: "outBack(2)" });
    onChange(!checked);
  };
  const dark = tone === "dark";
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={flip} className="group flex w-full items-start gap-3 text-left">
      <span className={cn("relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-300", checked ? "bg-maroon" : dark ? "bg-white/15" : "bg-navy/15")}>
        <span ref={knob} className={cn("absolute top-1 size-4 rounded-full bg-white shadow transition-[left] duration-300 ease-cinematic", checked ? "left-6" : "left-1")} />
      </span>
      <span>
        <span className={cn("block text-[14px] font-medium", dark ? "text-white" : "text-navy")}>{label}</span>
        {hint && <span className={cn("block text-[12px]", dark ? "text-white/50" : "text-text/50")}>{hint}</span>}
      </span>
    </button>
  );
}

/** Daftar tag: Enter untuk menambah, Backspace di input kosong menghapus terakhir. */
export function Tags({ path, label, items = [], onChange, max = 5, placeholder = "Tambah lalu Enter" }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (!t || items.includes(t) || items.length >= max) return;
    onChange([...items, t]);
    setDraft("");
  };
  return (
    <div>
      {label && <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-navy/50">{label}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {items.map((t, i) => (
          <span key={t} className="group inline-flex items-center gap-1 rounded-full bg-cream py-1 pl-3 pr-1.5 text-[12.5px] text-navy animate-in fade-in-0 zoom-in-90">
            {t}
            <button type="button" aria-label={`Hapus ${t}`} onClick={() => onChange(items.filter((_, j) => j !== i))} className="grid size-4 place-items-center rounded-full text-navy/40 transition-colors hover:bg-maroon hover:text-white">
              ×
            </button>
          </span>
        ))}
        {items.length < max && (
          <input
            id={fieldDomId(path)}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              } else if (e.key === "Backspace" && !draft && items.length) onChange(items.slice(0, -1));
            }}
            onBlur={add}
            placeholder={placeholder}
            className="min-w-[8rem] flex-1 border-0 border-b border-dashed border-navy/20 bg-transparent px-1 py-1 text-[13px] outline-none focus:border-gold"
          />
        )}
      </div>
    </div>
  );
}

/** Tautan: input dengan validasi langsung (/, #, https://, mailto:, tel:). */
export function Href({ path, label = "Tautan", value, onChange, tone }) {
  const bad = value && !isSafeUrl(value);
  return <Line path={path} label={label} value={value} onChange={onChange} size="sm" tone={tone} flag={bad} hint={bad ? "Awali dengan /, #, https://, mailto: atau tel:" : undefined} placeholder="/halaman atau https://…" />;
}

/** Pemilih pose Elvo: kartu poster kecil; pose aktif terangkat dengan bingkai emas. */
export function PosePicker({ value = {}, onChange, path, tone = "light", title = "Elvo" }) {
  const gid = useId();
  const dark = tone === "dark";
  return (
    <div className="space-y-4">
      <Toggle tone={tone} checked={Boolean(value.show)} onChange={(v) => onChange({ ...value, show: v })} label={`Tampilkan ${title}`} hint="Maskot menyapa di samping section (layar lebar)." />
      {value.show && (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-top-1">
          <div role="radiogroup" aria-labelledby={gid} className="flex gap-2 overflow-x-auto pb-1">
            <span id={gid} className="sr-only">Pose</span>
            {MASCOT_POSES.map((p) => {
              const on = value.pose === p;
              return (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onChange({ ...value, pose: p })}
                  className={cn(
                    "flex w-[72px] shrink-0 flex-col items-center rounded-lg p-1.5 pb-1 ring-1 transition-[transform,box-shadow,background-color] duration-300 ease-cinematic",
                    on ? "-translate-y-1 bg-gold/15 ring-2 ring-gold" : dark ? "ring-white/10 hover:bg-white/5" : "ring-navy/10 hover:bg-cream"
                  )}
                >
                  <Image src={`/mascot/elvo-${p}.webp`} alt="" width={56} height={56} className="h-14 w-auto object-contain" />
                  <span className={cn("mt-1 text-[10.5px]", dark ? "text-white/70" : "text-navy/70")}>{POSE_LABEL[p]}</span>
                </button>
              );
            })}
          </div>
          <Line tone={tone} path={`${path}.say`} label="Ucapan" value={value.say} max={120} onChange={(say) => onChange({ ...value, say })} />
        </div>
      )}
    </div>
  );
}

/** Kartu kelompok field dengan judul kecil. */
export function Panel({ title, children, className, tone = "light", aside }) {
  return (
    <section className={cn("rounded-xl p-5 sm:p-6", tone === "dark" ? "bg-white/[0.04] ring-1 ring-white/10" : "bg-white ring-1 ring-navy/[0.07] shadow-[0_20px_40px_-34px_rgb(20_33_61/0.5)]", className)}>
      {(title || aside) && (
        <header className="mb-5 flex items-center justify-between gap-3">
          {title && <h3 className={cn("font-serif text-[1.15rem]", tone === "dark" ? "text-white" : "text-navy")}>{title}</h3>}
          {aside}
        </header>
      )}
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/** Tombol kecil bulat untuk aksi item (naik/turun/hapus). */
export function Mini({ label, onClick, disabled, danger, children, className }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid size-8 place-items-center rounded-full text-[13px] ring-1 transition-[background-color,color,transform] duration-200 active:scale-90 disabled:pointer-events-none disabled:opacity-30",
        danger ? "text-maroon ring-maroon/20 hover:bg-maroon hover:text-white" : "text-navy ring-navy/15 hover:bg-navy hover:text-white",
        className
      )}
    >
      {children}
    </button>
  );
}
