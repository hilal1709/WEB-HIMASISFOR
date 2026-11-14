"use client";
import { useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useConnection } from "@/lib/realtime/client";
import { prefersReducedMotion } from "@/lib/motion";
import { gsap } from "@/lib/scroll";
import { CHAPTERS, changedChapters } from "@/lib/prestasi-cms/schema";
import { findRedundancy, redundancyByPath } from "@/lib/prestasi-cms/lint";
import { normalizeLevel } from "@/lib/prestasi-content";
import { MediaPicker } from "@/components/home-studio/overlays";
import { cn } from "@/lib/utils";
import { useKurator } from "./use-kurator";
import { MedalToaster, useMedal } from "./medal-toast";
import { LaurelLoader, PlaqueSkeleton, PreviewSheet, RibbonBanner, SaveDot, jumpToField } from "./chrome";
import { LintCtx, PickerCtx } from "./fields";
import { ChapterEditor, ChapterRail, ExhibitLabel } from "./panggung";
import { Vitrin } from "./vitrin";
import { PlakatSheet } from "./plakat-sheet";
import { CeremonyModal, HistoryModal, KuratorConfirm } from "./modals";

const ROOM_KEY = "ruang-kurator:room";
const CH_KEY = "ruang-kurator:chapter";
const FOLDERS = {
  image: ["uploads/prestasi", "img/mhs", "img/award", "img/profil", "uploads", "img"],
  video: ["video", "uploads/prestasi", "uploads"],
  lottie: ["lottie", "uploads/prestasi"],
};
const ANCHOR = { archive: "arsip", labels: "arsip", story: "kisah" };
const ROOMS = [
  ["vitrin", "Vitrin", "Data prestasi"],
  ["panggung", "Panggung", "Teks halaman"],
];

const store = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

/**
 * Ruang Kurator — CMS halaman /achievement bertema galeri museum malam.
 * Dua ruang: Vitrin (plakat prestasi, langsung tayang) dan Panggung (teks halaman, draf → terbit).
 */
export function RuangKurator() {
  return (
    <MedalToaster>
      <Inner />
    </MedalToaster>
  );
}

