"use client";
import { useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "@/lib/scroll";
import { prefersReducedMotion } from "@/lib/motion";
import { useConnection } from "@/lib/realtime/client";
import { SCENES, changedScenes } from "@/lib/visi-misi-cms/schema";
import { findRedundancy } from "@/lib/visi-misi-cms/lint";
import { CompassQuadrantIllustration } from "@/components/illustrations/line-illustrations";
import { ConfirmModal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { useKompas } from "./use-kompas";
import { CompassToaster, useCompassToast } from "./compass-toast";
import { Bearing, HorizonBanner, HorizonRail, KompasLoader, Teropong, jumpToField } from "./chrome";
import { HistoryModal, PublishModal } from "./modals";
import { CurtainScene, HeroScene, SeoScene } from "./scenes/intro";
import { VisiScene } from "./scenes/visi";
import { MisiScene } from "./scenes/misi";
import { ClosingScene, RoadmapScene } from "./scenes/journey";

const EDITORS = { curtain: CurtainScene, hero: HeroScene, visi: VisiScene, misi: MisiScene, roadmap: RoadmapScene, closing: ClosingScene, seo: SeoScene };
const SCENE_KEY = "kompas:scene";

/** Kelengkapan adegan: porsi teks yang terisi (tautan & label opsional tidak dihitung). */
function completeness(v) {
  const out = {};
  const walk = (x, path, acc) => {
    if (typeof x === "string") {
      if (/href$|sampleNote$|sampleLabel$/.test(path)) return;
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

/** Adegan pemilik sebuah path field (mis. "misi.items.2.detail" → "misi"). */
const sceneOf = (path) => path.split(".")[0];

/**
 * Ruang Kompas — CMS halaman Visi & Misi. Rel cakrawala tujuh adegan di langit navy,
 * satu adegan per layar dengan editor khasnya, Teropong pratinjau dari bawah, terbit dengan selisih.
 */
export function RuangKompas() {
  return (
    <CompassToaster>
      <Room />
    </CompassToaster>
  );
}

function Room() {
  const toast = useCompassToast();
  const [conflict, setConflict] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const k = useKompas({
    onSaved: () => setRefreshKey((n) => n + 1),
    onRemote: (e) => {
      if (e.type === "conflict") setConflict(e.by);
      if (e.type === "draft") toast(`${e.by} mengubah draf`, { tone: "info", detail: "Isi Ruang Kompas diperbarui." });
      if (e.type === "published") toast(`${e.by} menerbitkan visi & misi`, { tone: "live" });
    },
  });
  const connection = useConnection();
  const [scene, setScene] = useState("hero");
  const [teropong, setTeropong] = useState(false);
  const [teropongH, setTeropongH] = useState(420);
  const [publishOpen, setPublishOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [lintHidden, setLintHidden] = useState(false);
  const stage = useRef(null);
  const dir = useRef(1);

  const v = k.value;
  const deferred = useDeferredValue(v);
  const redundancy = useMemo(() => (deferred ? findRedundancy(deferred) : []), [deferred]);
  const flagged = useMemo(() => new Set(redundancy.flatMap((r) => [r.a.path, r.b.path])), [redundancy]);
  const flags = (p) => flagged.has(p);
  const changed = useMemo(() => (v && k.doc ? changedScenes(v, k.doc.live) : []), [v, k.doc]);
  const complete = useMemo(() => completeness(deferred), [deferred]);
  const meta = SCENES.find((s) => s.key === scene);
  const index = SCENES.indexOf(meta);

  // adegan terakhir diingat per peramban
  useEffect(() => {
    try {
      const s = sessionStorage.getItem(SCENE_KEY);
      if (s && EDITORS[s]) setScene(s);
    } catch {}
  }, []);

  const go = (key) => {
    if (key === scene || !EDITORS[key]) return;
    dir.current = SCENES.findIndex((s) => s.key === key) > index ? 1 : -1;
    setScene(key);
    try {
      sessionStorage.setItem(SCENE_KEY, key);
    } catch {}
  };

  // transisi adegan: geser + clip-path dari garis cakrawala
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el || prefersReducedMotion()) return;
    gsap.fromTo(
      el,
      { x: 40 * dir.current, opacity: 0, clipPath: "inset(48% 0% 48% 0%)" },
      { x: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 0.75, ease: "expo.out", clearProps: "clipPath,transform" }
    );
  }, [scene, Boolean(v)]); // eslint-disable-line react-hooks/exhaustive-deps

  // pintasan keyboard
  const keys = useRef({});
  keys.current = { k, toast, go, index, setTeropong };
  useEffect(() => {
    const onKey = (e) => {
      const { k, toast, go, index, setTeropong } = keys.current;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? "");
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (mod && key === "s") {
        e.preventDefault();
        k.flush().then(
          () => toast("Draf disimpan", { detail: "Belum tayang sampai diterbitkan." }),
          () => toast("Gagal menyimpan", { tone: "error" })
        );
      } else if (mod && key === "z" && !typing) {
        e.preventDefault();
        if (e.shiftKey) k.redo();
        else if (k.undo()) toast("Langkah diurungkan", { tone: "info", duration: 2200 });
      } else if (mod && key === "p") {
        e.preventDefault();
        setTeropong((o) => !o);
      } else if (e.altKey && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        e.preventDefault();
        const next = SCENES[index + (e.key === "ArrowRight" ? 1 : -1)];
        if (next) go(next.key);
      } else if (!typing && !mod && /^[1-7]$/.test(e.key)) {
        go(SCENES[Number(e.key) - 1].key);
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
  if (!v) return <KompasLoader />;

  const set = (path, val) => k.update(path, val);
  const jump = (path) => {
    const target = sceneOf(path);
    if (target !== scene) {
      go(target);
      setTimeout(() => jumpToField(path), 520);
    } else jumpToField(path);
  };
  const Editor = EDITORS[scene];

  const publish = async () => {
    try {
      const ok = await k.publish();
      toast(ok ? "Visi & misi diterbitkan" : "Tidak ada perubahan", { tone: ok ? "live" : "info", detail: ok ? "Halaman publik sudah diperbarui." : undefined });
    } catch (e) {
      toast("Gagal menerbitkan", { tone: "error", detail: e.message });
      throw e;
    }
  };

  return (
    <div className="kompas-room min-h-screen text-text" style={{ paddingBottom: teropong ? teropongH + 24 : 96 }}>
      {/* langit: kepala + bilah arah + rel cakrawala */}
      <header className="kompas-sky relative overflow-hidden pb-6 text-white">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 hidden w-[420px] opacity-[0.07] md:block">
          <CompassQuadrantIllustration compact className="h-auto w-full text-white" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 pt-5 sm:px-6">
          <Link href="/admin/dashboard" className="group inline-flex items-center gap-2 text-[13px] text-white/55 transition-colors hover:text-white">
            <span className="transition-transform group-hover:-translate-x-0.5">←</span> Panel admin
          </Link>
          <a href="/visi-misi" target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/55 underline decoration-gold/60 underline-offset-4 hover:text-white">
            Buka halaman ↗
          </a>
          <div className="ml-auto">
            <Bearing
              status={k.status}
              dirty={k.dirty}
              canUndo={k.canUndo}
              onUndo={() => k.undo()}
              teropong={teropong}
              onTeropong={() => setTeropong((o) => !o)}
              onHistory={() => setHistoryOpen(true)}
              onDiscard={() => setDiscardOpen(true)}
              onPublish={() => setPublishOpen(true)}
              connection={connection}
            />
          </div>
        </div>
        <div className="relative mx-auto mt-8 max-w-6xl px-4 sm:px-6">
          <p className="text-[12px] uppercase tracking-[0.2em] text-gold-soft/70">Ruang Kompas · Visi & Misi</p>
          <h1 className="mt-2 font-serif text-[clamp(1.8rem,3.6vw,2.8rem)] leading-tight">
            {meta.label} <em className="text-gold-soft">— {meta.hint.toLowerCase()}</em>
          </h1>
        </div>
        <div className="relative mt-8">
          <HorizonRail active={scene} onSelect={go} changed={changed} completeness={complete} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <div className="space-y-3">
          {conflict && (
            <HorizonBanner
              tone="conflict"
              action={
                <button type="button" onClick={() => (setConflict(null), k.load())} className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold hover:bg-white/25">
                  Muat versi mereka
                </button>
              }
            >
              {conflict} juga sedang mengedit. Simpananmu berikutnya akan menimpa perubahan mereka.
            </HorizonBanner>
          )}
          {k.doc.hasLegacy && !k.doc.publishedAt && (
            <HorizonBanner tone="info">Teks visi & misi diambil dari editor Profil lama. Terbitkan sekali agar seluruh halaman dikelola dari Ruang Kompas.</HorizonBanner>
          )}
          {k.dirty && !conflict && (
            <HorizonBanner
              tone="draft"
              action={
                <button type="button" onClick={() => setPublishOpen(true)} className="shrink-0 font-semibold underline decoration-gold underline-offset-4">
                  Tinjau & terbitkan
                </button>
              }
            >
              Draf belum terbit di {changed.length} adegan{k.doc.draftAt ? ` · disimpan ${new Date(k.doc.draftAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}` : ""}. Pengunjung masih melihat versi tayang.
            </HorizonBanner>
          )}
          {redundancy.length > 0 && !lintHidden && (
            <HorizonBanner tone="lint" onDismiss={() => setLintHidden(true)} action={<button type="button" onClick={() => jump(redundancy[0].b.path)} className="shrink-0 font-semibold underline underline-offset-4">Lihat</button>}>
              {redundancy.length} kalimat berulang: “{redundancy[0].text.slice(0, 60)}{redundancy[0].text.length > 60 ? "…" : ""}” ada di {redundancy[0].a.label} dan {redundancy[0].b.label}.
            </HorizonBanner>
          )}
        </div>

        <div ref={stage} key={scene} className="mt-6 [&_.grid>*]:min-w-0">
          <Editor value={v[scene]} set={set} flags={flags} />
        </div>

        {/* navigasi bawah antar adegan */}
        <nav className="mt-10 flex items-center justify-between gap-4 border-t border-navy/10 pt-5" aria-label="Adegan sebelum dan sesudah">
          <SceneStep dir="prev" scene={SCENES[index - 1]} onClick={go} />
          <span className="hidden text-[12px] text-text/45 sm:inline">Alt + ← → · angka 1–7 · Ctrl+S simpan · Ctrl+P teropong</span>
          <SceneStep dir="next" scene={SCENES[index + 1]} onClick={go} />
        </nav>
      </main>

      <Teropong open={teropong} onClose={() => setTeropong(false)} refreshKey={refreshKey} anchor={meta.anchor} height={teropongH} onHeight={setTeropongH} />

      <PublishModal open={publishOpen} onOpenChange={setPublishOpen} value={v} live={k.doc.live} redundancy={redundancy} onPublish={publish} onJump={jump} />
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
        description="Semua adegan kembali ke versi yang sedang tayang. Tindakan ini tidak bisa diurungkan."
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
    </div>
  );
}

function SceneStep({ dir, scene, onClick }) {
  if (!scene) return <span />;
  const next = dir === "next";
  return (
    <button type="button" onClick={() => onClick(scene.key)} className={cn("group flex flex-col", next ? "items-end text-right" : "items-start")}>
      <span className="text-[11px] uppercase tracking-[0.14em] text-text/45">{next ? "Berikutnya" : "Sebelumnya"}</span>
      <span className="mt-1 inline-flex items-center gap-2 font-serif text-lg text-navy">
        {!next && <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>}
        <span className="u-gold">{scene.label}</span>
        {next && <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>}
      </span>
    </button>
  );
}

function Failure({ message, onRetry }) {
  return (
    <div className="kompas-room grid min-h-screen place-items-center px-4">
      <div className="max-w-sm text-center">
        <div className="mx-auto w-56 text-navy opacity-60">
          <CompassQuadrantIllustration compact className="h-auto w-full text-navy" />
        </div>
        <p className="mt-4 font-serif text-2xl text-navy">Kompas kehilangan arah</p>
        <p className="mt-2 text-[14px] text-text/60">{message}</p>
        <button type="button" onClick={onRetry} className="mt-5 rounded-md bg-maroon px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-maroon-deep">
          Coba lagi
        </button>
      </div>
    </div>
  );
}
