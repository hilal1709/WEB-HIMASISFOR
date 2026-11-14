"use client";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useConnection } from "@/lib/realtime/client";
import { SCENES, changedScenes } from "@/lib/profil-lulusan-cms/schema";
import { findRedundancy } from "@/lib/profil-lulusan-cms/lint";
import { MediaPicker } from "@/components/home-studio/overlays";
import { ConfirmModal } from "@/components/ui/modal";
import { LordIcon } from "@/components/media/lord-icon";
import { cn } from "@/lib/utils";
import { useGaleri } from "./use-galeri";
import { TasselToaster, useTasselToast } from "./tassel-toast";
import { Failure, PipPreview, SaveState, SashBanner, TogaLoader, jumpToField } from "./chrome";
import { BentoHub } from "./bento-hub";
import { HistoryModal, IjazahModal } from "./modals";
import { HeroEditor } from "./editors/hero";
import { CurtainEditor, SeoEditor } from "./editors/curtain-seo";
import { ProfilesEditor } from "./editors/profiles";
import { CplEditor } from "./editors/cpl";
import { StatsEditor } from "./editors/stats";
import { AlumniEditor } from "./editors/alumni";
import { ClosingEditor } from "./editors/closing";

const EDITORS = { hero: HeroEditor, curtain: CurtainEditor, seo: SeoEditor, profiles: ProfilesEditor, cpl: CplEditor, stats: StatsEditor, alumni: AlumniEditor, closing: ClosingEditor };
const FOCUS_KEY = "galeri:focus";
const IMAGE_FOLDERS = ["uploads/profil-lulusan", "img/alumni", "img", "uploads", "mascot"];

/** Kelengkapan tile: porsi teks yang terisi (tautan, kunci, & media opsional tidak dihitung). */
function completeness(v) {
  const out = {};
  const walk = (x, path, acc) => {
    if (typeof x === "string") {
      if (/(href|key|photo|poster|lottie|src|sampleNote|quote)$/.test(path)) return;
      acc.t++;
      if (x.trim()) acc.f++;
    } else if (x && typeof x === "object") for (const [k, y] of Object.entries(x)) walk(y, `${path}.${k}`, acc);
  };
  for (const s of SCENES) {
    const acc = { t: 0, f: 0 };
    walk(v?.[s.key], s.key, acc);
    out[s.key] = acc.t ? acc.f / acc.t : 1;
  }
  return out;
}

const sceneOf = (path) => path.split(".")[0];

/** Posisi tile di hub (untuk animasi memekar/menyusut). */
const tileRect = (key) => {
  const el = key && document.querySelector(`[data-tile-key="${key}"]`);
  return el ? el.getBoundingClientRect() : null;
};
const clip = (r) =>
  r
    ? `inset(${Math.max(0, r.top)}px ${Math.max(0, innerWidth - r.right)}px ${Math.max(0, innerHeight - r.bottom)}px ${Math.max(0, r.left)}px round 24px)`
    : "inset(0px 0px 0px 0px round 0px)";
