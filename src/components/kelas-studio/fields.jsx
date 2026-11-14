"use client";
import { useId, useRef, useState } from "react";
import { AnimatePresence, Reorder, motion } from "motion/react";
import { MASCOT_POSES } from "@/lib/program-kelas-cms/schema";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { cn } from "@/lib/utils";

/** id DOM untuk field (dipakai lompat dari daftar kalimat kembar). */
export const fid = (path) => `papan-${String(path).replace(/[^a-z0-9]+/gi, "-")}`;

export const moveItem = (arr, from, to) => {
  const next = [...arr];
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
};

/** Gulir ke field & kedipkan bingkainya. */
export function jumpToField(path) {
  const el = document.getElementById(fid(path));
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.remove("papan-blink");
  void el.offsetWidth;
  el.classList.add("papan-blink");
  setTimeout(() => el.querySelector("input,textarea")?.focus({ preventScroll: true }), 450);
}

/** Lembar kertas yang ditempel di papan — satu kelompok isian. */
export function Sheet({ title, hint, aside, children, className, tone = "paper" }) {
  return (
    <section className={cn("papan-sheet relative rounded-[10px] p-5 sm:p-6", tone === "navy" && "papan-sheet-navy", className)}>
      {(title || aside) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && <h3 className={cn("font-serif text-[1.2rem] leading-tight", tone === "navy" ? "text-white" : "text-navy")}>{title}</h3>}
            {hint && <p className={cn("mt-1 text-[12.5px]", tone === "navy" ? "text-white/55" : "text-text/50")}>{hint}</p>}
          </div>
          {aside}
        </header>
      )}
      <div className="space-y-5">{children}</div>
    </section>
  );
}

const Flag = () => <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10.5px] font-semibold text-orange-700">kalimat kembar</span>;

export function Label({ htmlFor, children, className }) {
  return (
    <label htmlFor={htmlFor} className={cn("text-[11px] font-semibold uppercase tracking-[0.14em] text-text/50 transition-colors group-focus-within:text-maroon", className)}>
      {children}
    </label>
  );
}

/**
 * Field teks: garis bawah ala buku tulis yang berubah maroon saat fokus,
 * penghitung karakter muncul saat fokus, memerah mendekati batas.
 */
export function Field({ path, label, value, onChange, max, multiline = false, rows = 3, placeholder, hint, flag, size = "body", className }) {
  const id = useId();
  const v = value ?? "";
  const near = max && v.length > max * 0.9;
  const Tag = multiline ? "textarea" : "input";
  return (
    <div id={path ? fid(path) : undefined} className={cn("group relative scroll-mt-28 rounded-md", className)}>
      <div className="mb-1 flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <span className="flex items-center gap-2">
          {flag && <Flag />}
          {max && <span className={cn("text-[11px] tabular-nums opacity-0 transition-opacity group-focus-within:opacity-100", near ? "text-maroon" : "text-text/35")}>{v.length}/{max}</span>}
        </span>
      </div>
      <div className={cn("relative rounded-md border bg-white transition-[border-color,box-shadow]", flag ? "border-orange-300" : "border-navy/10 group-hover:border-navy/25 group-focus-within:border-maroon/40 group-focus-within:shadow-[0_0_0_3px_rgb(110_20_35/0.08)]")}>
        <Tag
          id={id}
          value={v}
          rows={multiline ? rows : undefined}
          maxLength={max}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "block w-full resize-y rounded-md bg-transparent px-3 py-2 text-navy placeholder:text-text/30 focus:outline-none",
            size === "title" ? "font-serif text-[1.25rem] leading-snug" : "text-[14px] leading-relaxed"
          )}
        />
      </div>
      {hint && <p className="mt-1 text-[12px] text-text/45">{hint}</p>}
    </div>
  );
}

/** Judul bertingkat (1–3 baris). Baris kedua tampil sebagai aksen miring di halaman publik. */
export function TitleLines({ path, value = [], onChange, hint, tokens }) {
  const lines = [0, 1, 2].map((i) => value[i] ?? "");
  const set = (i, t) => {
    const next = [...lines];
    next[i] = t;
    while (next.length && !next[next.length - 1]) next.pop();
    onChange(next);
  };
  return (
    <div id={path ? fid(path) : undefined}>
      <div className="grid gap-3 sm:grid-cols-3">
        {["Baris awal", "Aksen miring", "Penutup"].map((l, i) => (
          <Field key={l} label={l} value={lines[i]} onChange={(t) => set(i, t)} max={40} size="title" />
        ))}
      </div>
      <p className="mt-2 font-serif text-[1.15rem] text-navy" aria-hidden>
        {lines[0]} <em className="text-maroon">{lines[1]}</em> {lines[2]}
      </p>
      {(hint || tokens) && (
        <p className="mt-1 text-[12px] text-text/45">
          {hint}
          {tokens && <Tokens list={tokens} />}
        </p>
      )}
    </div>
  );
}

