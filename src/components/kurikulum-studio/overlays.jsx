"use client";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { animate, stagger, svg } from "animejs";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { CHAPTERS, changedChapters } from "@/lib/kurikulum-cms/schema";
import { Modal, ModalContent, ModalDescription, ModalTitle } from "@/components/ui/modal";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

/* ───────────────────────── Toast "karcis" ─────────────────────────
 * Karcis tercetak dari celah di atas layar (clip-path), punya sobekan berlubang di kiri.
 * Saat selesai, potongan karcis "disobek": badan miring & jatuh, sobekan tinggal sesaat. */

const KarcisCtx = createContext(null);
const TONE = {
  ok: { stub: "bg-navy text-gold-soft", mark: "✓", label: "Tersimpan" },
  info: { stub: "bg-cream-2 text-navy", mark: "i", label: "Info" },
  warn: { stub: "bg-gold text-navy", mark: "!", label: "Perhatian" },
  error: { stub: "bg-maroon text-white", mark: "×", label: "Gagal" },
};

export function KarcisToaster({ children }) {
  const [items, setItems] = useState([]);
  const remove = useCallback((id) => setItems((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((title, { tone = "ok", detail, action, duration = 4200 } = {}) => {
    const id = Math.random().toString(36).slice(2);
    setItems((t) => [...t.slice(-2), { id, title, tone, detail, action, duration, at: new Date() }]);
    return id;
  }, []);
  return (
    <KarcisCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[220] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {items.map((t) => (
          <Karcis key={t.id} toast={t} onDone={() => remove(t.id)} />
        ))}
      </div>
    </KarcisCtx.Provider>
  );
}

export const useKarcis = () => useContext(KarcisCtx) ?? (() => {});

function Karcis({ toast, onDone }) {
  const ref = useRef(null);
  const body = useRef(null);
  const leaving = useRef(false);
  const tone = TONE[toast.tone] ?? TONE.ok;

  const tear = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    if (prefersReducedMotion() || !ref.current) return onDone();
    gsap
      .timeline({ onComplete: onDone })
      .to(body.current, { rotate: 7, y: 26, x: 18, opacity: 0, duration: 0.45, ease: "power2.in", transformOrigin: "0% 0%" })
      .to(ref.current, { opacity: 0, y: -8, duration: 0.25 }, "-=0.1");
  }, [onDone]);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const tw = gsap.fromTo(ref.current, { clipPath: "inset(0 0 100% 0)", y: -6 }, { clipPath: "inset(0 0 0% 0)", y: 0, duration: 0.55, ease: "expo.out" });
    return () => tw.kill();
  }, []);

  useEffect(() => {
    const t = setTimeout(tear, toast.duration);
    return () => clearTimeout(t);
  }, [tear, toast.duration]);

  const time = toast.at.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return (
    <div ref={ref} role="status" className="pointer-events-auto flex w-full max-w-md drop-shadow-[0_18px_30px_rgb(14_24_48/0.28)]">
      <div className={cn("karcis-stub relative flex w-16 shrink-0 flex-col items-center justify-center rounded-l-lg py-3", tone.stub)}>
        <span className="font-serif text-xl leading-none">{tone.mark}</span>
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] opacity-80">{time}</span>
      </div>
      <div ref={body} className="karcis-body relative flex min-w-0 flex-1 items-center gap-3 rounded-r-lg bg-white py-3 pl-4 pr-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text/45">{tone.label}</p>
          <p className="truncate text-[14px] font-semibold text-navy">{toast.title}</p>
          {toast.detail && <p className="mt-0.5 line-clamp-2 text-[12.5px] text-text/60">{toast.detail}</p>}
        </div>
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action.onClick();
              tear();
            }}
            className="shrink-0 rounded-md border border-navy/15 px-2.5 py-1 text-[12.5px] font-semibold text-maroon transition-colors hover:border-maroon"
          >
            {toast.action.label}
          </button>
        )}
        <button type="button" onClick={tear} aria-label="Tutup notifikasi" className="grid size-7 shrink-0 place-items-center rounded-full text-text/40 transition hover:bg-cream hover:text-navy">
          ×
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── Loader rel ───────────────────────── */

