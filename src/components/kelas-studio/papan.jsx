"use client";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useConnection } from "@/lib/realtime/client";
import { SECTIONS, changedSections, keysOf } from "@/lib/program-kelas-cms/schema";
import { findRedundancy } from "@/lib/program-kelas-cms/lint";
import { ConfirmModal } from "@/components/ui/modal";
import { LordIcon } from "@/components/media/lord-icon";
import { cn } from "@/lib/utils";
import { usePapan } from "./use-papan";
import { MagnetToaster, useMagnetToast } from "./magnet-toast";
import { BoardLoader, Failure, MagnetStrip, PreviewDock, SaveClock } from "./chrome";
import { jumpToField } from "./fields";
import { BellModal, HistoryModal } from "./modals";
import { ClassesEditor } from "./editors/classes";
import { ScheduleEditor } from "./editors/schedule";
import { CompareEditor } from "./editors/compare";
import { QuizEditor } from "./editors/quiz";
import { BannerEditor, ClosingEditor, FaqEditor, HeroEditor, LinksEditor, MetaEditor } from "./editors/simple";

const EDITORS = {
  hero: HeroEditor,
  banner: BannerEditor,
  classes: ClassesEditor,
  schedule: ScheduleEditor,
  compare: CompareEditor,
  quiz: QuizEditor,
  faq: FaqEditor,
  closing: ClosingEditor,
  links: LinksEditor,
  meta: MetaEditor,
};
const FOCUS_KEY = "papan:focus";
const PREVIEW_KEY = "papan:preview";
/** Jam "pelajaran" tiap baris rel — rel dibaca seperti jadwal hari ini. */
const PERIOD = (i) => `${String(7 + i).padStart(2, "0")}.00`;

/** Kelengkapan per bagian: porsi teks terisi (tautan, kunci, & media tidak dihitung). */
function completeness(v) {
  const out = {};
  const walk = (x, path, acc) => {
    if (typeof x === "string") {
      // sel Ya/Tidak memang tanpa teks; hanya sel bertipe teks yang dihitung
      if (/(href|key|lottie|cls|version|pmb|contact|kind)$/.test(path) || /values\.\d+\.text$/.test(path)) return;
      acc.t++;
      if (x.trim()) acc.f++;
    } else if (x && typeof x === "object") for (const [k, y] of Object.entries(x)) walk(y, `${path}.${k}`, acc);
  };
  for (const s of SECTIONS) {
    const acc = { t: 0, f: 0 };
    for (const k of keysOf(s.key)) walk(v?.[k], k, acc);
    out[s.key] = acc.t ? acc.f / acc.t : 1;
  }
  return out;
}

/** Jalur isian → kunci bagian rel. */
const sectionOf = (p) => {
  const top = p.split(".")[0];
  return SECTIONS.find((s) => keysOf(s.key).includes(top))?.key ?? top;
};

/**
 * Papan Jadwal — CMS halaman Program Kelas.
 * Papan tulis magnetik: rel kiri dibaca seperti jadwal pelajaran (tiap bagian halaman = satu jam pelajaran),
 * panggung tengah berisi lembar isian khas tiap bagian, pratinjau draf ditambatkan di kanan.
 */
export function PapanJadwal() {
  return (
    <MagnetToaster>
      <Board />
    </MagnetToaster>
  );
}