/** Daftar token yang boleh dipakai di teks. */
export function Tokens({ list }) {
  return (
    <span className="ml-1 inline-flex flex-wrap gap-1 align-middle">
      {list.map((t) => (
        <code key={t} className="rounded bg-navy/[0.06] px-1.5 py-px text-[11px] text-navy">{`{${t}}`}</code>
      ))}
    </span>
  );
}

/** Saklar geser bergaya magnet bulat. */
export function Switch({ checked, onChange, label, hint }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="cursor-pointer">
        <span className="block text-[14px] text-navy">{label}</span>
        {hint && <span className="mt-0.5 block text-[12px] text-text/50">{hint}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={!!checked}
        onClick={() => onChange(!checked)}
        className={cn("relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition-colors duration-300", checked ? "border-maroon bg-maroon" : "border-navy/15 bg-navy/[0.06]")}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
          className={cn("absolute top-[2px] size-[18px] rounded-full bg-white shadow-[inset_-2px_-2px_0_rgb(0_0_0/0.12),0_1px_3px_rgb(0_0_0/0.3)]", checked ? "right-[2px]" : "left-[2px]")}
        />
      </button>
    </div>
  );
}

/** Pilihan tersegmentasi dengan penanda magnet yang meluncur. */
export function Segmented({ label, value, options, onChange, size = "md" }) {
  const lid = useId();
  return (
    <div>
      {label && <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text/50">{label}</p>}
      <div className="inline-flex flex-wrap rounded-md border border-navy/10 bg-white p-0.5">
        {options.map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            aria-pressed={value === k}
            className={cn("relative rounded-[5px] transition-colors", size === "sm" ? "px-2 py-0.5 text-[12px]" : "px-3 py-1 text-[12.5px]", value === k ? "text-white" : "text-navy/65 hover:text-navy")}
          >
            {value === k && <motion.span layoutId={lid} className="absolute inset-0 rounded-[5px] bg-navy" transition={{ type: "spring", stiffness: 520, damping: 36 }} />}
            <span className="relative">{l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Angka dengan tombol − / + yang memantul. */
export function NumberField({ path, label, value, onChange, min = 0, max = 9999, step = 1, suffix }) {
  const id = useId();
  const clamp = (x) => Math.min(max, Math.max(min, x));
  return (
    <div id={path ? fid(path) : undefined} className="group">
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1 flex items-center rounded-md border border-navy/10 bg-white transition-colors focus-within:border-maroon/40">
        <motion.button whileTap={{ scale: 0.8 }} type="button" aria-label={`Kurangi ${label}`} onClick={() => onChange(clamp((value ?? 0) - step))} className="grid size-9 place-items-center text-navy/60 hover:text-maroon">
          −
        </motion.button>
        <input
          id={id}
          inputMode="numeric"
          value={value ?? 0}
          onChange={(e) => {
            const x = Number(e.target.value.replace(/[^\d.]/g, ""));
            if (Number.isFinite(x)) onChange(clamp(x));
          }}
          className="w-full min-w-0 bg-transparent text-center text-[14px] font-semibold tabular-nums text-navy focus:outline-none"
        />
        {suffix && <span className="pr-1 text-[12px] text-text/45">{suffix}</span>}
        <motion.button whileTap={{ scale: 0.8 }} type="button" aria-label={`Tambah ${label}`} onClick={() => onChange(clamp((value ?? 0) + step))} className="grid size-9 place-items-center text-navy/60 hover:text-maroon">
          +
        </motion.button>
      </div>
    </div>
  );
}

let seq = 0;
const nid = () => `l${++seq}`;

/** Daftar baris teks yang bisa diurutkan dengan seret, ditambah, dan dihapus. */
export function Lines({ path, label, items = [], onChange, max = 6, placeholder = "Tulis lalu Enter", flagged }) {
  const [draft, setDraft] = useState("");
  // id stabil per baris supaya input tidak kehilangan fokus saat diketik / diurutkan
  const ids = useRef([]);
  if (ids.current.length !== items.length) {
    ids.current = items.map((_, i) => ids.current[i] ?? nid());
  }
  const keyed = items.map((t, i) => ({ t, k: ids.current[i] }));
  const add = () => {
    const t = draft.trim();
    if (!t || items.includes(t) || items.length >= max) return setDraft("");
    ids.current = [...ids.current, nid()];
    onChange([...items, t]);
    setDraft("");
  };
  const remove = (i) => {
    ids.current = ids.current.filter((_, j) => j !== i);
    onChange(items.filter((_, j) => j !== i));
  };
  return (
    <div id={path ? fid(path) : undefined} className="scroll-mt-28">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text/50">{label}</p>
        <span className="text-[11px] tabular-nums text-text/35">{items.length}/{max}</span>
      </div>
      <Reorder.Group
        axis="y"
        values={keyed}
        onReorder={(next) => {
          ids.current = next.map((x) => x.k);
          onChange(next.map((x) => x.t));
        }}
        className="space-y-1.5"
      >
        <AnimatePresence initial={false}>
          {keyed.map((x, i) => (
            <Reorder.Item
              key={x.k}
              value={x}
              id={path ? fid(`${path}.${i}`) : undefined}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12, transition: { duration: 0.15 } }}
              whileDrag={{ scale: 1.02, rotate: -0.6, boxShadow: "0 14px 24px -14px rgb(20 33 61 / 0.5)" }}
              className={cn("group/l flex items-center gap-2 rounded-md border bg-white py-1 pl-1.5 pr-1", flagged?.(i) ? "border-orange-300" : "border-navy/10")}
            >
              <span aria-hidden className="cursor-grab select-none px-1 text-[13px] text-text/30 active:cursor-grabbing">⋮⋮</span>
              <input
                value={x.t}
                maxLength={140}
                aria-label={`${label} ${i + 1}`}
                onChange={(e) => onChange(items.map((y, j) => (j === i ? e.target.value : y)))}
                className="min-w-0 flex-1 bg-transparent py-1 text-[13.5px] text-navy focus:outline-none"
              />
              <button type="button" aria-label={`Hapus ${x.t}`} onClick={() => remove(i)} className="grid size-7 place-items-center rounded text-text/35 opacity-60 transition hover:bg-maroon/10 hover:text-maroon group-hover/l:opacity-100">
                ×
              </button>
            </Reorder.Item>
          ))}
        </AnimatePresence>
      </Reorder.Group>
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
          className="mt-1.5 w-full rounded-md border border-dashed border-navy/20 bg-transparent px-3 py-1.5 text-[13px] text-navy placeholder:text-text/35 focus:border-maroon/40 focus:outline-none"
        />
      )}
    </div>
  );
}

/** Pilih ilustrasi Lottie dari kisi; yang aktif ditandai magnet. */
export function LottieGrid({ label, value, options, onChange, dark = false }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-text/50">{label}</p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {options.map(([src, l]) => (
          <button
            key={src}
            type="button"
            onClick={() => onChange(src)}
            aria-pressed={value === src}
            title={l}
            className={cn(
              "relative grid aspect-square place-items-center rounded-md border p-1.5 transition-[border-color,transform] hover:-translate-y-0.5",
              dark ? "bg-navy" : "bg-cream",
              value === src ? "border-maroon" : "border-navy/10 hover:border-navy/30"
            )}
          >
            <LottieIllustration src={src} className="w-full" replayOnHover />
            {value === src && <motion.span layoutId={`lottie-pin-${label}`} className="absolute -right-1 -top-1 size-3 rounded-full bg-maroon shadow" />}
            <span className="sr-only">{l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const POSE_LABEL = { wave: "Melambai", "thumbs-up": "Jempol", confident: "Yakin", proud: "Bangga", think: "Berpikir", laugh: "Tertawa", run: "Berlari" };

/** Maskot Elvo: tampil/tidak, pose, ucapan. */
export function MascotField({ path, value = {}, onChange, flag }) {
  return (
    <div className="space-y-3 rounded-md border border-dashed border-navy/15 p-3">
      <Switch label="Tampilkan Elvo" checked={value.show} onChange={(x) => onChange({ ...value, show: x })} />
      {value.show && (
        <>
          <Segmented size="sm" value={value.pose} onChange={(x) => onChange({ ...value, pose: x })} options={MASCOT_POSES.map((p) => [p, POSE_LABEL[p] ?? p])} />
          <Field path={path && `${path}.say`} label="Ucapan" value={value.say} onChange={(x) => onChange({ ...value, say: x })} max={120} flag={flag} />
        </>
      )}
    </div>
  );
}

/** Tombol kecil bergaya magnet. */
export function MagnetButton({ children, onClick, tone = "navy", disabled, className, ...props }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold transition-colors disabled:opacity-40",
        tone === "navy" && "border border-navy/15 bg-white text-navy hover:border-navy/40",
        tone === "maroon" && "bg-maroon text-white hover:bg-maroon-deep",
        tone === "ghost" && "text-text/60 hover:bg-navy/5 hover:text-navy",
        tone === "danger" && "text-maroon hover:bg-maroon/10",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
