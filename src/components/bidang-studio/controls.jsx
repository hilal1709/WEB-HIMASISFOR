"use client";
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { Spinner } from "@/components/ui/loader";
import { cn } from "@/lib/utils";
import { kid } from "./chrome";

/* Kontrol gelap Konsol Bidang. Semua menerima `path` → id DOM untuk lompat dari pemeriksa redundansi. */

export function Group({ title, hint, children, className, aside }) {
  return (
    <section className={cn("rounded-2xl border border-[var(--k-line)] bg-[var(--k-panel)]/70 p-4 sm:p-5", className)}>
      <header className="mb-4 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-mono text-[10.5px] tracking-[0.22em] text-[var(--k-gold)]">{title.toUpperCase()}</h3>
          {hint && <p className="mt-1 text-[12.5px] leading-snug text-[var(--k-faint)]">{hint}</p>}
        </div>
        {aside}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Caption({ label, htmlFor, count, max, flag }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-2">
      <label htmlFor={htmlFor} className="text-[12.5px] font-medium text-[var(--k-mute)]">
        {label}
        {flag && <span className="ml-2 rounded bg-[var(--k-led-bad)]/15 px-1.5 py-0.5 text-[10.5px] font-semibold text-[var(--k-led-bad)]">mengulang</span>}
      </label>
      {max != null && <span className={cn("font-mono text-[10.5px] tabular-nums", count > max * 0.9 ? "text-[var(--k-led-warn)]" : "text-[var(--k-faint)]")}>{count}/{max}</span>}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-[var(--k-line-2)] bg-black/25 px-3 py-2 text-[14px] text-[var(--k-ink)] placeholder:text-[var(--k-faint)] outline-none transition-[border-color,box-shadow,background-color] duration-200 focus:border-[var(--k-gold)] focus:bg-black/35 focus:shadow-[0_0_0_3px_rgb(217_178_58/0.15)]";

export function Field({ path, label, value, onChange, max, multiline = false, rows = 3, placeholder, hint, flag, mono = false, serif = false, className }) {
  const id = useId();
  const v = value ?? "";
  return (
    <div id={kid(path)} className={cn("rounded-lg", className)}>
      <Caption label={label} htmlFor={id} count={v.length} max={max} flag={flag} />
      {multiline ? (
        <textarea id={id} rows={rows} value={v} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "k-scroll resize-y leading-relaxed", serif && "font-serif text-[15.5px]")} />
      ) : (
        <input id={id} value={v} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, mono && "font-mono text-[13px]", serif && "font-serif text-[16px]")} />
      )}
      {hint && <p className="mt-1 text-[11.5px] leading-snug text-[var(--k-faint)]">{hint}</p>}
    </div>
  );
}

/** Judul bertingkat (baris-baris), baris aksen di tengah ditandai emas. */
export function Lines({ path, label, value = [], count, onChange, hint }) {
  const n = count ?? value.length;
  const rows = Array.from({ length: n }, (_, i) => value[i] ?? "");
  return (
    <div id={kid(path)} className="rounded-lg">
      <Caption label={label} />
      <div className="space-y-1.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={cn("w-5 font-mono text-[10.5px]", n === 3 && i === 1 ? "text-[var(--k-gold)]" : "text-[var(--k-faint)]")}>{i + 1}</span>
            <input value={r} maxLength={60} aria-label={`${label} baris ${i + 1}`} onChange={(e) => onChange(rows.map((x, j) => (j === i ? e.target.value : x)))} className={cn(inputCls, "font-serif text-[15px]", n === 3 && i === 1 && "italic")} />
          </div>
        ))}
      </div>
      {hint && <p className="mt-1 text-[11.5px] text-[var(--k-faint)]">{hint}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <button type="button" role="switch" aria-checked={!!checked} onClick={() => onChange(!checked)} className="group flex w-full items-center gap-3 text-left">
      <span className={cn("relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-300", checked ? "border-[var(--k-gold)] bg-[var(--k-gold)]/25" : "border-[var(--k-line-2)] bg-black/30")}>
        <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 32 }} className={cn("absolute top-0.5 size-3.5 rounded-full", checked ? "right-0.5 bg-[var(--k-gold)]" : "left-0.5 bg-[var(--k-faint)]")} />
      </span>
      <span className="min-w-0">
        <span className="block text-[13.5px]">{label}</span>
        {hint && <span className="block text-[11.5px] text-[var(--k-faint)]">{hint}</span>}
      </span>
    </button>
  );
}

