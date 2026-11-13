"use client";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { animate, createTimeline, stagger } from "animejs";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import { Modal, ModalContent, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { LogoDraw, Skeleton, Spinner } from "@/components/ui/loader";
import { LottieIllustration } from "@/components/media/lottie-illustration";
import { LordIcon } from "@/components/media/lord-icon";
import { SECTIONS, sectionOf } from "@/lib/home-cms/schema";
import { cn } from "@/lib/utils";
import { MovingBorder } from "./fx";

/* ───────────────────────── Toast Studio ───────────────────────── */

const ToastCtx = createContext(null);
const TONE = { ok: "bg-gold", info: "bg-gold-soft", warn: "bg-orange-400", error: "bg-red-400", live: "bg-emerald-400" };

/** Pil bawah-tengah dengan cincin hitung mundur + aksi opsional ("Urungkan"). */
export function StudioToaster({ children }) {
  const [items, setItems] = useState([]);
  const remove = useCallback((id) => setItems((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((title, { tone = "ok", detail, action, duration = 4200 } = {}) => {
    const id = Math.random().toString(36).slice(2);
    setItems((t) => [...t.slice(-2), { id, title, tone, detail, action, duration }]);
    return id;
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[210] flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <ToastPill key={t.id} toast={t} onDone={() => remove(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useStudioToast = () => useContext(ToastCtx) ?? (() => {});

function ToastPill({ toast, onDone }) {
  const ref = useRef(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    animate(ref.current, { translateY: [24, 0], scale: [0.92, 1], opacity: [0, 1], duration: 520, ease: "outElastic(1, .7)" });
  }, []);
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => {
      animate(ref.current, { translateY: 12, opacity: 0, duration: 220, ease: "inQuad", onComplete: onDone });
    }, toast.duration);
    return () => clearTimeout(t);
  }, [paused, toast.duration, onDone]);
  const C = 2 * Math.PI * 9;
  return (
    <div
      ref={ref}
      role="status"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className="pointer-events-auto flex max-w-md items-center gap-3 rounded-full border border-white/10 bg-ink/95 py-2 pl-2 pr-4 text-white opacity-0 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.8)] backdrop-blur-xl"
    >
      <span className="relative grid size-7 shrink-0 place-items-center">
        <svg viewBox="0 0 22 22" className="absolute inset-0 -rotate-90">
          <circle cx="11" cy="11" r="9" fill="none" stroke="rgb(255 255 255 / 0.12)" strokeWidth="2" />
          <circle
            cx="11"
            cy="11"
            r="9"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={C}
            style={{ animation: `studio-ring ${toast.duration}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
          />
        </svg>
        <span className={cn("size-2 rounded-full", TONE[toast.tone])} />
      </span>
      <span className="min-w-0 text-sm">
        <span className="font-medium">{toast.title}</span>
        {toast.detail && <span className="ml-1.5 text-white/55">{toast.detail}</span>}
      </span>
      {toast.action && (
        <button
          type="button"
          onClick={() => {
            toast.action.onClick();
            onDone();
          }}
          className="ml-1 shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gold-soft transition-colors hover:bg-gold hover:text-ink"
        >
          {toast.action.label}
        </button>
      )}
      <style>{`@keyframes studio-ring{from{stroke-dashoffset:0}to{stroke-dashoffset:${C}}}`}</style>
    </div>
  );
}

/* ───────────────────────── Loader ───────────────────────── */

/** Kisi cetak biru tersapu, logo tergambar, lalu kerangka tiga zona Studio. */
export function StudioLoader() {
  const ref = useLayoutRefAnim();
  return (
    <div ref={ref} className="relative grid min-h-screen place-items-center overflow-hidden bg-ink">
      <div aria-hidden className="absolute inset-0 grid grid-cols-12">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} data-col className="origin-top border-r border-white/[0.05]" />
        ))}
      </div>
      <div className="relative w-full max-w-5xl px-6">
        <div className="mx-auto mb-10 w-fit rounded-2xl bg-paper px-10 py-8 [--muted-foreground:rgb(26_6_7/0.55)]">
          <LogoDraw label="Studio Beranda" sub="Menyiapkan kanvas…" loop />
        </div>
        <div data-skel className="grid grid-cols-[180px_1fr_1.2fr] gap-4 opacity-0">
          <div className="space-y-2">
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton key={i} className="h-9 bg-white/[0.06]" />
            ))}
          </div>
          <div className="space-y-3 rounded-xl bg-white/[0.04] p-4">
            <Skeleton className="h-6 w-1/2 bg-white/[0.08]" />
            <Skeleton className="h-20 bg-white/[0.06]" />
            <Skeleton className="h-10 bg-white/[0.06]" />
            <Skeleton className="h-10 bg-white/[0.06]" />
          </div>
          <Skeleton className="h-64 bg-white/[0.05]" />
        </div>
      </div>
    </div>
  );
}

function useLayoutRefAnim() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el?.querySelector("[data-skel]")?.style.setProperty("opacity", "1");
      return;
    }
    const tl = createTimeline({ defaults: { ease: "outExpo" } });
    tl.add(el.querySelectorAll("[data-col]"), { scaleY: [0, 1], duration: 900, delay: stagger(45) }).add(el.querySelector("[data-skel]"), { opacity: [0, 1], translateY: [12, 0], duration: 600 }, "-=500");
    return () => tl.revert();
  }, []);
  return ref;
}

/* ───────────────────────── Banner ───────────────────────── */

/** Pita atas Studio: status draf vs live, koneksi realtime, atau konflik dengan admin lain. */
export function StudioBanner({ tone = "draft", children, action, onDismiss }) {
  const styles = {
    draft: "border-gold/30 bg-gold/[0.08] text-gold-soft",
    offline: "border-orange-400/30 bg-orange-400/10 text-orange-200",
    conflict: "border-red-400/30 bg-red-400/10 text-red-200",
  };
  return (
    <div role="status" className={cn("flex items-center gap-3 rounded-xl border px-4 py-2.5 text-[13px] animate-in fade-in-0 slide-in-from-top-2 duration-500", styles[tone])}>
      <span className="relative flex size-2 shrink-0">
        <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />
        <span className="relative size-2 rounded-full bg-current" />
      </span>
      <span className="min-w-0 flex-1">{children}</span>
      {action}
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Tutup" className="rounded p-1 opacity-60 transition-opacity hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  );
}

/* ───────────────────────── Modal Terbit ───────────────────────── */

const flat = (v, prefix = "") =>
  v && typeof v === "object" && !Array.isArray(v)
    ? Object.entries(v).flatMap(([k, x]) => flat(x, prefix ? `${prefix}.${k}` : k))
    : [[prefix, JSON.stringify(v ?? null)]];

/** Ringkasan perubahan satu section: field atas yang berbeda dari versi live. */
export function diffSection(key, value, live) {
  if (key === "layout") return JSON.stringify(value) === JSON.stringify(live) ? [] : [{ label: "Urutan & visibilitas section" }];
  const s = sectionOf(key);
  if (!s) return [];
  return s.fields
    .filter((f) => JSON.stringify(value?.[f.key] ?? null) !== JSON.stringify(live?.[f.key] ?? null))
    .map((f) => ({
      label: f.label,
      from: typeof live?.[f.key] === "string" ? live[f.key] : null,
      to: typeof value?.[f.key] === "string" ? value[f.key] : null,
      count: Array.isArray(value?.[f.key]) ? `${(live?.[f.key] ?? []).length} → ${value[f.key].length} item` : null,
      nested: !Array.isArray(value?.[f.key]) && typeof value?.[f.key] === "object" ? flat(value[f.key]).length : null,
    }));
}

export function PublishModal({ open, onOpenChange, sections, dirtyKeys, onPublish }) {
  const [picked, setPicked] = useState([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  useEffect(() => {
    if (open) {
      setPicked(dirtyKeys);
      setDone(null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const labelOf = (k) => (k === "layout" ? "Urutan section" : sectionOf(k)?.label ?? k);
  const toggle = (k) => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));

  const go = async () => {
    setBusy(true);
    try {
      const res = await onPublish(picked);
      setDone(res);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <ModalContent className="max-w-xl border-white/10 bg-ink p-0 text-white">
        {done ? (
          <div className="flex flex-col items-center px-8 pb-8 pt-10 text-center">
            <LottieIllustration src="/lottie/medal.json" className="w-32" />
            <ModalTitle className="mt-2 text-2xl text-white">Beranda sudah tayang</ModalTitle>
            <ModalDescription className="mt-2 max-w-sm text-white/60">
              {done.length ? `${done.map(labelOf).join(", ")} kini terlihat pengunjung. Halaman yang sedang dibuka ikut diperbarui.` : "Tidak ada perbedaan dengan versi live."}
            </ModalDescription>
            <button type="button" onClick={() => onOpenChange(false)} className="mt-7 rounded-full bg-white/10 px-5 py-2 text-sm font-semibold transition-colors hover:bg-white/15">
              Kembali menyunting
            </button>
          </div>
        ) : (
          <>
            <div className="border-b border-white/10 px-6 pb-4 pt-7">
              <ModalTitle className="text-2xl text-white">Terbitkan perubahan</ModalTitle>
              <ModalDescription className="mt-1 text-white/55">Pilih section yang siap dilihat pengunjung.</ModalDescription>
            </div>
            <ul className="max-h-[52vh] space-y-2 overflow-y-auto p-4">
              {dirtyKeys.map((k) => {
                const changes = diffSection(k, sections[k].value, sections[k].live);
                const on = picked.includes(k);
                return (
                  <li key={k}>
                    <label className={cn("block cursor-pointer rounded-xl border p-4 transition-colors", on ? "border-gold/50 bg-gold/[0.06]" : "border-white/10 hover:border-white/20")}>
                      <span className="flex items-center gap-3">
                        <input type="checkbox" checked={on} onChange={() => toggle(k)} className="size-4 accent-[var(--gold)]" />
                        <span className="font-serif text-lg">{labelOf(k)}</span>
                        <span className="ml-auto text-xs text-white/45">{changes.length} perubahan</span>
                      </span>
                      <ul className="mt-2 space-y-1 pl-7 text-[13px] text-white/60">
                        {changes.slice(0, 4).map((c) => (
                          <li key={c.label} className="truncate">
                            <span className="text-white/85">{c.label}</span>
                            {c.to != null && (
                              <>
                                {" "}
                                <span className="line-through decoration-red-400/60">{c.from || "—"}</span> <span className="text-gold-soft">→ {c.to || "—"}</span>
                              </>
                            )}
                            {c.count && <span className="text-white/45"> · {c.count}</span>}
                          </li>
                        ))}
                        {changes.length > 4 && <li className="text-white/40">+{changes.length - 4} lainnya</li>}
                      </ul>
                    </label>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
              <span className="text-xs text-white/45">{picked.length} dari {dirtyKeys.length} dipilih</span>
              <MovingBorder className="h-11" disabled={!picked.length || busy} onClick={go}>
                {busy ? <Spinner className="size-4" /> : <LordIcon name="check" size={18} trigger="loop" colors="primary:#ffffff,secondary:#e6d3a1" />}
                {busy ? "Menerbitkan…" : "Terbitkan sekarang"}
              </MovingBorder>
            </div>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

/* ───────────────────────── Konfirmasi buang draf ───────────────────────── */

export function DiscardModal({ open, onOpenChange, label, onConfirm }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <ModalContent className="max-w-md border-white/10 bg-ink text-white">
        <div className="flex items-start gap-4">
          <LottieIllustration src="/lottie/envelope-sent-dark.json" className="w-16 shrink-0" />
          <div>
            <ModalTitle className="text-xl text-white">Kembalikan “{label}” ke versi live?</ModalTitle>
            <ModalDescription className="mt-1.5 text-white/60">Draf section ini dihapus. Versi yang dilihat pengunjung tidak berubah.</ModalDescription>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={() => onOpenChange(false)} className="rounded-full px-4 py-2 text-sm text-white/70 hover:bg-white/10">
            Batal
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
                onOpenChange(false);
              } finally {
                setBusy(false);
              }
            }}
            className="inline-flex items-center gap-2 rounded-full bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
          >
            {busy && <Spinner className="size-4" />}
            Buang draf
          </button>
        </div>
      </ModalContent>
    </Modal>
  );
}

/* ───────────────────────── Pemilih media ───────────────────────── */

const FOLDERS = {
  image: ["uploads/home", "img", "img/award", "img/profil", "img/logo", "mascot", "uploads"],
  video: ["uploads/home", "video", "uploads"],
  lottie: ["lottie", "uploads/home"],
};
const ACCEPT = { image: /\.(png|jpe?g|webp|gif|svg|avif)$/i, video: /\.(mp4|webm|jpe?g|png|webp)$/i, lottie: /\.json$/i };
const KIND_LABEL = { image: "gambar", video: "video atau poster", lottie: "animasi Lottie" };

export function MediaPicker({ open, onOpenChange, kind = "image", current, onPick, uploadFolder = "uploads/home", folders: extraFolders, notify }) {
  const folders = extraFolders ?? FOLDERS[kind];
  const [folder, setFolder] = useState(folders[0]);
  const [files, setFiles] = useState(null);
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState(null);
  const studioToast = useStudioToast();
  const toast = notify ?? studioToast;

  useEffect(() => {
    if (open) setFolder(folders[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, kind]);

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
    if (!ACCEPT[kind].test(file.name)) return setErr(`Pilih berkas ${KIND_LABEL[kind]}.`);
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", uploadFolder);
      const j = await fetch("/api/upload", { method: "POST", body: fd }).then((r) => r.json());
      if (!j.success) throw new Error(j.error);
      toast("Berkas terunggah", { detail: j.filename });
      onPick(j.url);
      onOpenChange(false);
    } catch (e) {
      setErr(e.message || "Unggah gagal.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-3xl border-white/10 bg-ink p-0 text-white">
        <div className="px-6 pb-3 pt-7">
          <ModalTitle className="text-2xl text-white">Pustaka media</ModalTitle>
          <ModalDescription className="mt-1 text-white/55">Pilih {KIND_LABEL[kind]} atau unggah yang baru.</ModalDescription>
        </div>
        <div className="px-6">
          <Swiper modules={[FreeMode, A11y]} freeMode slidesPerView="auto" spaceBetween={8}>
            {folders.map((f) => (
              <SwiperSlide key={f} className="!w-auto">
                <button
                  type="button"
                  onClick={() => setFolder(f)}
                  className={cn("rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors", folder === f ? "border-gold bg-gold text-ink" : "border-white/15 text-white/70 hover:border-white/35")}
                >
                  /{f}
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="grid max-h-[50vh] grid-cols-3 gap-3 overflow-y-auto p-6 sm:grid-cols-4">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              upload(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "lord-up flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-center text-xs transition-colors",
              drag ? "border-gold bg-gold/10 text-gold-soft" : "border-white/20 text-white/55 hover:border-gold/60 hover:text-white"
            )}
          >
            {uploading ? <Spinner className="size-6" /> : <LordIcon name="plus-circle" size={34} trigger="hover" target=".lord-up" colors="primary:#e6d3a1,secondary:#c9a227" />}
            <span>{uploading ? "Mengunggah…" : "Tarik berkas ke sini atau klik"}</span>
            <input type="file" className="sr-only" onChange={(e) => upload(e.target.files?.[0])} />
          </label>
          {files === null && Array.from({ length: 7 }, (_, i) => <Skeleton key={i} className="aspect-square bg-white/[0.06]" />)}
          {files?.map((f) => (
            <button
              key={f.url}
              type="button"
              onClick={() => {
                onPick(f.url);
                onOpenChange(false);
              }}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-xl border bg-white/[0.04] text-left transition-[border-color,transform] duration-300 hover:-translate-y-0.5",
                current === f.url ? "border-gold ring-2 ring-gold/40" : "border-white/10 hover:border-white/30"
              )}
            >
              <MediaThumb url={f.url} kind={kind} />
              <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-ink/90 to-transparent px-2 pb-1.5 pt-5 text-[11px] text-white/80">{f.filename}</span>
            </button>
          ))}
          {files?.length === 0 && (
            <div className="col-span-2 flex flex-col items-center justify-center text-center text-sm text-white/45 sm:col-span-3">
              <LottieIllustration src="/lottie/empty-news.json" className="w-24" />
              Folder ini belum berisi {KIND_LABEL[kind]}.
            </div>
          )}
        </div>
        {err && <p className="px-6 pb-5 text-sm text-red-300">{err}</p>}
      </ModalContent>
    </Modal>
  );
}

export function MediaThumb({ url, kind, className }) {
  if (!url) return null;
  if (/\.json$/i.test(url)) return <LottieIllustration src={url} className={cn("h-full w-full p-3", className)} />;
  if (/\.(mp4|webm)$/i.test(url)) return <video src={url} muted playsInline preload="metadata" className={cn("h-full w-full object-cover", className)} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" loading="lazy" className={cn("h-full w-full", kind === "image" && /logo|\.svg$/i.test(url) ? "object-contain p-4" : "object-cover", className)} />;
}

/* ───────────────────────── Command bar ───────────────────────── */

export function CommandBar({ open, onOpenChange, onJump }) {
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const entries = useMemo(
    () => SECTIONS.flatMap((s) => [{ section: s.key, label: s.label, path: "Section" }, ...s.fields.map((f) => ({ section: s.key, field: f.key, group: f.group, label: f.label, path: s.label }))]),
    []
  );
  const shown = entries.filter((e) => `${e.path} ${e.label}`.toLowerCase().includes(q.toLowerCase())).slice(0, 40);
  useEffect(() => setI(0), [q]);
  const pick = (e) => {
    onJump(e);
    onOpenChange(false);
    setQ("");
  };
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent hideClose className="top-[16%] max-w-xl translate-y-0 border-white/10 bg-ink p-0 text-white">
        <ModalTitle className="sr-only">Lompat ke section atau isian</ModalTitle>
        <ModalDescription className="sr-only">Ketik nama section atau isian</ModalDescription>
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") (e.preventDefault(), setI((x) => Math.min(x + 1, shown.length - 1)));
            if (e.key === "ArrowUp") (e.preventDefault(), setI((x) => Math.max(x - 1, 0)));
            if (e.key === "Enter" && shown[i]) pick(shown[i]);
          }}
          placeholder="Lompat ke… mis. tombol PMB, alamat, testimoni"
          className="h-14 w-full border-b border-white/10 bg-transparent px-5 text-[15px] outline-none placeholder:text-white/35"
        />
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {shown.map((e, k) => (
            <li key={e.section + (e.field ?? "")}>
              <button
                type="button"
                onMouseEnter={() => setI(k)}
                onClick={() => pick(e)}
                className={cn("flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm", k === i ? "bg-white/10" : "")}
              >
                <span className={e.field ? "text-white/85" : "font-serif text-base text-gold-soft"}>{e.label}</span>
                <span className="text-xs text-white/40">{e.path}</span>
              </button>
            </li>
          ))}
          {!shown.length && <li className="px-3 py-6 text-center text-sm text-white/45">Tidak ada yang cocok.</li>}
        </ul>
      </ModalContent>
    </Modal>
  );
}