export function RailLoader({ label = "Menyusun peta kurikulum…", error, onRetry }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || prefersReducedMotion() || error) return;
    const [line] = svg.createDrawable(ref.current.querySelector("[data-line]"));
    const a = animate(line, { draw: ["0 0", "0 1"], duration: 1600, ease: "inOutQuad", loop: true, alternate: true });
    const b = animate(ref.current.querySelectorAll("[data-stop]"), { scale: [0.4, 1], opacity: [0.2, 1], delay: stagger(180), duration: 600, loop: true, alternate: true, ease: "outBack" });
    return () => {
      a.revert();
      b.revert();
    };
  }, [error]);
  return (
    <div className="kartografer grid min-h-dvh place-items-center bg-paper px-6">
      <div ref={ref} className="w-full max-w-md text-center">
        <svg viewBox="0 0 320 60" className="w-full" aria-hidden>
          <path d="M10 40 C 80 40, 90 14, 160 20 S 250 46, 310 24" fill="none" stroke="var(--line)" strokeWidth="6" strokeLinecap="round" />
          <path data-line d="M10 40 C 80 40, 90 14, 160 20 S 250 46, 310 24" fill="none" stroke="var(--maroon)" strokeWidth="6" strokeLinecap="round" />
          {[[10, 40], [92, 22], [160, 20], [236, 38], [310, 24]].map(([x, y], i) => (
            <circle key={i} data-stop cx={x} cy={y} r="7" fill="white" stroke="var(--navy)" strokeWidth="3" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
          ))}
        </svg>
        <p className="mt-6 font-serif text-2xl text-navy">{error ? "Peta belum bisa dibuka" : "Kartografer Kurikulum"}</p>
        <p className="mt-1.5 text-[14px] text-text/60">{error ?? label}</p>
        {error && (
          <button type="button" onClick={onRetry} className="mt-5 rounded-md bg-maroon px-4 py-2 text-[14px] font-semibold text-white">
            Coba lagi
          </button>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Banner sinyal ───────────────────────── */

const LIGHT = { danger: "bg-danger", warning: "bg-gold", info: "bg-navy", ok: "bg-success" };
export function SignalBanner({ tone = "info", title, children, action, onDismiss, className }) {
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("relative flex items-start gap-3 overflow-hidden rounded-xl border border-navy/10 bg-white px-4 py-3", className)}>
      <span aria-hidden className="mt-0.5 flex h-9 w-4 shrink-0 flex-col items-center justify-between rounded-full bg-navy-deep py-1">
        {["danger", "warning", "ok"].map((k) => (
          <span key={k} className={cn("size-2 rounded-full transition-opacity", LIGHT[k], (tone === k || (tone === "info" && k === "ok")) ? "signal-on opacity-100" : "opacity-20")} />
        ))}
      </span>
      <div className="min-w-0 flex-1">
        {title && <p className="text-[13.5px] font-semibold text-navy">{title}</p>}
        {children && <div className="mt-0.5 text-[13px] leading-relaxed text-text/65">{children}</div>}
      </div>
      {action}
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Tutup banner" className="grid size-7 shrink-0 place-items-center rounded-full text-text/40 hover:bg-cream hover:text-navy">
          ×
        </button>
      )}
    </div>
  );
}

/* ───────────────────────── Modal terbit: papan keberangkatan ───────────────────────── */

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
function leaves(v, path = "", out = {}) {
  if (isObj(v) || Array.isArray(v)) Object.entries(v).forEach(([k, x]) => leaves(x, path ? `${path}.${k}` : k, out));
  else out[path] = v;
  return out;
}
const ROOT = { curtain: "pembuka", hero: "pembuka" };

/** Jumlah field yang berubah per stasiun. */
export function changeCounts(value, live) {
  const a = leaves(live ?? {});
  const b = leaves(value ?? {});
  const counts = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (JSON.stringify(a[k] ?? null) === JSON.stringify(b[k] ?? null)) continue;
    const root = k.split(".")[0];
    const ch = ROOT[root] ?? root;
    counts[ch] = (counts[ch] ?? 0) + 1;
  }
  return counts;
}