function Inner() {
  const toast = useMedal();
  const connection = useConnection();
  const [refreshKey, setRefreshKey] = useState(0);
  const m = useKurator({
    onSaved: () => setRefreshKey((k) => k + 1),
    onRemote: ({ type, by }) => {
      if (type === "draft") toast(`${by} memperbarui draf`, { tone: "info", detail: "Isi di layar Anda ikut diperbarui." });
      if (type === "published") toast(`${by} menerbitkan halaman Prestasi`, { tone: "live" });
      if (type === "records") toast(`${by} mengubah plakat`, { tone: "info", detail: "Vitrin dimuat ulang." });
      if (type === "conflict") toast(`${by} juga sedang menyunting`, { tone: "warn", detail: "Simpanan Anda berikutnya menimpa draf mereka." });
    },
  });
  const v = m.value;
  const [room, setRoom] = useState("vitrin");
  const [chapter, setChapter] = useState("hero");
  const [modal, setModal] = useState(null); // publish | history | discard | delete | bulk-delete
  const [preview, setPreview] = useState(false);
  const [picker, setPicker] = useState(null);
  const [sheet, setSheet] = useState({ open: false, record: null });
  const [pending, setPending] = useState(null); // target hapus
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const r = store.get(ROOM_KEY);
    if (r === "vitrin" || r === "panggung") setRoom(r);
    const c = store.get(CH_KEY);
    if (CHAPTERS.some((x) => x.key === c)) setChapter(c);
  }, []);
  useEffect(() => store.set(ROOM_KEY, room), [room]);
  useEffect(() => store.set(CH_KEY, chapter), [chapter]);

  const deferred = useDeferredValue(v);
  const redundancy = useMemo(() => (deferred ? findRedundancy(deferred) : []), [deferred]);
  const lintMap = useMemo(() => redundancyByPath(redundancy), [redundancy]);
  const lintCount = useMemo(() => {
    const out = {};
    for (const path of Object.keys(lintMap)) {
      const k = path.split(".")[0];
      out[k] = (out[k] ?? 0) + lintMap[path].length;
    }
    return out;
  }, [lintMap]);
  const changed = useMemo(() => (v && m.doc ? changedChapters(v, m.doc.live) : []), [v, m.doc]);

  // pintasan papan ketik: Ctrl+S simpan, Ctrl+Z / Ctrl+Shift+Z urungkan di luar kolom isian
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const k = e.key.toLowerCase();
      if (k === "s") {
        e.preventDefault();
        m.flush().then(
          () => toast("Draf tersimpan", { tone: "ok", duration: 1800 }),
          () => {}
        );
      }
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? "");
      if (k === "z" && !typing && room === "panggung") {
        e.preventDefault();
        const ok = e.shiftKey ? m.redo() : m.undo();
        if (ok) toast(e.shiftKey ? "Diulang" : "Diurungkan", { tone: "info", duration: 1400 });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [m, room, toast]);

  // peringatan meninggalkan halaman saat masih ada ketikan belum tersimpan
  useEffect(() => {
    const onLeave = (e) => {
      if (m.status === "typing" || m.status === "saving") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [m.status]);

  useEffect(() => {
    if (m.status === "error") toast("Draf gagal disimpan", { tone: "error", detail: "Periksa koneksi, lalu tekan Ctrl+S.", action: { label: "Coba lagi", onClick: () => m.flush().catch(() => {}) } });
  }, [m.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const picker$ = useMemo(() => ({ open: (p) => setPicker(p) }), []);

  /* ---------- aksi Vitrin ---------- */
  const labels = v?.labels;
  const saveRecord = async (f) => {
    try {
      if (f.id) {
        const { id, createdAt, updatedAt, ...rest } = f;
        await m.updateRecord(id, rest);
        toast("Plakat diperbarui", { detail: f.title });
      } else {
        await m.createRecord(f);
        toast("Plakat dipasang", { detail: `${f.title} · langsung tayang` });
      }
      setSheet({ open: false, record: null });
    } catch (e) {
      toast("Plakat gagal disimpan", { tone: "error", detail: e.message });
    }
  };

  const restoreRecords = async (list) => {
    for (const r of list) {
      const { id, createdAt, updatedAt, ...rest } = r;
      await m.createRecord({ ...rest, tingkatan: normalizeLevel(rest.tingkatan) });
    }
  };

  const removeRecords = async (ids) => {
    try {
      const removed = await m.deleteRecords(ids);
      setSheet({ open: false, record: null });
      toast(ids.length > 1 ? `${ids.length} plakat diturunkan` : "Plakat diturunkan", {
        tone: "warn",
        detail: removed.length === 1 ? removed[0].title : undefined,
        duration: 6000,
        action: { label: "Urungkan", onClick: () => restoreRecords(removed).then(() => toast("Plakat dipasang kembali", { tone: "ok" }), (e) => toast("Gagal memulihkan", { tone: "error", detail: e.message })) },
      });
    } catch (e) {
      toast("Gagal menghapus", { tone: "error", detail: e.message });
    }
  };

  const moveRecords = async (ids, level) => {
    const before = m.records.filter((r) => ids.includes(r.id)).map((r) => ({ id: r.id, level: normalizeLevel(r.tingkatan) }));
    setBusy(true);
    try {
      await m.bulkSet(ids, { tingkatan: level });
      toast(`${ids.length > 1 ? `${ids.length} plakat` : "Plakat"} pindah ke ${labels.levels[level]}`, {
        duration: 5000,
        action: {
          label: "Urungkan",
          onClick: () => Promise.all(before.map((b) => m.updateRecord(b.id, { tingkatan: b.level }))).catch((e) => toast("Gagal mengurungkan", { tone: "error", detail: e.message })),
        },
      });
    } catch (e) {
      toast("Gagal memindah plakat", { tone: "error", detail: e.message });
    } finally {
      setBusy(false);
    }
  };

  const bulk = async (ids, action, after) => {
    if (action === "delete") {
      setPending({ ids, after });
      setModal("delete");
      return;
    }
    if (action.tingkatan) return moveRecords(ids, action.tingkatan);
    setBusy(true);
    try {
      await m.bulkSet(ids, action);
      toast(`${ids.length} plakat jadi ${labels.categories[action.category]}`);
    } catch (e) {
      toast("Aksi massal gagal", { tone: "error", detail: e.message });
    } finally {
      setBusy(false);
    }
  };

  /* ---------- terbit ---------- */
  const doPublish = useCallback(async () => {
    try {
      const changedNow = await m.publish();
      toast(changedNow ? "Halaman Prestasi terbit" : "Tidak ada perubahan untuk diterbitkan", { tone: changedNow ? "live" : "info", detail: changedNow ? "Pengunjung melihat versi baru." : undefined });
      return true;
    } catch (e) {
      toast("Gagal menerbitkan", { tone: "error", detail: e.message });
      return false;
    }
  }, [m, toast]);

  if (m.error && !v) {
    return (
      <Screen>
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="font-serif text-2xl">Ruang Kurator belum bisa dibuka</p>
          <p className="max-w-sm text-[14px] text-[var(--k-mute)]">{m.error}</p>
          <button type="button" onClick={m.load} className="h-10 rounded-[10px] bg-[var(--k-gold)] px-5 text-[13.5px] font-semibold text-[var(--k-gold-ink)]">
            Coba lagi
          </button>
        </div>
      </Screen>
    );
  }
  if (!v || !m.records) {
    return (
      <Screen>
        <LaurelLoader />
      </Screen>
    );
  }

  // hitung seperti halaman publik: baris kembar (nama + judul + tahun) dihitung sekali
  const stats = {
    items: new Set(m.records.map((r) => `${r.achieverName}|${r.title}|${r.tahun}`)).size,
    people: new Set(m.records.map((r) => r.achieverName)).size,
  };
  const dirtyText = changed.length > 0;

  return (
    <PickerCtx.Provider value={picker$}>
      <LintCtx.Provider value={lintMap}>
        <div className="kurator kurator-grid min-h-dvh">
          {/* bilah atas */}
          <header className="sticky top-0 z-30 border-b border-[var(--k-line)] bg-[var(--k-bg)]/80 backdrop-blur-xl">
            <div className="mx-auto flex h-[68px] max-w-[1500px] items-center gap-3 px-4 sm:px-6">
              <Link href="/admin/dashboard" aria-label="Kembali ke dasbor" className="grid size-9 shrink-0 place-items-center rounded-full border border-[var(--k-line-2)] text-[var(--k-mute)] transition-colors hover:border-[var(--k-gold)] hover:text-[var(--k-gold)]">
                ←
              </Link>
              <div className="hidden min-w-0 shrink-0 xl:block">
                <p className="whitespace-nowrap font-serif text-[1.15rem] leading-none">
                  Ruang <em className="text-[var(--k-gold)]">Kurator</em>
                </p>
                <p className="mt-1 text-[11.5px] text-[var(--k-faint)]">Halaman Prestasi</p>
              </div>

              <RoomSwitch room={room} onChange={setRoom} />

              <div className="ml-auto flex items-center gap-1.5">
                <SaveDot status={m.status} connection={connection} />
                {room === "panggung" && (
                  <>
                    <IconBtn label="Urungkan (Ctrl+Z)" disabled={!m.canUndo} onClick={m.undo}>↶</IconBtn>
                    <IconBtn label="Ulangi (Ctrl+Shift+Z)" disabled={!m.canRedo} onClick={m.redo}>↷</IconBtn>
                  </>
                )}
                <TopBtn onClick={() => setModal("history")} className="hidden lg:inline-flex">Riwayat</TopBtn>
                <TopBtn onClick={() => setPreview(true)} className="hidden sm:inline-flex">Pratinjau</TopBtn>
                <button
                  type="button"
                  onClick={() => setModal("publish")}
                  disabled={!m.dirty && !dirtyText}
                  className="relative inline-flex h-10 items-center gap-2 rounded-[10px] bg-[var(--k-gold)] px-4 text-[13.5px] font-semibold text-[var(--k-gold-ink)] transition-[filter,opacity,transform] hover:brightness-110 active:scale-[0.97] disabled:opacity-35"
                >
                  Terbitkan
                  {changed.length > 0 && <span className="grid size-5 place-items-center rounded-full bg-[var(--k-gold-ink)] text-[11px] text-[var(--k-gold)]">{changed.length}</span>}
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-[1500px] px-4 pb-28 pt-5 sm:px-6">
            <div className="mb-5 space-y-2 empty:hidden">
              {dirtyText && (
                <RibbonBanner tone="draft" action={{ label: "Buang draf", onClick: () => setModal("discard") }}>
                  <span>
                    {changed.length} bab teks belum terbit: {changed.map((k) => CHAPTERS.find((c) => c.key === k)?.label).join(", ")}.
                  </span>
                </RibbonBanner>
              )}
              {m.records.length === 0 && v.sample.enabled && (
                <RibbonBanner tone="sample" storageKey="ruang-kurator:ribbon-sample">
                  Vitrin kosong, jadi pengunjung melihat prestasi contoh. Pasang plakat pertama atau matikan contoh di bab Arsip.
                </RibbonBanner>
              )}
              {room === "vitrin" && (
                <RibbonBanner tone="live" storageKey="ruang-kurator:ribbon-live">
                  Plakat di Vitrin langsung tayang di halaman Prestasi dan Beranda begitu disimpan.
                </RibbonBanner>
              )}
            </div>

            <RoomStage room={room}>
              {room === "vitrin" ? (
                <Vitrin
                  records={m.records}
                  labels={labels}
                  busy={busy}
                  onOpen={(r) => setSheet({ open: true, record: r })}
                  onCreate={() => setSheet({ open: true, record: null })}
                  onMove={moveRecords}
                  onBulk={bulk}
                />
              ) : (
                <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_300px]">
                  <aside className="lg:sticky lg:top-[88px] lg:self-start">
                    <ChapterRail active={chapter} onSelect={setChapter} changed={changed} lintCount={lintCount} />
                  </aside>
                  <section key={chapter} aria-label={CHAPTERS.find((c) => c.key === chapter)?.label} className="space-y-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                    {v ? <ChapterEditor chapter={chapter} v={v} u={m.update} /> : <PlaqueSkeleton />}
                  </section>
                  <aside className="hidden space-y-4 xl:sticky xl:top-[88px] xl:block xl:self-start">
                    <ExhibitLabel chapter={chapter} v={v} stats={stats} />
                    <CuratorNotes redundancy={redundancy} onJump={(path) => {
                      const target = path.split(".")[0];
                      const ch = CHAPTERS.some((c) => c.key === target) ? target : target === "roles" || target === "roleFallback" ? "labels" : target === "sample" ? "archive" : chapter;
                      if (ch !== chapter) {
                        setChapter(ch);
                        setTimeout(() => jumpToField(path), 380);
                      } else jumpToField(path);
                    }} />
                  </aside>
                </div>
              )}
            </RoomStage>
          </main>
        </div>

        <PlakatSheet
          open={sheet.open}
          record={sheet.record}
          labels={labels}
          onOpenChange={(o) => !o && setSheet({ open: false, record: null })}
          onSave={saveRecord}
          onDelete={(r) => {
            setPending({ ids: [r.id] });
            setModal("delete");
          }}
        />
        <MediaPicker
          open={Boolean(picker)}
          onOpenChange={(o) => !o && setPicker(null)}
          kind={picker?.kind ?? "image"}
          current={picker?.current}
          folders={FOLDERS[picker?.kind ?? "image"]}
          uploadFolder="uploads/prestasi"
          notify={(t, o) => toast(t, o)}
          onPick={(url) => picker?.onPick(url)}
        />
        <PreviewSheet open={preview} onOpenChange={setPreview} refreshKey={refreshKey} anchor={room === "panggung" ? ANCHOR[chapter] : "arsip"} />
        <CeremonyModal open={modal === "publish"} onOpenChange={(o) => !o && setModal(null)} doc={m.doc} value={v} redundancy={redundancy.length} onPublish={doPublish} />
        <HistoryModal
          open={modal === "history"}
          onOpenChange={(o) => !o && setModal(null)}
          doc={m.doc}
          onRestore={async (i) => {
            try {
              await m.restore(i);
              setRoom("panggung");
              toast("Versi lama disalin ke draf", { tone: "info", detail: "Terbitkan bila sudah sesuai." });
            } catch (e) {
              toast("Gagal memulihkan", { tone: "error", detail: e.message });
            }
          }}
        />
        <KuratorConfirm
          open={modal === "discard"}
          onOpenChange={(o) => !o && setModal(null)}
          title="Buang draf teks?"
          description="Semua teks yang belum terbit kembali ke versi live. Plakat di Vitrin tidak terpengaruh."
          confirmLabel="Buang draf"
          onConfirm={async () => {
            try {
              await m.discard();
              toast("Draf dibuang", { tone: "info" });
            } catch (e) {
              toast("Gagal membuang draf", { tone: "error", detail: e.message });
            }
            setModal(null);
          }}
        />
        <KuratorConfirm
          open={modal === "delete"}
          onOpenChange={(o) => !o && setModal(null)}
          title={pending?.ids?.length > 1 ? `Turunkan ${pending.ids.length} plakat?` : "Turunkan plakat ini?"}
          description="Prestasi hilang dari halaman publik. Masih bisa dipasang kembali lewat tombol Urungkan sesaat setelahnya."
          confirmLabel="Turunkan"
          onConfirm={async () => {
            await removeRecords(pending.ids);
            pending.after?.();
            setPending(null);
            setModal(null);
          }}
        />
      </LintCtx.Provider>
    </PickerCtx.Provider>
  );
}

function Screen({ children }) {
  return <div className="kurator kurator-grid grid min-h-dvh place-items-center px-6">{children}</div>;
}

/** Pengalih ruang: dua "pintu galeri" dengan ambang emas yang meluncur (GSAP). */
function RoomSwitch({ room, onChange }) {
  const bar = useRef(null);
  const refs = useRef({});
  useLayoutEffect(() => {
    const el = refs.current[room];
    if (!el || !bar.current) return;
    const to = { x: el.offsetLeft, width: el.offsetWidth };
    if (prefersReducedMotion()) gsap.set(bar.current, to);
    else gsap.to(bar.current, { ...to, duration: 0.55, ease: "expo.out" });
  }, [room]);
  // ukur ulang saat lebar berubah (subjudul tersembunyi di layar sempit, font selesai dimuat)
  useEffect(() => {
    const host = bar.current?.parentElement;
    if (!host || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      const el = refs.current[room];
      if (el && bar.current) gsap.set(bar.current, { x: el.offsetLeft, width: el.offsetWidth });
    });
    ro.observe(host);
    return () => ro.disconnect();
  }, [room]);
  return (
    <div role="tablist" aria-label="Ruang" className="relative flex shrink-0 rounded-xl xl:mx-auto border border-[var(--k-line-2)] bg-black/30 p-1">
      <span ref={bar} aria-hidden className="absolute bottom-1 left-0 top-1 rounded-lg border border-[var(--k-gold)]/40 bg-[var(--k-gold)]/12 shadow-[inset_0_-2px_0_var(--k-gold)]" />
      {ROOMS.map(([k, label, sub]) => (
        <button
          key={k}
          ref={(el) => (refs.current[k] = el)}
          role="tab"
          aria-selected={room === k}
          type="button"
          onClick={() => onChange(k)}
          className={cn("relative z-10 rounded-lg px-3 py-1 text-left transition-colors sm:px-4", room === k ? "text-[var(--k-ink)]" : "text-[var(--k-mute)] hover:text-[var(--k-ink)]")}
        >
          <span className="block font-serif text-[14.5px] leading-tight">{label}</span>
          <span className="hidden whitespace-nowrap text-[10.5px] text-[var(--k-faint)] lg:block">{sub}</span>
        </button>
      ))}
    </div>
  );
}

/** Pergantian ruang: tirai tipis menyapu dari kiri lalu isi baru naik. */
function RoomStage({ room, children }) {
  const ref = useRef(null);
  const first = useRef(true);
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!ref.current || prefersReducedMotion()) return;
    gsap.fromTo(ref.current, { opacity: 0, y: 16, clipPath: "inset(0 0 100% 0)" }, { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "expo.out", clearProps: "clipPath,transform" });
  }, [room]);
  return <div ref={ref}>{children}</div>;
}