function Board() {
  const toast = useMagnetToast();
  const [conflict, setConflict] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const k = usePapan({
    onSaved: () => setRefreshKey((n) => n + 1),
    onRemote: (e) => {
      if (e.type === "conflict") setConflict(e.by);
      if (e.type === "draft") toast(`${e.by} mengubah draf`, { tone: "info", detail: "Papan diperbarui." });
      if (e.type === "published") toast(`${e.by} menerbitkan program kelas`, { tone: "live" });
    },
  });
  const connection = useConnection();
  const [focus, setFocus] = useState("hero");
  const [preview, setPreview] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [lintHidden, setLintHidden] = useState(false);
  const stage = useRef(null);

  const v = k.value;
  const deferred = useDeferredValue(v);
  const redundancy = useMemo(() => (deferred ? findRedundancy(deferred) : []), [deferred]);
  const flagged = useMemo(() => new Set(redundancy.flatMap((r) => [r.a.path, r.b.path])), [redundancy]);
  const flagsBy = useMemo(() => {
    const o = {};
    for (const p of flagged) o[sectionOf(p)] = (o[sectionOf(p)] ?? 0) + 1;
    return o;
  }, [flagged]);
  const changed = useMemo(() => (v && k.doc ? changedSections(v, k.doc.live) : []), [v, k.doc]);
  const complete = useMemo(() => completeness(deferred), [deferred]);
  const index = SECTIONS.findIndex((s) => s.key === focus);
  const meta = SECTIONS[index];

  useEffect(() => {
    try {
      const s = sessionStorage.getItem(FOCUS_KEY);
      if (s && EDITORS[s]) setFocus(s);
      if (localStorage.getItem(PREVIEW_KEY) === "1") setPreview(true);
    } catch {}
  }, []);
  const open = (key) => {
    setFocus(key);
    try {
      sessionStorage.setItem(FOCUS_KEY, key);
    } catch {}
    stage.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const togglePreview = () =>
    setPreview((p) => {
      try {
        localStorage.setItem(PREVIEW_KEY, p ? "0" : "1");
      } catch {}
      return !p;
    });

  // pintasan keyboard
  const keys = useRef({});
  keys.current = { k, toast, open, togglePreview, setPublishOpen, busy: !!confirm || publishOpen || historyOpen || discardOpen };
  useEffect(() => {
    const onKey = (e) => {
      const c = keys.current;
      if (c.busy) return;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? "") || document.activeElement?.isContentEditable;
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (mod && key === "s") {
        e.preventDefault();
        c.k.flush().then(
          () => c.toast("Draf disimpan", { detail: "Belum tayang sampai diterbitkan." }),
          () => c.toast("Gagal menyimpan", { tone: "error" })
        );
      } else if (mod && key === "enter") {
        e.preventDefault();
        c.setPublishOpen(true);
      } else if (mod && (key === "z" || key === "y") && !typing) {
        e.preventDefault();
        if (key === "y" || e.shiftKey) c.k.redo();
        else if (c.k.undo()) c.toast("Langkah diurungkan", { tone: "info", duration: 2200 });
      } else if (!typing && !mod && /^[0-9]$/.test(e.key)) {
        const s = SECTIONS[e.key === "0" ? 9 : Number(e.key) - 1];
        if (s) c.open(s.key);
      } else if (!typing && !mod && key === "p") {
        c.togglePreview();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (k.status !== "typing" && k.status !== "saving") return;
    const fn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [k.status]);

  useEffect(() => {
    if (k.status === "error") toast("Draf gagal disimpan", { tone: "error", detail: "Periksa koneksi lalu tekan Ctrl+S.", action: { label: "Coba lagi", onClick: () => k.flush().catch(() => {}) } });
  }, [k.status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setLintHidden(false), [redundancy.length]);

  if (k.error && !v) return <Failure message={k.error} onRetry={k.load} />;
  if (!v) return <BoardLoader />;

  const jump = (p) => {
    const target = sectionOf(p);
    if (target !== focus) {
      open(target);
      setTimeout(() => jumpToField(p), 500);
    } else jumpToField(p);
  };

  const publish = async () => {
    try {
      const ok = await k.publish();
      toast(ok ? "Program kelas diterbitkan" : "Tidak ada perubahan", { tone: ok ? "live" : "info", detail: ok ? "Pengunjung langsung melihat versi baru." : undefined });
    } catch (e) {
      toast("Gagal menerbitkan", { tone: "error", detail: e.message });
      throw e;
    }
  };

  const ask = (opts) => setConfirm(opts);
  const Editor = EDITORS[focus];
  const keyOf = keysOf(focus)[0];
  const focusFlags = redundancy.filter((r) => sectionOf(r.a.path) === focus || sectionOf(r.b.path) === focus);

  return (
    <div className="papan-room min-h-screen pb-20">
      {/* bilah atas */}
      <header className="sticky top-0 z-40 border-b border-navy/10 bg-[#f6f1e4]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6">
          <Link href="/admin/dashboard" className="group inline-flex items-center gap-1.5 text-[13px] text-text/55 transition-colors hover:text-navy">
            <span className="transition-transform group-hover:-translate-x-0.5">←</span> Panel admin
          </Link>
          <span aria-hidden className="h-4 w-px bg-navy/15" />
          <p className="font-serif text-[1.05rem] text-navy">
            Papan <em className="text-maroon">Jadwal</em>
          </p>
          <a href="/program-kelas" target="_blank" rel="noopener noreferrer" className="hidden text-[12.5px] text-text/50 underline decoration-gold/60 underline-offset-4 hover:text-navy sm:inline">
            Buka halaman ↗
          </a>
          <div className="ml-auto flex flex-wrap items-center gap-1.5">
            <SaveClock status={k.status} />
            <span className={cn("mx-1 size-1.5 rounded-full", connection === "connected" ? "bg-emerald-500" : "bg-text/25")} title={connection === "connected" ? "Realtime tersambung" : "Realtime belum tersambung"} />
            <button type="button" disabled={!k.canUndo} onClick={() => k.undo()} className="rounded-md px-2.5 py-1.5 text-[12px] text-text/60 transition-colors hover:bg-navy/5 hover:text-navy disabled:opacity-30">
              Urungkan
            </button>
            <button
              type="button"
              onClick={togglePreview}
              aria-pressed={preview}
              className={cn("lord-prev inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-semibold transition-colors", preview ? "border-navy bg-navy text-white" : "border-navy/15 bg-white text-navy hover:border-navy/40")}
            >
              <LordIcon name="globe" size={16} trigger="hover" target=".lord-prev" colors={preview ? "primary:#ffffff,secondary:#e6d3a1" : "primary:#14213d,secondary:#6e1423"} />
              Pratinjau
            </button>
            <button type="button" onClick={() => setHistoryOpen(true)} className="rounded-md border border-navy/15 bg-white px-3 py-1.5 text-[12px] font-semibold text-navy transition-colors hover:border-navy/40">
              Arsip
            </button>
            {k.dirty && (
              <button type="button" onClick={() => setDiscardOpen(true)} className="rounded-md px-3 py-1.5 text-[12px] font-semibold text-maroon transition-colors hover:bg-maroon/10">
                Buang
              </button>
            )}
            <motion.button
              type="button"
              onClick={() => setPublishOpen(true)}
              whileTap={{ scale: 0.95 }}
              className={cn("relative inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-[12.5px] font-semibold transition-colors", k.dirty ? "bg-maroon text-white hover:bg-maroon-deep" : "bg-navy/10 text-navy/50 hover:bg-navy/15")}
            >
              Terbitkan
              {k.dirty && changed.length > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-gold px-1 text-[10.5px] tabular-nums text-navy">{changed.length}</span>}
            </motion.button>
          </div>
        </div>
      </header>

      <div className={cn("mx-auto grid max-w-[1500px] gap-6 px-4 pt-6 sm:px-6", "lg:grid-cols-[230px_minmax(0,1fr)]", preview && "xl:grid-cols-[230px_minmax(0,1fr)_minmax(380px,36%)]")}>
        {/* rel jadwal */}
        <nav aria-label="Bagian halaman" className="lg:sticky lg:top-20 lg:self-start">
          <p className="mb-2 hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-text/45 lg:block">Jadwal hari ini</p>
          <ol className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 lg:pb-0">
            {SECTIONS.map((s, i) => {
              const on = s.key === focus;
              const pct = complete[s.key] ?? 1;
              return (
                <li key={s.key} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => open(s.key)}
                    aria-current={on ? "step" : undefined}
                    className={cn("group relative flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors", on ? "text-white" : "text-navy hover:bg-white/70")}
                  >
                    {on && <motion.span layoutId="rail-on" className="absolute inset-0 rounded-md bg-navy shadow-[0_10px_18px_-12px_rgb(20_33_61/0.8)]" transition={{ type: "spring", stiffness: 480, damping: 38 }} />}
                    <span className={cn("relative w-9 text-[11px] tabular-nums", on ? "text-gold-soft" : "text-text/40")}>{PERIOD(i)}</span>
                    <span className="relative min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold">{s.label}</span>
                      <span className={cn("mt-1 block h-[3px] overflow-hidden rounded-full", on ? "bg-white/15" : "bg-navy/[0.07]")}>
                        <motion.span className={cn("block h-full rounded-full", pct >= 1 ? "bg-emerald-500" : "bg-gold")} initial={false} animate={{ width: `${Math.round(pct * 100)}%` }} />
                      </span>
                    </span>
                    <span className="relative flex gap-1">
                      {changed.includes(s.key) && <span title="Berubah" className="size-2 rounded-full bg-gold shadow-[0_0_0_2px_rgb(201_162_39/0.25)]" />}
                      {flagsBy[s.key] > 0 && <span title="Kalimat kembar" className="size-2 rounded-full bg-orange-500" />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 hidden text-[11.5px] leading-relaxed text-text/40 lg:block">1–0 lompat · P pratinjau · Ctrl+S simpan · Ctrl+Enter terbit · Ctrl+Z urungkan</p>
        </nav>

        {/* panggung */}
        <main ref={stage} className="min-w-0 scroll-mt-20">
          <div className="space-y-2">
            {conflict && (
              <MagnetStrip
                tone="conflict"
                action={
                  <button type="button" onClick={() => (setConflict(null), k.load())} className="rounded bg-white/20 px-2.5 py-0.5 text-xs font-semibold hover:bg-white/30">
                    Muat versi mereka
                  </button>
                }
              >
                {conflict} juga sedang mengedit. Simpananmu berikutnya akan menimpa perubahan mereka.
              </MagnetStrip>
            )}
            {connection === "unavailable" && <MagnetStrip tone="offline">Sinkron realtime terputus — perubahan admin lain baru terlihat setelah dimuat ulang.</MagnetStrip>}
            {k.doc.hasLegacy && !k.doc.publishedAt && <MagnetStrip tone="info">Sebagian isi diambil dari editor lama. Terbitkan sekali agar seluruh halaman dikelola dari Papan Jadwal.</MagnetStrip>}
            {k.dirty && !conflict && (
              <MagnetStrip
                tone="draft"
                action={
                  <button type="button" onClick={() => setPublishOpen(true)} className="font-semibold underline underline-offset-4">
                    Tinjau & terbitkan
                  </button>
                }
              >
                Draf berbeda di {changed.length} bagian. Pengunjung masih melihat versi tayang.
              </MagnetStrip>
            )}
            {redundancy.length > 0 && !lintHidden && (
              <MagnetStrip
                tone="lint"
                onDismiss={() => setLintHidden(true)}
                action={
                  <button type="button" onClick={() => jump(redundancy[0].b.path)} className="font-semibold underline underline-offset-4">
                    Perbaiki
                  </button>
                }
              >
                {redundancy.length} kalimat kembar: {redundancy[0].a.label} ↔ {redundancy[0].b.label}.
              </MagnetStrip>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={focus} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[12px] tabular-nums text-maroon">
                    Jam ke-{index + 1} · {PERIOD(index)}
                  </p>
                  <h1 className="mt-1 font-serif text-[clamp(1.9rem,3.6vw,2.8rem)] leading-tight text-navy">
                    {meta.label} <em className="text-[0.5em] text-text/45">— {meta.hint.toLowerCase()}</em>
                  </h1>
                </div>
              </div>

              {focusFlags.length > 0 && (
                <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 p-4">
                  <p className="text-[13px] font-semibold text-orange-900">Kalimat kembar di bagian ini</p>
                  <ul className="mt-2 space-y-1.5">
                    {focusFlags.map((r, i) => (
                      <li key={i} className="text-[12.5px] text-orange-950/80">
                        “{r.text.slice(0, 80)}
                        {r.text.length > 80 ? "…" : ""}” —{" "}
                        <button type="button" onClick={() => jump(r.a.path)} className="underline decoration-orange-400 underline-offset-2">
                          {r.a.label}
                        </button>{" "}
                        ↔{" "}
                        <button type="button" onClick={() => jump(r.b.path)} className="underline decoration-orange-400 underline-offset-2">
                          {r.b.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 [&_.grid>*]:min-w-0">
                <Editor
                  v={v[keyOf]}
                  root={v}
                  set={(p, val) => k.update(`${keyOf}.${p}`, val)}
                  setRoot={(p, val) => k.update(p, val)}
                  replaceRoot={(next) => k.replace(next)}
                  flag={(p) => flagged.has(`${keyOf}.${p}`)}
                  path={(p) => `${keyOf}.${p}`}
                  ask={ask}
                />
              </div>

              <nav className="mt-10 flex items-center justify-between gap-4 border-t border-navy/10 pt-5" aria-label="Bagian sebelum dan sesudah">
                <Step dir="prev" s={SECTIONS[index - 1]} onClick={open} />
                <Step dir="next" s={SECTIONS[index + 1]} onClick={open} />
              </nav>
            </motion.div>
          </AnimatePresence>
        </main>

        <PreviewDock open={preview} onClose={togglePreview} refreshKey={refreshKey} anchor={meta?.anchor ?? "top"} />
      </div>

      <BellModal open={publishOpen} onOpenChange={setPublishOpen} value={v} live={k.doc.live} redundancy={redundancy} onPublish={publish} onJump={jump} by={k.user?.name} />
      <HistoryModal
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        history={k.doc.history}
        publishedAt={k.doc.publishedAt}
        publishedBy={k.doc.publishedBy}
        onRestore={async (i) => {
          try {
            await k.restore(i);
            toast("Versi lama dipulihkan ke draf", { tone: "info", detail: "Terbitkan untuk menayangkannya." });
          } catch (e) {
            toast("Gagal memulihkan", { tone: "error", detail: e.message });
            throw e;
          }
        }}
      />
      <ConfirmModal
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        title="Buang seluruh draf?"
        description="Semua bagian kembali ke versi yang sedang tayang. Tindakan ini tidak bisa diurungkan."
        confirmLabel="Buang draf"
        destructive
        loading={discarding}
        onConfirm={async () => {
          setDiscarding(true);
          try {
            await k.discard();
            toast("Draf dibuang", { tone: "warn", detail: "Kembali ke versi tayang." });
            setDiscardOpen(false);
          } catch (e) {
            toast("Gagal membuang draf", { tone: "error", detail: e.message });
          } finally {
            setDiscarding(false);
          }
        }}
      />
      <ConfirmModal
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.title}
        description={confirm?.description}
        confirmLabel={confirm?.confirmLabel ?? "Hapus"}
        destructive
        onConfirm={() => {
          confirm?.onConfirm();
          setConfirm(null);
          toast("Dihapus dari draf", { tone: "warn", action: { label: "Urungkan", onClick: () => k.undo() } });
        }}
      />
    </div>
  );
}

function Step({ dir, s, onClick }) {
  if (!s) return <span />;
  const next = dir === "next";
  return (
    <button type="button" onClick={() => onClick(s.key)} className={cn("group flex flex-col", next ? "items-end text-right" : "items-start")}>
      <span className="text-[11px] uppercase tracking-[0.14em] text-text/40">{next ? "Jam berikutnya" : "Jam sebelumnya"}</span>
      <span className="mt-1 inline-flex items-center gap-2 font-serif text-lg text-navy">
        {!next && <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>}
        <span className="u-gold">{s.label}</span>
        {next && <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>}
      </span>
    </button>
  );
}