export function Segmented({ label, value, options, onChange, layoutId, size = "md" }) {
  return (
    <div>
      {label && <Caption label={label} />}
      <div className="inline-flex flex-wrap rounded-lg border border-[var(--k-line-2)] bg-black/25 p-0.5">
        {options.map(([k, l, title]) => (
          <button key={k} type="button" title={title} aria-pressed={value === k} onClick={() => onChange(k)} className={cn("relative rounded-md font-medium transition-colors", size === "sm" ? "px-2 py-0.5 text-[11.5px]" : "px-3 py-1 text-[12.5px]", value === k ? "text-[#1a1406]" : "text-[var(--k-mute)] hover:text-[var(--k-ink)]")}>
            {value === k && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-md bg-[var(--k-gold)]" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
            <span className="relative">{l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function Select({ path, label, value, onChange, options, placeholder = "— pilih —", hint }) {
  const id = useId();
  return (
    <div id={kid(path)} className="rounded-lg">
      <Caption label={label} htmlFor={id} />
      <select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "appearance-none bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8")} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5l3 3 3-3' fill='none' stroke='%23d9b23a' stroke-width='1.5'/%3E%3C/svg%3E\")" }}>
        <option value="">{placeholder}</option>
        {options.map(([k, l]) => (
          <option key={k} value={k} className="bg-[#111a2f]">{l}</option>
        ))}
      </select>
      {hint && <p className="mt-1 text-[11.5px] text-[var(--k-faint)]">{hint}</p>}
    </div>
  );
}

/** Daftar chip: Enter menambah, × menghapus, ← → menggeser posisi. */
export function Chips({ path, label, items = [], onChange, max = 8, placeholder = "Ketik lalu Enter", hint, flagIndex }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (!t || items.includes(t) || items.length >= max) return;
    onChange([...items, t]);
    setDraft("");
  };
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div id={kid(path)} className="rounded-lg">
      <Caption label={label} count={items.length} max={max} />
      <ul className="flex flex-wrap gap-1.5">
        {items.map((t, i) => (
          <motion.li
            layout
            key={t}
            id={kid(`${path}.${i}`)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn("group inline-flex items-center gap-1 rounded-md border py-1 pl-2.5 pr-1 text-[13px]", flagIndex?.has?.(i) ? "border-[var(--k-led-bad)]/60 bg-[var(--k-led-bad)]/10" : "border-[var(--k-line-2)] bg-white/[0.04]")}
          >
            <button type="button" onClick={() => move(i, -1)} aria-label={`Geser ${t} ke kiri`} className="hidden text-[var(--k-faint)] hover:text-[var(--k-gold)] group-hover:inline">‹</button>
            <span>{t}</span>
            <button type="button" onClick={() => move(i, 1)} aria-label={`Geser ${t} ke kanan`} className="hidden text-[var(--k-faint)] hover:text-[var(--k-gold)] group-hover:inline">›</button>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Hapus ${t}`} className="grid size-5 place-items-center rounded text-[var(--k-faint)] hover:bg-[var(--k-maroon)]/40 hover:text-white">×</button>
          </motion.li>
        ))}
      </ul>
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
          aria-label={`Tambah ${label}`}
          className={cn(inputCls, "mt-2 py-1.5 text-[13px]")}
        />
      )}
      {hint && <p className="mt-1 text-[11.5px] text-[var(--k-faint)]">{hint}</p>}
    </div>
  );
}

export function LinkPair({ path, label, value = {}, onChange, hrefKey = "href", hint }) {
  return (
    <div id={kid(path)} className="grid gap-2 rounded-lg sm:grid-cols-[1fr_1.2fr]">
      <Field path={`${path}.label`} label={`${label} · label`} value={value.label} max={60} onChange={(v) => onChange({ ...value, label: v })} />
      <Field path={`${path}.${hrefKey}`} label="Tautan" mono value={value[hrefKey]} max={200} placeholder="/halaman atau https://…" onChange={(v) => onChange({ ...value, [hrefKey]: v })} hint={hint} />
    </div>
  );
}

/* ───────────── Pustaka media (/api/upload) ───────────── */
const ACCEPT = { image: /\.(png|jpe?g|webp|gif|svg|avif)$/i, lottie: /\.json$/i };
const FOLDERS = { image: ["img", "img/award", "uploads/bidang", "uploads"], lottie: ["lottie", "uploads/bidang"] };

export function MediaField({ path, label, kind = "image", value, onChange, hint }) {
  const [open, setOpen] = useState(false);
  return (
    <div id={kid(path)} className="rounded-lg">
      <Caption label={label} />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Pilih ${label}`}
          data-lottie-hover
          className="group/m relative grid aspect-[4/3] w-28 shrink-0 place-items-center overflow-hidden rounded-lg border border-dashed border-[var(--k-line-2)] bg-black/30 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--k-gold)]"
        >
          {value && kind === "image" ? (
            <Image src={value} alt="" fill sizes="112px" className="object-cover" />
          ) : value && kind === "lottie" ? (
            <LottieIllustration src={value} className="size-16" replayOnHover />
          ) : (
            <span className="text-xl text-[var(--k-faint)]">+</span>
          )}
          <span className="absolute inset-x-0 bottom-0 translate-y-full bg-[var(--k-gold)] py-0.5 text-center text-[10.5px] font-semibold text-[#1a1406] transition-transform duration-300 group-hover/m:translate-y-0">Ganti</span>
        </button>
        <div className="min-w-0 flex-1">
          <span className="block truncate font-mono text-[11.5px] text-[var(--k-faint)]">{value || "belum dipilih"}</span>
          {value && (
            <button type="button" onClick={() => onChange("")} className="mt-1 text-[12px] text-[var(--k-mute)] underline-offset-2 hover:text-[var(--k-led-bad)] hover:underline">
              Kosongkan
            </button>
          )}
          {hint && <p className="mt-1 text-[11.5px] text-[var(--k-faint)]">{hint}</p>}
        </div>
      </div>
      <MediaLibrary open={open} onOpenChange={setOpen} kind={kind} current={value} onPick={onChange} />
    </div>
  );
}

function MediaLibrary({ open, onOpenChange, kind, current, onPick }) {
  const folders = FOLDERS[kind];
  const [folder, setFolder] = useState(folders[0]);
  const [files, setFiles] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const input = useRef(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setFiles(null);
    setErr(null);
    fetch(`/api/upload?folder=${encodeURIComponent(folder)}`)
      .then((r) => r.json())
      .then((j) => alive && setFiles((j.files ?? []).filter((f) => ACCEPT[kind].test(f.filename)).sort((a, b) => (b.modified ?? 0) - (a.modified ?? 0))))
      .catch(() => alive && setErr("Folder tidak bisa dibuka."));
    return () => {
      alive = false;
    };
  }, [open, folder, kind]);

  const upload = async (file) => {
    if (!file) return;
    if (!ACCEPT[kind].test(file.name)) return setErr(kind === "image" ? "Pilih berkas gambar." : "Pilih berkas Lottie (.json).");
    setBusy(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "uploads/bidang");
      const j = await fetch("/api/upload", { method: "POST", body: fd }).then((r) => r.json());
      if (!j.success) throw new Error(j.error);
      onPick(j.url);
      onOpenChange(false);
    } catch (e) {
      setErr(e.message || "Unggah gagal.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="konsol max-w-3xl border-[var(--k-line-2)] p-0 text-[var(--k-ink)]">
        <div className="px-6 pb-3 pt-7">
          <ModalTitle className="font-serif text-2xl text-[var(--k-ink)]">Rak media</ModalTitle>
          <ModalDescription className="mt-1 text-[var(--k-mute)]">Pilih {kind === "image" ? "foto" : "animasi Lottie"} atau unggah yang baru.</ModalDescription>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {folders.map((f) => (
              <button key={f} type="button" onClick={() => setFolder(f)} className={cn("rounded-md border px-2.5 py-1 font-mono text-[11.5px]", folder === f ? "border-[var(--k-gold)] text-[var(--k-gold)]" : "border-[var(--k-line-2)] text-[var(--k-mute)] hover:text-[var(--k-ink)]")}>
                /{f}
              </button>
            ))}
            <button type="button" onClick={() => input.current?.click()} disabled={busy} className="ml-auto inline-flex items-center gap-2 rounded-md bg-[var(--k-gold)] px-3 py-1.5 text-[12.5px] font-semibold text-[#1a1406] disabled:opacity-60">
              {busy && <Spinner className="size-3.5" />}
              Unggah
            </button>
            <input ref={input} type="file" hidden accept={kind === "image" ? "image/*" : "application/json,.json"} onChange={(e) => upload(e.target.files?.[0])} />
          </div>
          {err && <p className="mt-3 text-[12.5px] text-[var(--k-led-bad)]">{err}</p>}
        </div>
        <div className="k-scroll max-h-[55vh] overflow-y-auto px-6 pb-6">
          {files == null ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }, (_, i) => (
                <span key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          ) : files.length === 0 ? (
            <p className="py-10 text-center text-[13px] text-[var(--k-faint)]">Folder ini kosong.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {files.map((f) => (
                <li key={f.url}>
                  <button
                    type="button"
                    data-lottie-hover
                    onClick={() => {
                      onPick(f.url);
                      onOpenChange(false);
                    }}
                    className={cn("group relative block aspect-[4/3] w-full overflow-hidden rounded-lg border bg-black/30 transition-[border-color,transform] hover:-translate-y-0.5", current === f.url ? "border-[var(--k-gold)]" : "border-[var(--k-line)] hover:border-[var(--k-line-2)]")}
                  >
                    {kind === "image" ? <Image src={f.url} alt="" fill sizes="180px" className="object-cover" /> : <LottieIllustration src={f.url} className="mx-auto size-16" replayOnHover />}
                    <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-1.5 py-0.5 font-mono text-[10px] text-[var(--k-mute)]">{f.filename}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