function CuratorNotes({ redundancy, onJump }) {
  return (
    <div className="rounded-2xl border border-[var(--k-line)] bg-[var(--k-panel)] p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--k-faint)]">Catatan kurator</p>
      {redundancy.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-[13px] text-[var(--k-mute)]">
          <span className="size-1.5 rounded-full bg-[var(--k-ok)]" />
          Tidak ada kalimat yang berulang.
        </p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {redundancy.slice(0, 6).map((r, i) => (
            <li key={i} className="text-[12.5px] leading-snug text-[var(--k-mute)]">
              <span className="text-[#e9a0ab]">Mirip:</span>{" "}
              <button type="button" onClick={() => onJump(r.a.path)} className="underline decoration-dotted underline-offset-2 hover:text-[var(--k-ink)]">
                {r.a.label}
              </button>{" "}
              ↔{" "}
              <button type="button" onClick={() => onJump(r.b.path)} className="underline decoration-dotted underline-offset-2 hover:text-[var(--k-ink)]">
                {r.b.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 border-t border-[var(--k-line)] pt-3 text-[12px] leading-relaxed text-[var(--k-faint)]">
        <kbd className="rounded border border-[var(--k-line-2)] px-1 font-mono text-[10.5px]">Ctrl S</kbd> simpan ·{" "}
        <kbd className="rounded border border-[var(--k-line-2)] px-1 font-mono text-[10.5px]">Ctrl Z</kbd> urungkan. Token seperti <code className="text-[var(--k-gold)]">{"{n}"}</code> terisi otomatis.
      </p>
    </div>
  );
}

function TopBtn({ children, className, ...props }) {
  return (
    <button
      type="button"
      className={cn("inline-flex h-10 items-center rounded-[10px] px-3 text-[13.5px] font-medium text-[var(--k-mute)] transition-colors hover:bg-white/[0.06] hover:text-[var(--k-ink)] disabled:opacity-35", className)}
      {...props}
    >
      {children}
    </button>
  );
}

function IconBtn({ label, children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="hidden size-9 place-items-center rounded-[10px] text-[16px] text-[var(--k-mute)] transition-colors hover:bg-white/[0.06] hover:text-[var(--k-ink)] disabled:opacity-30 md:grid"
      {...props}
    >
      {children}
    </button>
  );
}