const reduce = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Editor memekar dari tile asal (clip-path) dan menyusut kembali saat ditutup. */
const BLOOM = {
  tile: (r) => (r && !reduce() ? { clipPath: clip(r), opacity: 1, transition: { duration: 0.5, ease: [0.65, 0, 0.35, 1] } } : { opacity: 0, transition: { duration: 0.2 } }),
  full: { clipPath: clip(null), opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

/**
 * Galeri Wisuda — CMS halaman Profil Lulusan.
 * Hub bento berisi miniatur hidup tiap section; tile dibuka memekar ke mode fokus dengan editor khas,
 * pratinjau draf mengambang (picture-in-picture), terbit lewat lembar "ijazah".
 */
export function GaleriWisuda() {
  return (
    <TasselToaster>
      <Room />
    </TasselToaster>
  );
}

function Room() {
  const toast = useTasselToast();
  const [conflict, setConflict] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const k = useGaleri({
    onSaved: () => setRefreshKey((n) => n + 1),
    onRemote: (e) => {
      if (e.type === "conflict") setConflict(e.by);
      if (e.type === "draft") toast(`${e.by} mengubah draf`, { tone: "info", detail: "Isi galeri diperbarui." });
      if (e.type === "published") toast(`${e.by} menerbitkan profil lulusan`, { tone: "live" });
    },
  });
  const connection = useConnection();
  const [focus, setFocus] = useState(null);
  // tile asal: editor memekar dari / menyusut ke tile ini (tetap selama berpindah bagian di mode fokus)
  const [morph, setMorph] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [closing, setClosing] = useState(false);
  const [pip, setPip] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [picker, setPicker] = useState(null);
  const [lintHidden, setLintHidden] = useState(false);
  const scroller = useRef(null);

  const v = k.value;
  const deferred = useDeferredValue(v);
  const redundancy = useMemo(() => (deferred ? findRedundancy(deferred) : []), [deferred]);
  const flagged = useMemo(() => new Set(redundancy.flatMap((r) => [r.a.path, r.b.path])), [redundancy]);
  const flagsBy = useMemo(() => {
    const o = {};
    for (const p of flagged) o[sceneOf(p)] = (o[sceneOf(p)] ?? 0) + 1;
    return o;
  }, [flagged]);
  const changed = useMemo(() => (v && k.doc ? changedScenes(v, k.doc.live) : []), [v, k.doc]);
  const complete = useMemo(() => completeness(deferred), [deferred]);
  const meta = SCENES.find((s) => s.key === focus);
  const index = meta ? SCENES.indexOf(meta) : -1;

  // tile terakhir yang dibuka diingat per sesi
  useEffect(() => {
    try {
      const s = sessionStorage.getItem(FOCUS_KEY);
      if (s && EDITORS[s]) {
        setFocus(s);
        setMorph(s);
      }
    } catch {}
  }, []);
  /**
   * Buka tile / pindah bagian (`key`) atau tutup mode fokus (`null`).
   * Menutup = editor menyusut kembali ke tile asal dulu; baru dilepas setelah animasinya selesai.
   */
  const open = (key, rect) => {
    if (key == null) {
      if (!focus) return;
      setOrigin(tileRect(morph));
      setClosing(true);
      try {
        sessionStorage.removeItem(FOCUS_KEY);
      } catch {}
      return;
    }
    if (!focus || closing) setOrigin(rect ?? tileRect(key));
    setClosing(false);
    setFocus(key);
    setMorph((m) => (focus && !closing ? m ?? key : key));
    try {
      sessionStorage.setItem(FOCUS_KEY, key);
    } catch {}
    requestAnimationFrame(() => scroller.current?.scrollTo({ top: 0 }));
  };
  const closed = () => {
    setFocus(null);
    setMorph(null);
    setClosing(false);
  };
  // cadangan bila animasi tidak berjalan (tab di latar, reduced motion): tetap tutup setelah durasinya
  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(closed, 650);
    return () => clearTimeout(t);
  }, [closing]);

  // pintasan keyboard
  const keys = useRef({});
  keys.current = { k, toast, open, focus, index, setPip, setPublishOpen, picker, confirm, publishOpen, historyOpen };
  useEffect(() => {
    const onKey = (e) => {
      const c = keys.current;
      if (c.picker || c.confirm || c.publishOpen || c.historyOpen) return;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? "");
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
      } else if (e.key === "Escape" && c.focus && !typing) {
        c.open(null);
      } else if (!typing && !mod && /^[1-8]$/.test(e.key)) {
        c.open(SCENES[Number(e.key) - 1].key);
      } else if (!typing && !mod && key === "p") {
        c.setPip((o) => !o);
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

  // mode fokus menutupi hub → kunci gulir halaman di belakangnya
  useEffect(() => {
    if (!focus) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [focus]);

  if (k.error && !v) return <Failure message={k.error} onRetry={k.load} />;
  if (!v) return <TogaLoader />;

  const jump = (path) => {
    const target = sceneOf(path);
    if (target !== focus) {
      open(target);
      setTimeout(() => jumpToField(path), 650);
    } else jumpToField(path);
  };

  const publish = async () => {
    try {
      const ok = await k.publish();
      toast(ok ? "Profil lulusan diterbitkan" : "Tidak ada perubahan", { tone: ok ? "live" : "info", detail: ok ? "Pengunjung langsung melihat versi baru." : undefined });
    } catch (e) {
      toast("Gagal menerbitkan", { tone: "error", detail: e.message });
      throw e;
    }
  };

  const pick = (kind, current, cb) => setPicker({ kind, current, cb });
  const ask = (opts) => setConfirm(opts);

  const actions = (
    <Actions
      status={k.status}
      dirty={k.dirty}
      changes={changed.length}
      canUndo={k.canUndo}
      onUndo={() => k.undo()}
      pip={pip}
      onPip={() => setPip((o) => !o)}
      onHistory={() => setHistoryOpen(true)}
      onDiscard={() => setDiscardOpen(true)}
      onPublish={() => setPublishOpen(true)}
      connection={connection}
    />
  );

  const banners = (
    <div className="space-y-2">
      {conflict && (
        <SashBanner
          tone="conflict"
          action={
            <button type="button" onClick={() => (setConflict(null), k.load())} className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold hover:bg-white/30">
              Muat versi mereka
            </button>
          }
        >
          {conflict} juga sedang mengedit. Simpananmu berikutnya akan menimpa perubahan mereka.
        </SashBanner>
      )}
      {connection === "unavailable" ? <SashBanner tone="offline">Sinkron realtime terputus — perubahan admin lain baru terlihat setelah dimuat ulang.</SashBanner> : null}
      {k.doc.hasLegacy && !k.doc.publishedAt && (
        <SashBanner tone="info">Sebagian isi diambil dari editor Profil lama. Terbitkan sekali agar seluruh halaman dikelola dari Galeri Wisuda.</SashBanner>
      )}
      {k.dirty && !conflict && (
        <SashBanner
          tone="draft"
          action={
            <button type="button" onClick={() => setPublishOpen(true)} className="font-semibold underline underline-offset-4">
              Tinjau & terbitkan
            </button>
          }
        >
          Draf berbeda di {changed.length} tile. Pengunjung masih melihat versi tayang.
        </SashBanner>
      )}
      {redundancy.length > 0 && !lintHidden && (
        <SashBanner
          tone="lint"
          onDismiss={() => setLintHidden(true)}
          action={
            <button type="button" onClick={() => jump(redundancy[0].b.path)} className="font-semibold underline underline-offset-4">
              Perbaiki
            </button>
          }
        >
          {redundancy.length} kalimat kembar: {redundancy[0].a.label} ↔ {redundancy[0].b.label}.
        </SashBanner>
      )}
    </div>
  );

  const Editor = focus ? EDITORS[focus] : null;
  const focusFlags = redundancy.filter((r) => sceneOf(r.a.path) === focus || sceneOf(r.b.path) === focus);

  return (
    <>
      <div className="galeri-room min-h-screen pb-24">
        <header className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-3 px-4 pt-5 sm:px-6">
          <Link href="/admin/dashboard" className="group inline-flex items-center gap-2 text-[13px] text-white/50 transition-colors hover:text-white">
            <span className="transition-transform group-hover:-translate-x-0.5">←</span> Panel admin
          </Link>
          <a href="/profil-lulusan" target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/50 underline decoration-gold/50 underline-offset-4 hover:text-white">
            Buka halaman ↗
          </a>
          <div className="ml-auto">{actions}</div>
        </header>

        <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold/80">CMS · Profil Lulusan</p>
          <h1 className="mt-3 font-serif text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.95] text-white">
            Galeri <em className="text-gold-soft">Wisuda</em>
          </h1>
          <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-white/55">
            Delapan bagian halaman, satu galeri. Buka tile untuk menyunting; tekan angka 1–8 untuk melompat, P untuk pratinjau.
          </p>
          <div className="mt-6">{banners}</div>
          <div className="mt-8">
            <BentoHub value={v} changed={changed} completeness={complete} flagsBy={flagsBy} onOpen={open} />
          </div>
        </section>
      </div>

      {focus && (
          <motion.div
            key={morph}
            ref={scroller}
            custom={origin}
            variants={BLOOM}
            initial="tile"
            animate={closing ? "tile" : "full"}
            onAnimationComplete={(def) => def === "tile" && closing && closed()}
            inert={closing || undefined}
            className="galeri-room fixed inset-0 z-[60] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label={`Sunting ${meta.label}`}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={closing ? { opacity: 0, y: 0, transition: { duration: 0.15 } } : { opacity: 1, y: 0, transition: { delay: 0.18, duration: 0.4 } }}
            >
              <div className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#08111f]/85 backdrop-blur-xl">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
                  <button type="button" onClick={() => open(null)} className="group inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[12.5px] text-white/70 transition-colors hover:border-gold/50 hover:text-white">
                    <span className="transition-transform group-hover:-translate-x-0.5">←</span> Galeri
                  </button>
                  <nav aria-label="Tile lain" className="hidden items-center gap-1 md:flex">
                    {SCENES.map((s, i) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => open(s.key)}
                        className={cn("relative rounded-full px-2.5 py-1 text-[12px] transition-colors", s.key === focus ? "text-[#0d1830]" : "text-white/50 hover:text-white")}
                        title={`${i + 1} · ${s.label}`}
                      >
                        {s.key === focus && <motion.span layoutId="focus-pill" className="absolute inset-0 rounded-full bg-gold" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                        <span className="relative">{s.label}</span>
                        {changed.includes(s.key) && s.key !== focus && <span className="absolute right-0.5 top-0.5 size-1.5 rounded-full bg-gold" />}
                      </button>
                    ))}
                  </nav>
                  <div className="ml-auto">{actions}</div>
                </div>
              </div>

              <motion.main
                key={focus}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="mx-auto max-w-6xl px-4 pb-32 pt-8 sm:px-6"
              >
                <p className="font-serif text-[13px] tabular-nums text-gold/80">{String(index + 1).padStart(2, "0")} / {String(SCENES.length).padStart(2, "0")}</p>
                <h2 className="mt-1 font-serif text-[clamp(2rem,4.5vw,3.4rem)] leading-tight text-white">
                  {meta.label} <em className="text-[0.55em] text-gold-soft">— {meta.hint.toLowerCase()}</em>
                </h2>

                {focusFlags.length > 0 && (
                  <div className="mt-5 rounded-2xl border border-orange-400/30 bg-orange-400/[0.07] p-4">
                    <p className="text-[13px] font-semibold text-orange-200">Kalimat kembar di tile ini</p>
                    <ul className="mt-2 space-y-1.5">
                      {focusFlags.map((r, i) => (
                        <li key={i} className="text-[12.5px] text-white/70">
                          “{r.text.slice(0, 80)}{r.text.length > 80 ? "…" : ""}” —{" "}
                          <button type="button" onClick={() => jump(r.a.path)} className="underline decoration-orange-300/60 underline-offset-2 hover:text-white">
                            {r.a.label}
                          </button>{" "}
                          ↔{" "}
                          <button type="button" onClick={() => jump(r.b.path)} className="underline decoration-orange-300/60 underline-offset-2 hover:text-white">
                            {r.b.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 [&_.grid>*]:min-w-0">
                  <Editor
                    key={focus}
                    v={v[focus]}
                    root={v}
                    set={(p, val) => k.update(`${focus}.${p}`, val)}
                    flag={(p) => flagged.has(`${focus}.${p}`)}
                    path={(p) => `${focus}.${p}`}
                    pick={pick}
                    ask={ask}
                  />
                </div>

                <nav className="mt-12 flex items-center justify-between gap-4 border-t border-white/[0.07] pt-5" aria-label="Tile sebelum dan sesudah">
                  <Step dir="prev" scene={SCENES[index - 1]} onClick={open} />
                  <span className="hidden text-[11.5px] text-white/35 sm:inline">Esc kembali · 1–8 lompat · P pratinjau · Ctrl+S simpan · Ctrl+Enter terbit</span>
                  <Step dir="next" scene={SCENES[index + 1]} onClick={open} />
                </nav>
              </motion.main>
            </motion.div>
          </motion.div>
      )}

      <PipPreview open={pip} onClose={() => setPip(false)} refreshKey={refreshKey} anchor={meta?.anchor ?? "top"} />

      <MediaPicker
        open={!!picker}
        onOpenChange={(o) => !o && setPicker(null)}
        kind={picker?.kind ?? "image"}
        current={picker?.current}
        onPick={(url) => picker?.cb(url)}
        uploadFolder="uploads/profil-lulusan"
        folders={picker?.kind === "image" ? IMAGE_FOLDERS : undefined}
        notify={(t, o) => toast(t, o)}
      />
      <IjazahModal open={publishOpen} onOpenChange={setPublishOpen} value={v} live={k.doc.live} redundancy={redundancy} onPublish={publish} onJump={jump} by={k.user?.name} />
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
        description="Semua tile kembali ke versi yang sedang tayang. Tindakan ini tidak bisa diurungkan."
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
    </>
  );
}

/** Bilah aksi: status simpan, urungkan, pratinjau, riwayat, buang, terbit. */
function Actions({ status, dirty, changes, canUndo, onUndo, pip, onPip, onHistory, onDiscard, onPublish, connection }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <SaveState status={status} />
      <span className={cn("mx-1 size-1.5 rounded-full", connection === "connected" ? "bg-emerald-400" : "bg-white/25")} title={connection === "connected" ? "Realtime tersambung" : "Realtime belum tersambung"} />
      <button type="button" disabled={!canUndo} onClick={onUndo} className="rounded-full px-2.5 py-1.5 text-[12px] text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30">
        Urungkan
      </button>
      <button type="button" onClick={onPip} aria-pressed={pip} className={cn("lord-pip inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors", pip ? "border-gold bg-gold/15 text-gold-soft" : "border-white/15 text-white/75 hover:border-white/35")}>
        <LordIcon name="globe" size={16} trigger="hover" target=".lord-pip" colors="primary:#e6d3a1,secondary:#c9a227" />
        Pratinjau
      </button>
      <button type="button" onClick={onHistory} className="lord-his inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[12px] font-semibold text-white/75 transition-colors hover:border-white/35">
        <LordIcon name="document" size={16} trigger="hover" target=".lord-his" colors="primary:#e6d3a1,secondary:#c9a227" />
        Riwayat
      </button>
      {dirty && (
        <button type="button" onClick={onDiscard} className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#ff9aa8] transition-colors hover:bg-[#e86a7c]/15">
          Buang
        </button>
      )}
      <motion.button
        type="button"
        onClick={onPublish}
        whileTap={{ scale: 0.95 }}
        className={cn("relative inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12.5px] font-semibold transition-colors", dirty ? "bg-gold text-[#0d1830] hover:bg-gold-soft" : "bg-white/10 text-white/60 hover:bg-white/15")}
      >
        Terbitkan
        {dirty && changes > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-[#0d1830] px-1 text-[10.5px] tabular-nums text-gold-soft">{changes}</span>}
      </motion.button>
    </div>
  );
}

function Step({ dir, scene, onClick }) {
  if (!scene) return <span />;
  const next = dir === "next";
  return (
    <button type="button" onClick={() => onClick(scene.key)} className={cn("group flex flex-col", next ? "items-end text-right" : "items-start")}>
      <span className="text-[11px] uppercase tracking-[0.14em] text-white/35">{next ? "Berikutnya" : "Sebelumnya"}</span>
      <span className="mt-1 inline-flex items-center gap-2 font-serif text-lg text-white">
        {!next && <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>}
        <span className="u-gold">{scene.label}</span>
        {next && <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>}
      </span>
    </button>
  );
}
