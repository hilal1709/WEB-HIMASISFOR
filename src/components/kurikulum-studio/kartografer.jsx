"use client";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { gsap } from "@/lib/scroll";
import { useConnection } from "@/lib/realtime/client";
import { buildKurikulum, slugify } from "@/lib/kurikulum-content";
import { CHAPTERS, changedChapters } from "@/lib/kurikulum-cms/schema";
import { allCourses, signals as runSignals } from "@/lib/kurikulum-cms/lint";
import { MediaPicker } from "@/components/home-studio/overlays";
import { ConfirmModal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { getIn, useKartografer } from "./use-kartografer";
import { HistoryModal, KarcisToaster, PreviewSheet, PublishModal, RailLoader, SignalBanner, useKarcis } from "./overlays";
import { Rel } from "./rel";
import { Halte } from "./halte";
import { fieldDomId } from "./fields";
import { newId, uniqueSlug } from "./jadwal";
import { LembarRps } from "./lembar-rps";
import {
  BokChapter,
  CariChapter,
  LaciChapter,
  PembukaChapter,
  PenutupChapter,
  PetaChapter,
  PilihanChapter,
  RpsChapter,
  RumpunChapter,
  SemesterChapter,
  SeoChapter,
} from "./chapters";

const FOLDERS = { image: ["uploads/kurikulum", "img", "img/logo", "uploads"], lottie: ["lottie", "uploads/kurikulum"] };
const STATION_KEY = "sisfor:kartografer:stasiun";
const CONN = { connected: ["Langsung", "bg-success"], connecting: ["Menyambung", "bg-gold"], unavailable: ["Luring", "bg-danger"], off: ["Mandiri", "bg-navy/30"] };

const parentOf = (path) => path.split(".").slice(0, -1).join(".");
const indexOf = (path) => Number(path.split(".").pop());

export function Kartografer() {
  return (
    <KarcisToaster>
      <Studio />
    </KarcisToaster>
  );
}

function Studio() {
  const notify = useKarcis();
  const [previewKey, setPreviewKey] = useState(0);
  const [conflict, setConflict] = useState(null);
  const k = useKartografer({
    onSaved: () => setPreviewKey((n) => n + 1),
    onRemote: ({ type, by }) => {
      if (type === "conflict") setConflict(by);
      if (type === "draft") notify(`${by} mengubah draf`, { tone: "info", detail: "Isi kerja ikut diperbarui." });
      if (type === "published") notify(`${by} menerbitkan kurikulum`, { tone: "info" });
    },
  });
  const conn = useConnection();
  const [active, setActive] = useState("pembuka");
  const [lembar, setLembar] = useState(null);
  const [picker, setPicker] = useState(null);
  const [modal, setModal] = useState(null); // publish | history | preview | discard | semester:<i>
  const [legacyHidden, setLegacyHidden] = useState(false);
  const desk = useRef(null);

  // stasiun terakhir per penampil (kenyamanan, boleh hilang)
  useEffect(() => {
    try {
      const s = localStorage.getItem(STATION_KEY);
      if (CHAPTERS.some((c) => c.key === s)) setActive(s);
    } catch {}
  }, []);
  const go = useCallback((key) => {
    setActive(key);
    try {
      localStorage.setItem(STATION_KEY, key);
    } catch {}
    desk.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const value = k.value;
  const deferred = useDeferredValue(value);
  const sig = useMemo(() => (deferred ? runSignals(deferred) : { list: [], byChapter: {} }), [deferred]);
  const derived = useMemo(() => (deferred ? buildKurikulum(deferred) : null), [deferred]);
  const changed = useMemo(() => (value && k.doc ? changedChapters(value, k.doc.live) : []), [value, k.doc]);
  const liveIds = useMemo(() => new Set(allCourses(k.doc?.live).map((x) => x.c.id)), [k.doc?.live]);

  // pintasan papan ketik
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const typing = /^(INPUT|TEXTAREA)$/.test(e.target?.tagName);
      if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        k.flush().then(() => notify("Draf disimpan")).catch(() => notify("Gagal menyimpan", { tone: "error" }));
      } else if (e.key.toLowerCase() === "z" && !typing) {
        e.preventDefault();
        e.shiftKey ? k.redo() : k.undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [k, notify]);

  // peringatan sebelum menutup tab dengan perubahan yang belum tersimpan
  useEffect(() => {
    const onBefore = (e) => {
      if (k.status === "typing" || k.status === "saving") (e.preventDefault(), (e.returnValue = ""));
    };
    window.addEventListener("beforeunload", onBefore);
    return () => window.removeEventListener("beforeunload", onBefore);
  }, [k.status]);

  if (!value) return <RailLoader error={k.error} onRetry={k.load} />;

  const update = k.update;
  const rumpun = derived?.rumpun ?? [];
  const rumpunByKey = derived?.rumpunByKey ?? {};
  const courses = allCourses(value);
  const usage = {};
  courses.forEach(({ c }) => {
    usage[c.rumpun] = (usage[c.rumpun] ?? 0) + 1;
    (c.bok ?? []).forEach((b) => (usage[b] = (usage[b] ?? 0) + 1));
  });
  const containers = [
    ...(value.semester.list ?? []).map((s, i) => ({ path: `semester.list.${i}.courses`, title: `Semester ${s.semester}`, allowSlot: true })),
    ...(value.pilihan.tracks ?? []).map((t, i) => ({ path: `pilihan.tracks.${i}.courses`, title: `Pilihan · ${t.name || `Bidang ${i + 1}`}`, allowSlot: false })),
  ];
  const taken = (except) => new Set(courses.filter((x) => x.path !== except).map((x) => x.c.slug).filter(Boolean));

  const removeAt = (path) => {
    const list = [...(getIn(value, parentOf(path)) ?? [])];
    const [item] = list.splice(indexOf(path), 1);
    update(parentOf(path), list);
    return item;
  };

  const board = {
    onOpen: (path) => setLembar(path),
    onAddCourse: (container) => {
      const list = getIn(value, container) ?? [];
      const track = container.startsWith("pilihan") ? getIn(value, container.replace(/\.courses$/, "")) : null;
      const nama = "Mata kuliah baru";
      const c = { id: newId(), slug: uniqueSlug(`${nama}-${list.length + 1}`, taken()), nama, sks: 3, rumpun: track?.rumpun ?? rumpun[0]?.key, bok: [] };
      update(container, [...list, c]);
      setLembar(`${container}.${list.length}`);
    },
    onAddSlot: (container) => {
      const list = getIn(value, container) ?? [];
      const n = list.filter((c) => c.slot).length + 1;
      update(container, [...list, { id: newId(), slot: true, nama: `Elective ${n}`, sks: 3 }]);
      notify("Slot pilihan ditambahkan", { detail: `Elective ${n}` });
    },
    addSemester: () => {
      const list = value.semester.list ?? [];
      const next = Math.max(0, ...list.map((s) => s.semester)) + 1;
      update("semester.list", [...list, { semester: next, courses: [] }]);
      notify(`Semester ${next} ditambahkan`);
    },
    removeSemester: (i) => {
      const s = value.semester.list[i];
      if ((s.courses ?? []).length) return setModal(`semester:${i}`);
      update("semester.list", value.semester.list.filter((_, j) => j !== i));
      notify(`Semester ${s.semester} dihapus`, { action: { label: "Urungkan", onClick: k.undo } });
    },
  };

  const moveCourse = (path, to) => {
    if (parentOf(path) === to) return;
    const item = getIn(value, path);
    const toList = getIn(value, to) ?? [];
    removeAt(path);
    // indeks tujuan tidak bergeser kecuali sumber & tujuan satu induk (tidak terjadi di sini)
    update(to, [...toList, item]);
    setLembar(`${to}.${toList.length}`);
    notify(`${item.nama} dipindah`, { detail: containers.find((c) => c.path === to)?.title, action: { label: "Urungkan", onClick: k.undo } });
  };

  const deleteCourse = (path) => {
    setLembar(null);
    const item = removeAt(path);
    notify(`${item?.nama ?? "Mata kuliah"} dihapus`, { tone: "warn", action: { label: "Urungkan", onClick: k.undo } });
  };

  // nama baru pada mata kuliah yang belum pernah terbit → tautan ikut nama (sekali terbit, tautan beku)
  const lembarUpdate = (p, v) => {
    if (lembar && p === `${lembar}.nama`) {
      const c = getIn(value, lembar);
      if (c && !c.slot && !liveIds.has(c.id)) return update(lembar, { ...c, nama: v, slug: uniqueSlug(slugify(v) || c.slug, taken(lembar)) });
    }
    update(p, v);
  };

  const jump = (s) => {
    const course = s.path.match(/^((?:semester\.list|pilihan\.tracks)\.\d+\.courses\.\d+)/);
    go(s.chapter);
    if (course) return setTimeout(() => setLembar(course[1]), 250);
    setTimeout(() => {
      const el = document.getElementById(fieldDomId(s.path)) ?? document.getElementById(fieldDomId(s.path.split(".").slice(0, -1).join(".")));
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      gsap.fromTo(el, { boxShadow: "0 0 0 4px rgb(201 162 39 / 0.6)" }, { boxShadow: "0 0 0 0px rgb(201 162 39 / 0)", duration: 1.8, delay: 0.3, ease: "power2.out", clearProps: "boxShadow" });
      el.focus?.({ preventScroll: true });
    }, 350);
  };

  const openPicker = (kind, path) => setPicker({ kind, path });
  const props = { value, update, rumpun, rumpunByKey, usage, openPicker, board };
  const Chapter = {
    pembuka: PembukaChapter,
    rumpun: RumpunChapter,
    bok: BokChapter,
    peta: PetaChapter,
    semester: SemesterChapter,
    pilihan: PilihanChapter,
    rps: RpsChapter,
    penutup: PenutupChapter,
    cari: CariChapter,
    laci: LaciChapter,
    seo: SeoChapter,
  }[active];
  const semIdx = modal?.startsWith("semester:") ? Number(modal.split(":")[1]) : null;
  const [connLabel, connDot] = CONN[conn] ?? CONN.off;

  return (
    <div className="kartografer relative min-h-dvh bg-paper pb-28 text-text">
      <div aria-hidden className="kf-blueprint pointer-events-none fixed inset-0" />

      <header className="sticky top-0 z-40 border-b border-navy/10 bg-paper/85 backdrop-blur-md">
        <div className="flex items-center gap-4 px-4 pt-3 sm:px-6">
          <Link href="/admin/dashboard" className="text-[13px] text-text/55 transition-colors hover:text-maroon">
            ← Panel admin
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-[1.15rem] leading-none text-navy">
              Kartografer <em className="text-maroon">Kurikulum</em>
            </p>
          </div>
          <span className="hidden items-center gap-1.5 text-[12px] text-text/55 sm:inline-flex" title="Sinkron antar admin">
            <span aria-hidden className={cn("size-2 rounded-full", connDot)} />
            {connLabel}
          </span>
          {derived && (
            <span className="hidden rounded-full bg-white px-3 py-1 text-[12px] tabular-nums text-navy ring-1 ring-navy/10 md:inline">
              {derived.totals.sks} SKS · {derived.totals.wajib} wajib · {derived.totals.pilihan} pilihan · {derived.totals.rps} RPS
            </span>
          )}
          <a href="/curiculum" target="_blank" rel="noreferrer" className="hidden text-[13px] font-semibold text-maroon lg:inline">
            Lihat halaman ↗
          </a>
        </div>
        <Rel chapters={CHAPTERS} active={active} onSelect={go} changed={changed} signals={sig.byChapter} value={deferred} />
      </header>

      <main ref={desk} className="relative mx-auto max-w-[1400px] scroll-mt-40 px-4 pt-6 sm:px-6">
        <div className="space-y-2.5">
          {k.doc?.fromLegacy && !legacyHidden && (
            <SignalBanner tone="info" title="Isi diambil dari pengelola kurikulum lama" onDismiss={() => setLegacyHidden(true)}>
              Semester, mata kuliah, dan RPS yang pernah disimpan sudah dipindahkan ke sini. Terbitkan sekali agar Kartografer menjadi sumber tunggal.
            </SignalBanner>
          )}
          {conflict && (
            <SignalBanner
              tone="warning"
              title={`${conflict} juga sedang mengubah draf`}
              onDismiss={() => setConflict(null)}
              action={
                <button type="button" onClick={() => (k.load(), setConflict(null))} className="shrink-0 rounded-md bg-navy px-3 py-1.5 text-[12.5px] font-semibold text-white">
                  Muat versi terbaru
                </button>
              }
            >
              Perubahanmu belum tersimpan ke server. Muat versi terbaru untuk melihat isinya, atau lanjut mengetik untuk menimpanya.
            </SignalBanner>
          )}
          {k.status === "error" && (
            <SignalBanner
              tone="danger"
              title="Draf gagal tersimpan"
              action={
                <button type="button" onClick={() => k.flush().catch(() => {})} className="shrink-0 rounded-md bg-maroon px-3 py-1.5 text-[12.5px] font-semibold text-white">
                  Coba simpan
                </button>
              }
            >
              Koneksi ke server terputus. Isianmu masih ada di layar ini.
            </SignalBanner>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="pt-6">
            {Chapter && <Chapter {...props} />}
          </motion.div>
        </AnimatePresence>

        <nav aria-label="Stasiun berikutnya" className="mt-10 flex items-center justify-between gap-3 border-t border-navy/10 pt-5">
          {(() => {
            const i = CHAPTERS.findIndex((c) => c.key === active);
            const prev = CHAPTERS[i - 1];
            const next = CHAPTERS[i + 1];
            return (
              <>
                {prev ? <button type="button" onClick={() => go(prev.key)} className="text-[13.5px] text-text/60 hover:text-navy">← {prev.label}</button> : <span />}
                {next && (
                  <button type="button" onClick={() => go(next.key)} className="group inline-flex items-center gap-2 text-[14px] font-semibold text-maroon">
                    Stasiun berikutnya: {next.label}
                    <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                  </button>
                )}
              </>
            );
          })()}
        </nav>
      </main>

      <Halte
        status={k.status}
        dirty={k.dirty || Boolean(k.doc?.fromLegacy)}
        canUndo={k.canUndo}
        onUndo={k.undo}
        onRedo={k.redo}
        signals={sig}
        onJump={jump}
        onHistory={() => setModal("history")}
        onPreview={() => k.flush().catch(() => {}).finally(() => setModal("preview"))}
        onDiscard={() => setModal("discard")}
        onPublish={() => setModal("publish")}
      />

      <LembarRps
        path={lembar}
        value={value}
        update={lembarUpdate}
        onClose={() => setLembar(null)}
        onMove={moveCourse}
        onDelete={deleteCourse}
        containers={containers}
        rumpun={rumpun}
        rumpunByKey={rumpunByKey}
        blocks={value.bok.blocks ?? []}
        notify={notify}
      />

      <MediaPicker
        open={Boolean(picker)}
        onOpenChange={(o) => !o && setPicker(null)}
        kind={picker?.kind ?? "lottie"}
        current={picker ? getIn(value, picker.path) : null}
        uploadFolder="uploads/kurikulum"
        folders={FOLDERS[picker?.kind ?? "lottie"]}
        notify={notify}
        onPick={(url) => picker && update(picker.path, url)}
      />

      <PublishModal
        open={modal === "publish"}
        onOpenChange={(o) => !o && setModal(null)}
        value={value}
        live={k.doc?.live}
        firstPublish={Boolean(k.doc?.fromLegacy)}
        onPublish={async () => {
          try {
            const ok = await k.publish();
            notify(ok ? "Kurikulum terbit" : "Tidak ada perubahan", { detail: ok ? "Pengunjung yang sedang membuka halaman langsung diperbarui." : undefined });
          } catch (e) {
            notify("Gagal menerbitkan", { tone: "error", detail: e.message });
            throw e;
          }
        }}
      />
      <HistoryModal
        open={modal === "history"}
        onOpenChange={(o) => !o && setModal(null)}
        doc={k.doc}
        onRestore={async (i) => {
          await k.restore(i);
          notify("Versi lama dipulihkan ke draf", { action: { label: "Urungkan", onClick: k.undo } });
        }}
      />
      <PreviewSheet open={modal === "preview"} onOpenChange={(o) => !o && setModal(null)} refreshKey={previewKey} anchor={CHAPTERS.find((c) => c.key === active)?.anchor} />
      <ConfirmModal
        open={modal === "discard"}
        onOpenChange={(o) => !o && setModal(null)}
        title="Buang seluruh draf?"
        description="Semua perubahan sejak terbit terakhir hilang dan isi kembali ke versi yang tayang. Langkah ini tidak bisa diurungkan."
        confirmLabel="Buang draf"
        destructive
        onConfirm={async () => {
          setModal(null);
          try {
            await k.discard();
            notify("Draf dibuang", { tone: "warn" });
          } catch (e) {
            notify("Gagal membuang draf", { tone: "error", detail: e.message });
          }
        }}
      />
      <ConfirmModal
        open={semIdx != null}
        onOpenChange={(o) => !o && setModal(null)}
        title={semIdx != null ? `Hapus semester ${value.semester.list[semIdx]?.semester}?` : ""}
        description={semIdx != null ? `${value.semester.list[semIdx]?.courses?.length ?? 0} mata kuliah beserta RPS-nya ikut terhapus dari draf. Bisa diurungkan sebelum terbit.` : ""}
        confirmLabel="Hapus semester"
        destructive
        onConfirm={() => {
          const s = value.semester.list[semIdx];
          update("semester.list", value.semester.list.filter((_, j) => j !== semIdx));
          setModal(null);
          notify(`Semester ${s.semester} dihapus`, { tone: "warn", action: { label: "Urungkan", onClick: k.undo } });
        }}
      />
    </div>
  );
}