export function PublishModal({ open, onOpenChange, value, live, onPublish, firstPublish }) {
  const [state, setState] = useState("idle"); // idle | busy | done
  const board = useRef(null);
  const counts = useMemo(() => (open ? changeCounts(value, live) : {}), [open, value, live]);
  const diff = open ? changedChapters(value, live) : [];
  // terbit pertama hasil migrasi: semua stasiun berangkat walau isinya sama dengan versi bawaan
  const changed = firstPublish && !diff.length ? CHAPTERS.map((c) => c.key) : diff;

  useEffect(() => {
    if (open) setState("idle");
  }, [open]);

  useEffect(() => {
    if (!open || !board.current || prefersReducedMotion()) return;
    const rows = board.current.querySelectorAll("[data-flap]");
    const a = animate(rows, { rotateX: [-90, 0], opacity: [0, 1], delay: stagger(60), duration: 520, ease: "outExpo" });
    return () => a.revert();
  }, [open, changed.length]);

  const go = async () => {
    setState("busy");
    try {
      await onPublish();
      setState("done");
      setTimeout(() => onOpenChange(false), 1300);
    } catch {
      setState("idle");
    }
  };

  return (
    <Modal open={open} onOpenChange={(o) => state !== "busy" && onOpenChange(o)}>
      <ModalContent className="max-w-xl overflow-hidden border-0 bg-navy-deep p-0 text-white">
        <div className="px-6 pb-4 pt-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Papan keberangkatan</p>
          <ModalTitle className="mt-1 font-serif text-[1.7rem] font-normal text-white">Terbitkan ke halaman publik</ModalTitle>
          <ModalDescription className="mt-1 text-[13.5px] text-white/60">
            {changed.length ? `${changed.length} stasiun berubah. Kurikulum, Konversi SKS, Bidang Keahlian, Jalur Kelulusan, Regulasi, dan Magang ikut diperbarui.` : "Belum ada perubahan dari versi yang tayang."}
          </ModalDescription>
        </div>
        <div ref={board} className="max-h-[46vh] space-y-1 overflow-y-auto px-6 pb-2 [perspective:600px]">
          {CHAPTERS.filter((c) => changed.includes(c.key)).map((c, i) => (
            <div key={c.key} data-flap className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-md bg-white/[0.06] px-3 py-2.5 font-mono text-[13px]">
              <span className="tabular-nums text-gold">{String(i + 1).padStart(2, "0")}</span>
              <span className="truncate uppercase tracking-wide">{c.label}</span>
              <span className="rounded bg-gold/15 px-2 py-0.5 text-[11.5px] tabular-nums text-gold-soft">{counts[c.key] ?? 1} ubahan</span>
            </div>
          ))}
        </div>
        <div className="relative mt-3 flex items-center justify-between gap-3 border-t border-white/10 px-6 py-4">
          <button type="button" onClick={() => onOpenChange(false)} disabled={state === "busy"} className="text-[13.5px] text-white/60 hover:text-white">
            Nanti dulu
          </button>
          <button
            type="button"
            onClick={go}
            disabled={!changed.length || state !== "idle"}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-gold px-5 text-[14px] font-semibold text-navy-deep transition-[transform,background-color] hover:bg-gold-soft active:scale-[0.98] disabled:opacity-40"
          >
            {state === "busy" && <Spinner className="size-4" />}
            {state === "done" ? "Sudah berangkat" : "Berangkatkan"}
          </button>
          {state === "done" && (
            <span aria-hidden className="publish-stamp pointer-events-none absolute -top-16 right-10 grid size-24 rotate-[-14deg] place-items-center rounded-full border-[3px] border-gold font-serif text-[13px] uppercase tracking-[0.18em] text-gold">
              Terbit
            </span>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}

/* ───────────────────────── Riwayat ───────────────────────── */

const when = (iso) => (iso ? new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "—");

export function HistoryModal({ open, onOpenChange, doc, onRestore }) {
  const [busy, setBusy] = useState(null);
  const list = doc?.history ?? [];
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-lg">
        <ModalTitle className="font-serif text-2xl font-normal text-navy">Jejak perjalanan</ModalTitle>
        <ModalDescription>Versi yang pernah terbit. Memulihkan menyalin versi itu ke draf; pengunjung belum melihatnya sampai diterbitkan lagi.</ModalDescription>
        <ol className="relative mt-5 border-l-2 border-line pl-6">
          <li className="relative pb-5">
            <span aria-hidden className="absolute -left-[33px] top-1 size-4 rounded-full border-[3px] border-maroon bg-white" />
            <p className="text-[13.5px] font-semibold text-navy">Sedang tayang</p>
            <p className="text-[12.5px] text-text/55">
              {when(doc?.publishedAt)} · {doc?.publishedBy ?? "bawaan"}
            </p>
          </li>
          {list.map((h) => (
            <li key={h.index} className="relative pb-5 last:pb-0">
              <span aria-hidden className="absolute -left-[31px] top-1.5 size-3 rounded-full bg-navy/30" />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13.5px] text-navy">{when(h.publishedAt)}</p>
                  <p className="text-[12.5px] text-text/55">{h.publishedBy ?? "Admin"}</p>
                </div>
                <button
                  type="button"
                  disabled={busy != null}
                  onClick={async () => {
                    setBusy(h.index);
                    try {
                      await onRestore(h.index);
                      onOpenChange(false);
                    } finally {
                      setBusy(null);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-md border border-navy/15 px-3 py-1.5 text-[12.5px] font-semibold text-maroon hover:border-maroon disabled:opacity-40"
                >
                  {busy === h.index && <Spinner className="size-3.5" />}
                  Pulihkan ke draf
                </button>
              </div>
            </li>
          ))}
          {!list.length && <li className="text-[13px] text-text/50">Belum ada versi lama.</li>}
        </ol>
      </ModalContent>
    </Modal>
  );
}

/* ───────────────────────── Pratinjau ───────────────────────── */

const DEVICES = [
  ["desktop", "Desktop", "100%"],
  ["tablet", "Tablet", "820px"],
  ["phone", "Ponsel", "390px"],
];

export function PreviewSheet({ open, onOpenChange, refreshKey, anchor }) {
  const frame = useRef(null);
  const [device, setDevice] = useState("desktop");
  const [loading, setLoading] = useState(true);
  const post = (msg) => frame.current?.contentWindow?.postMessage({ source: "kartografer", ...msg }, window.location.origin);
  useEffect(() => {
    if (open) post({ type: "refresh" });
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open && anchor) post({ type: "scroll", anchor });
  }, [anchor, open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open) setLoading(true);
  }, [open]);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[min(100vw,1040px)] border-l-0 bg-navy-deep p-0 sm:max-w-none">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-3 pr-16">
          <SheetTitle className="font-serif text-lg font-normal text-white">Uji jalan</SheetTitle>
          <SheetDescription className="hidden text-white/50 sm:block">Halaman Kurikulum dengan isi draf</SheetDescription>
          <div className="ml-auto flex rounded-full bg-white/10 p-1">
            {DEVICES.map(([k, label]) => (
              <button key={k} type="button" onClick={() => setDevice(k)} className={cn("rounded-full px-3 py-1 text-[12.5px] transition-colors", device === k ? "bg-gold text-navy-deep" : "text-white/70 hover:text-white")}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="relative flex-1 overflow-hidden p-3">
          {loading && (
            <div className="absolute inset-0 z-10 grid place-items-center">
              <div className="flex items-center gap-3 text-white/70">
                <Spinner className="size-5" /> Menyiapkan rangkaian…
              </div>
            </div>
          )}
          {open && (
            <iframe
              ref={frame}
              title="Pratinjau kurikulum"
              src="/api/kurikulum-cms/preview"
              onLoad={() => setLoading(false)}
              className="mx-auto h-full rounded-lg bg-white shadow-2xl transition-[width] duration-500"
              style={{ width: DEVICES.find((d) => d[0] === device)[2] }}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
