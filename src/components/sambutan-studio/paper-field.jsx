"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { motion } from "motion/react";
import { gsap } from "@/lib/scroll";
import { cn } from "@/lib/utils";

const SIZES = {
  display: "font-serif text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.08] tracking-[-0.01em] text-navy",
  title: "font-serif text-[1.45rem] leading-snug text-navy",
  italic: "font-serif text-[1.3rem] italic leading-snug text-maroon",
  body: "text-[16.5px] leading-[1.8] text-text/85",
  meta: "text-[14px] leading-relaxed text-text/80",
};

/** id DOM untuk field (dipakai lompat dari daftar redundansi). */
export const fieldDomId = (path) => `meja-${path.replace(/\./g, "-")}`;

/**
 * Field di atas kertas: teks diedit langsung dengan gaya yang sama dengan halaman publik.
 * Fokus → label naik, garis emas "mengalir" dari kiri (GSAP), penghitung karakter muncul.
 */
export function PaperField({ path, label, value, onChange, size = "body", multiline = false, max, placeholder, hint, flag, className, inputClassName }) {
  const ref = useRef(null);
  const line = useRef(null);
  const [focus, setFocus] = useState(false);
  const id = fieldDomId(path);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !multiline) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [value, multiline]);

  useEffect(() => {
    if (!line.current) return;
    gsap.to(line.current, { scaleX: focus ? 1 : 0, transformOrigin: focus ? "left" : "right", duration: focus ? 0.55 : 0.35, ease: focus ? "expo.out" : "power2.in" });
  }, [focus]);

  const Tag = multiline ? "textarea" : "input";
  const len = value?.length ?? 0;
  const near = max && len > max * 0.85;

  return (
    <div className={cn("group/field relative min-w-0", className)}>
      <label htmlFor={id} className={cn("mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300", focus ? "text-maroon" : "text-text/40")}>
        {label}
        {flag && <span className="rounded-full bg-gold/20 px-1.5 py-px text-[10px] normal-case tracking-normal text-maroon">{flag}</span>}
      </label>
      <div className="relative">
        <Tag
          id={id}
          ref={ref}
          rows={multiline ? 1 : undefined}
          cols={multiline ? 1 : undefined}
          value={value ?? ""}
          maxLength={max}
          placeholder={placeholder}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "block w-full resize-none overflow-hidden rounded-none border-0 border-b border-dashed border-text/15 bg-transparent px-0 pb-2 outline-none transition-colors placeholder:text-text/25 hover:border-text/30 focus:border-transparent",
            SIZES[size],
            inputClassName
          )}
        />
        <span ref={line} aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gold" />
      </div>
      <div className={cn("mt-1 flex justify-between gap-3 text-[11.5px] transition-opacity duration-300", focus || hint ? "opacity-100" : "opacity-0")}>
        <span className="text-text/45">{hint}</span>
        {max && focus && <span className={cn("tabular-nums", near ? "text-maroon" : "text-text/35")}>{len}/{max}</span>}
      </div>
    </div>
  );
}

/** Saklar dengan pegas (motion). */
export function PaperSwitch({ checked, onChange, label, hint }) {
  const id = useId();
  return (
    <label htmlFor={id} className="group flex cursor-pointer items-start justify-between gap-4 py-1">
      <span>
        <span className="block text-[14px] font-medium text-navy">{label}</span>
        {hint && <span className="mt-0.5 block text-[12.5px] text-text/50">{hint}</span>}
      </span>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-300", checked ? "bg-maroon" : "bg-text/15")}
      >
        <motion.span
          initial={false}
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 600, damping: 32 }}
          className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm"
        />
      </button>
    </label>
  );
}

/** Daftar chip (riset, sertifikasi): tambah dengan Enter, hapus dengan animasi menyusut. */
export function ChipList({ path, label, items = [], onChange, placeholder = "Tambah lalu Enter", max = 12 }) {
  const [draft, setDraft] = useState("");
  const box = useRef(null);
  const add = () => {
    const v = draft.trim();
    if (!v || items.length >= max) return;
    onChange([...items, v]);
    setDraft("");
    requestAnimationFrame(() => {
      const last = box.current?.querySelector("[data-chip]:last-of-type");
      if (last) animate(last, { scale: [0.6, 1], opacity: [0, 1], duration: 450, ease: "outBack(2)" });
    });
  };
  const remove = (i, el) =>
    animate(el, { scale: 0.6, opacity: 0, duration: 220, ease: "inQuad", onComplete: () => onChange(items.filter((_, j) => j !== i)) });
  return (
    <div id={fieldDomId(path)}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-text/40">{label}</p>
      <div ref={box} className="flex flex-wrap items-center gap-1.5">
        {items.map((x, i) => (
          <span key={i} data-chip className="group/chip inline-flex items-center gap-1 rounded-md bg-cream px-2.5 py-1 text-[13px] text-navy">
            <input
              value={x}
              onChange={(e) => onChange(items.map((y, j) => (j === i ? e.target.value : y)))}
              size={Math.max(3, x.length)}
              className="bg-transparent outline-none"
              aria-label={`${label} ${i + 1}`}
            />
            <button type="button" onClick={(e) => remove(i, e.currentTarget.parentElement)} aria-label="Hapus" className="text-text/30 transition-colors hover:text-maroon">
              ×
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
            }}
            onBlur={add}
            placeholder={placeholder}
            className="min-w-[10rem] flex-1 border-b border-dashed border-text/15 bg-transparent px-1 py-1 text-[13px] outline-none placeholder:text-text/30 focus:border-gold"
          />
        )}
      </div>
    </div>
  );
}

/** Pasangan label + tautan dalam satu baris. */
export function LinkPair({ path, label, value = {}, onChange, labelKey = "label", hrefKey = "href" }) {
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr]">
      <PaperField path={`${path}.${labelKey}`} label={label} value={value[labelKey]} onChange={(v) => onChange({ ...value, [labelKey]: v })} size="meta" max={60} />
      <PaperField
        path={`${path}.${hrefKey}`}
        label="Tautan"
        value={value[hrefKey]}
        onChange={(v) => onChange({ ...value, [hrefKey]: v })}
        size="meta"
        placeholder="/halaman atau https://…"
        hint={value[hrefKey] && !/^(\/|#|https?:\/\/|mailto:|tel:)/.test(value[hrefKey]) ? "Awali dengan / atau https://" : undefined}
      />
    </div>
  );
}
