"use client";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useConnection } from "@/lib/realtime/client";
import { DRAWERS, changedDrawers } from "@/lib/dosen-cms/schema";
import { findRedundancy } from "@/lib/dosen-cms/lint";
import { resolveLecturers, slugify } from "@/lib/dosen-content";
import { MediaPicker } from "@/components/home-studio/overlays";
import { MovingBorderButton } from "@/components/aceternity/moving-border";
import { ConfirmModal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { useRuang } from "./use-ruang";
import { ReceiptToaster, useReceipt } from "./receipt-toast";
import { PickerCtx } from "./fields";
import { DossierSkeleton, PreviewSheet, RuangLoader, SaveLamp, TearBanner, jumpToField } from "./chrome";
import { LecturerDeck, Pigeonhole } from "./pigeonhole";
import { Dossier } from "./dossier";
import { SectionEditor } from "./sections";
import { AddLecturerModal, HistoryModal, PublishModal } from "./modals";

const SEL_KEY = "ruang-dosen:sel";
const FOLDERS = {
  image: ["uploads/dosen", "img/profil", "uploads", "img"],
  video: ["video", "uploads/dosen", "uploads"],
  lottie: ["lottie", "uploads/dosen"],
};

/** Entri tanpa timpaan apa pun (hanya kunci & sumber) dianggap sama dengan tidak ada. */
const sig = (e) => {
  if (!e) return null;
  const { key, source, ...rest } = e;
  return Object.keys(rest).length || source === "custom" ? JSON.stringify(e) : null;
};

/**
 * Ruang Dosen — CMS halaman /dosen. Kiri: dinding loker (dosen + halaman); kanan: map berkas dosen
 * atau penyunting section. Autosave draf, pratinjau, terbit dengan slip, riwayat, realtime antar-admin.
 */
export function RuangDosen() {
  return (
    <ReceiptToaster>
      <Inner />
    </ReceiptToaster>
  );
}

function Inner() {
  const toast = useReceipt();
  const connection = useConnection();
  const [refreshKey, setRefreshKey] = useState(0);
  const m = useRuang({
    onSaved: () => setRefreshKey((k) => k + 1),
    onRemote: ({ type, by }) => {
      if (type === "draft") toast(`${by} memperbarui draf`, { tone: "info", detail: "Isi di layar Anda ikut diperbarui." });
      if (type === "published") toast(`${by} menerbitkan halaman Dosen`, { tone: "live" });
      if (type === "conflict") toast(`${by} juga sedang mengedit`, { tone: "warn", detail: "Simpanan Anda berikutnya akan menimpa draf mereka." });
    },
  });
  const v = m.value;
  const [sel, setSel] = useState({ kind: "lecturer", key: null });
  const [tab, setTab] = useState("identitas");
  const [picker, setPicker] = useState(null);
  const [modal, setModal] = useState(null); // publish | history | add | discard | delete
  const [preview, setPreview] = useState(false);
  const [hideDraftBanner, setHideDraftBanner] = useState(false);
  const [showLint, setShowLint] = useState(false);

  const bagan = m.doc?.bagan?.length ? m.doc.bagan : undefined;
  const lecturers = useMemo(() => (v ? resolveLecturers(bagan, v.lecturers, { certs: v.certs, withHidden: true }) : []), [v, bagan]);

  // pilihan awal / tersimpan
  useEffect(() => {
    if (!lecturers.length || sel.key) return;
    let saved = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(SEL_KEY) ?? "null");
    } catch {}
    const valid = saved && (saved.kind === "section" ? DRAWERS.some((d) => d.key === saved.key) : lecturers.some((l) => l.key === saved.key));
    setSel(valid ? saved : { kind: "lecturer", key: lecturers[0].key });
  }, [lecturers, sel.key]);
  useEffect(() => {
    try {
      if (sel.key) sessionStorage.setItem(SEL_KEY, JSON.stringify(sel));
    } catch {}
  }, [sel]);

  /** Pastikan setiap dosen punya entri di urutan tampil sekarang, lalu ubah. */
  const editEntries = useCallback(
    (fn, opts) =>
      m.mutate((cur) => {
        const order = resolveLecturers(bagan, cur.lecturers, { certs: cur.certs, withHidden: true }).map((l) => l.key);
        const by = new Map(cur.lecturers.map((e) => [e.key, e]));
        const list = order.map((k) => by.get(k) ?? { key: k, source: "bagan" });
        return { ...cur, lecturers: fn(list) };
      }, opts),
    [m, bagan]
  );

  const setField = useCallback(
    (key, k, val) =>
      editEntries(
        (list) =>
          list.map((e) => {
            if (e.key !== key) return e;
            const next = { ...e };
            if (val === undefined) delete next[k];
            else next[k] = val;
            return next;
          }),
        { merge: true }
      ),
    [editEntries]
  );

  const deferred = useDeferredValue(v);
  const live = m.doc?.live;
  const keysChanged = useMemo(() => {
    if (!deferred || !live) return [];
    const a = new Map((deferred.lecturers ?? []).map((e) => [e.key, sig(e)]));
    const b = new Map((live.lecturers ?? []).map((e) => [e.key, sig(e)]));
    return [...new Set([...a.keys(), ...b.keys()])].filter((k) => (a.get(k) ?? null) !== (b.get(k) ?? null));
  }, [deferred, live]);
  const drawersChanged = useMemo(() => {
    if (!deferred || !live) return [];
    const order = (x) => resolveLecturers(bagan, x.lecturers, { certs: x.certs, withHidden: true }).map((l) => l.key).join();
    // loker "Dosen" hanya dihitung bila urutan berubah; isi berkas dihitung per dosen
    return changedDrawers(deferred, live).filter((k) => k !== "lecturers" || order(deferred) !== order(live));
  }, [deferred, live, bagan]);
  const redundancy = useMemo(() => (deferred ? findRedundancy(deferred, lecturers) : []), [deferred, lecturers]);

  const doPublish = useCallback(async () => {
    try {
      const changed = await m.publish();
      toast(changed ? "Halaman Dosen terbit" : "Tidak ada yang berubah", { tone: changed ? "live" : "info", detail: changed ? "Pengunjung melihat versi baru sekarang." : undefined, action: changed ? { label: "Lihat /dosen", onClick: () => window.open("/dosen", "_blank") } : undefined });
    } catch (e) {
      toast("Gagal menerbitkan", { tone: "error", detail: e.message });
      throw e;
    }
  }, [m, toast]);

  // pintasan papan ketik
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const k = e.key.toLowerCase();
      if (k === "s") {
        e.preventDefault();
        m.flush().then(() => toast("Draf disimpan"), () => toast("Gagal menyimpan", { tone: "error" }));
      } else if (k === "z" && !e.target.closest?.("input,textarea")) {
        e.preventDefault();
        (e.shiftKey ? m.redo : m.undo)() || toast("Tidak ada langkah lagi", { tone: "info", duration: 1800 });
      } else if (k === "enter") {
        e.preventDefault();
        setModal("publish");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [m, toast]);

  // peringatan meninggalkan halaman saat masih mengetik
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

  if (m.error && !v) {
    return (
      <div className="grid min-h-dvh place-items-center bg-cream p-6 text-center">
        <div>
          <RuangLoader label="Ruang terkunci" />
          <p className="mt-4 text-[15px] text-navy">{m.error}</p>
          <button type="button" onClick={m.load} className="mt-4 rounded-md bg-navy px-5 py-2 text-[14px] font-semibold text-white hover:bg-navy-deep">
            Coba lagi
          </button>
        </div>
      </div>
    );
  }
  if (!v || !sel.key) {
    return (
      <div className="grid min-h-dvh place-items-center bg-cream">
        <RuangLoader />
      </div>
    );
  }

  const lecturer = sel.kind === "lecturer" ? lecturers.find((l) => l.key === sel.key) : null;
  const entry = lecturer ? v.lecturers.find((e) => e.key === lecturer.key) : null;
  const drawer = DRAWERS.find((d) => d.key === (sel.kind === "section" ? sel.key : "lecturers"));

  const jump = (path) => {
    if (path.startsWith("lecturer:")) {
      const [key, ...rest] = path.slice(9).split(".");
      setSel({ kind: "lecturer", key });
      setTab("identitas");
      setTimeout(() => jumpToField(`lecturer.${key}.${rest.join(".")}`), 80);
      return;
    }
    const section = path.split(".")[0];
    setSel({ kind: "section", key: section === "certs" ? "modal" : section });
    setTimeout(() => jumpToField(path), 80);
  };

  return (
    <PickerCtx.Provider value={{ open: (p) => setPicker(p) }}>
      <div className="ruang-bg min-h-dvh bg-cream text-text">
        {/* bilah atas */}
        <header className="sticky top-0 z-40 border-b border-navy/10 bg-cream/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
            <Link href="/admin/dashboard" className="text-[13px] font-medium text-navy/55 hover:text-maroon">
              ← CMS
            </Link>
            <div className="flex items-baseline gap-2">
              <h1 className="font-serif text-[1.35rem] leading-none text-navy">Ruang Dosen</h1>
              <span className="hidden font-mono text-[10.5px] uppercase tracking-[0.2em] text-navy/40 sm:inline">/dosen</span>
            </div>
            <SaveLamp status={m.status} connection={connection} />
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              <TopBtn onClick={() => m.undo() || toast("Tidak ada langkah lagi", { tone: "info", duration: 1800 })} disabled={!m.canUndo} title="Urungkan (Ctrl+Z)">
                ↶
              </TopBtn>
              <TopBtn onClick={() => m.redo()} title="Ulangi (Ctrl+Shift+Z)">↷</TopBtn>
              <TopBtn onClick={() => setPreview(true)}>Pratinjau</TopBtn>
              <TopBtn onClick={() => setModal("history")}>Riwayat</TopBtn>
              {m.dirty && <TopBtn onClick={() => setModal("discard")}>Buang draf</TopBtn>}
              {m.dirty ? (
                <MovingBorderButton onClick={() => setModal("publish")} className="h-10 bg-maroon px-5 text-[13.5px]" duration={3200}>
                  Terbitkan
                </MovingBorderButton>
              ) : (
                <button type="button" onClick={() => setModal("publish")} className="h-10 rounded-xl border border-navy/15 px-5 text-[13.5px] font-semibold text-navy/50">
                  Sudah live
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1400px] space-y-2 px-4 pt-4 sm:px-6">
          {m.dirty && !hideDraftBanner && (
            <TearBanner tone="draft" onDismiss={() => setHideDraftBanner(true)} action={{ label: "Pratinjau", onClick: () => setPreview(true) }}>
              <span>
                Draf belum terbit — {[drawersChanged.length && `${drawersChanged.length} loker`, keysChanged.length && `${keysChanged.length} berkas dosen`].filter(Boolean).join(" & ") || "Urutan"} berbeda dari versi live.
              </span>
            </TearBanner>
          )}
          {redundancy.length > 0 && (
            <TearBanner tone="warn" action={{ label: showLint ? "Tutup daftar" : "Lihat", onClick: () => setShowLint((s) => !s) }}>
              <span>{redundancy.length} kalimat kembar ditemukan di halaman ini.</span>
              {showLint && (
                <ul className="w-full space-y-1 pb-1">
                  {redundancy.slice(0, 6).map((r, i) => (
                    <li key={i} className="text-[12.5px]">
                      “{r.text.slice(0, 80)}{r.text.length > 80 ? "…" : ""}” —{" "}
                      <button type="button" className="underline" onClick={() => jump(r.a.path)}>
                        {r.a.label}
                      </button>{" "}
                      &{" "}
                      <button type="button" className="underline" onClick={() => jump(r.b.path)}>
                        {r.b.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </TearBanner>
          )}
        </div>

        <main className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_1fr] lg:gap-8">
          {/* dinding loker */}
          <aside className="hidden lg:block">
            <div className="sticky top-[84px] max-h-[calc(100dvh-100px)] overflow-y-auto pb-6 pr-1">
              <Pigeonhole
                lecturers={lecturers}
                selected={sel}
                onSelect={(s) => {
                  setSel(s);
                  if (s.kind === "lecturer") setTab((t) => t);
                }}
                onReorder={(keys) => editEntries((list) => keys.map((k) => list.find((e) => e.key === k)).filter(Boolean))}
                onAdd={() => setModal("add")}
                changedKeys={keysChanged}
                changedDrawers={drawersChanged}
              />
            </div>
          </aside>

          {/* ponsel: dek & pilihan loker */}
          <div className="min-w-0 space-y-3 overflow-hidden lg:hidden">
            <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
              {DRAWERS.map((d) => {
                const on = d.key === "lecturers" ? sel.kind === "lecturer" : sel.kind === "section" && sel.key === d.key;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setSel(d.key === "lecturers" ? { kind: "lecturer", key: lecturers[0]?.key } : { kind: "section", key: d.key })}
                    className={cn("shrink-0 rounded-full border px-3.5 py-1.5 text-[13px]", on ? "border-navy bg-navy text-white" : "border-navy/15 bg-white text-navy")}
                  >
                    {d.label}
                    {drawersChanged.includes(d.key) && <span className="ml-1.5 inline-block size-1.5 rounded-full bg-gold align-middle" />}
                  </button>
                );
              })}
            </div>
            {sel.kind === "lecturer" && (
              <>
                <LecturerDeck lecturers={lecturers} selectedKey={sel.key} onSelect={setSel} />
                <button type="button" onClick={() => setModal("add")} className="mx-auto block text-[13px] font-semibold text-maroon">
                  + Dosen tamu
                </button>
              </>
            )}
          </div>

          <section aria-label={drawer?.label} className="min-w-0">
            <div className="mb-4 flex items-baseline gap-3">
              <span className="font-mono text-[11px] text-maroon/70">{sel.kind === "lecturer" ? "Rak A · Berkas dosen" : `Rak B · ${drawer?.code} ${drawer?.label}`}</span>
              <p className="text-[13px] text-text/55">{drawer?.hint}</p>
            </div>
            {sel.kind === "lecturer" ? (
              lecturer ? (
                <Dossier
                  lecturer={lecturer}
                  entry={entry ?? {}}
                  fields={v.fields}
                  certs={v.certs}
                  modal={v.modal}
                  tab={tab}
                  onTab={setTab}
                  onSet={(k, val) => setField(lecturer.key, k, val)}
                  onToggleHidden={() => {
                    setField(lecturer.key, "hidden", !lecturer.hidden);
                    toast(lecturer.hidden ? `${lecturer.name.split(" ")[0]} tampil lagi` : `${lecturer.name.split(" ")[0]} disembunyikan`, { tone: "info", duration: 2600 });
                  }}
                  onDelete={() => setModal("delete")}
                />
              ) : (
                <DossierSkeleton />
              )
            ) : (
              <div key={sel.key} className="rounded-md bg-[#fffdf7] p-5 shadow-[0_30px_60px_-44px_rgb(20_33_61/0.6)] ring-1 ring-navy/10 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 sm:p-7">
                <SectionEditor drawer={sel.key} v={v} u={m.update} lecturers={lecturers} />
              </div>
            )}
          </section>
        </main>
      </div>

      <MediaPicker
        open={Boolean(picker)}
        onOpenChange={(o) => !o && setPicker(null)}
        kind={picker?.kind ?? "image"}
        current={picker?.current}
        folders={FOLDERS[picker?.kind ?? "image"]}
        uploadFolder="uploads/dosen"
        notify={(t, o) => toast(t, o)}
        onPick={(url) => picker?.onPick(url)}
      />
      <PreviewSheet open={preview} onOpenChange={setPreview} refreshKey={refreshKey} anchor={sel.kind === "section" && ["directory", "fields", "map"].includes(sel.key) ? "direktori" : undefined} />
      <PublishModal
        open={modal === "publish"}
        onOpenChange={(o) => !o && setModal(null)}
        drawers={drawersChanged}
        lecturers={keysChanged.map((k) => lecturers.find((l) => l.key === k)?.name ?? `${k} (dihapus)`)}
        redundancy={redundancy.length}
        onPublish={doPublish}
      />
      <HistoryModal
        open={modal === "history"}
        onOpenChange={(o) => !o && setModal(null)}
        doc={m.doc}
        onRestore={async (i) => {
          try {
            await m.restore(i);
            toast("Versi lama disalin ke draf", { tone: "info", detail: "Terbitkan bila sudah sesuai." });
          } catch (e) {
            toast("Gagal memulihkan", { tone: "error", detail: e.message });
          }
        }}
      />
      <AddLecturerModal
        open={modal === "add"}
        onOpenChange={(o) => !o && setModal(null)}
        onAdd={({ name, credentials, role }) => {
          const base = slugify(name) || "dosen";
          const key = lecturers.some((l) => l.key === base) ? `${base}-${Date.now().toString(36).slice(-3)}` : base;
          editEntries((list) => [...list, { key, source: "custom", name, credentials, role, fields: [], expertise: [], courses: [], research: [] }]);
          setSel({ kind: "lecturer", key });
          setTab("identitas");
          toast("Berkas dosen tamu dibuat", { detail: name });
        }}
      />
      <ConfirmModal
        open={modal === "discard"}
        onOpenChange={(o) => !o && setModal(null)}
        title="Buang draf?"
        description="Semua perubahan yang belum terbit dikembalikan ke versi live. Tindakan ini tidak bisa diurungkan."
        confirmLabel="Buang draf"
        destructive
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
      <ConfirmModal
        open={modal === "delete"}
        onOpenChange={(o) => !o && setModal(null)}
        title={`Hapus berkas ${lecturer?.name ?? ""}?`}
        description="Berkas dosen tamu ini dihapus dari draf. Masih bisa diurungkan (Ctrl+Z) sebelum terbit."
        confirmLabel="Hapus berkas"
        destructive
        onConfirm={() => {
          const key = lecturer?.key;
          editEntries((list) => list.filter((e) => e.key !== key));
          setSel({ kind: "lecturer", key: lecturers.find((l) => l.key !== key)?.key ?? null });
          setModal(null);
          toast("Berkas dihapus", { tone: "warn", action: { label: "Urungkan", onClick: () => m.undo() } });
        }}
      />
    </PickerCtx.Provider>
  );
}

function TopBtn({ children, className, ...props }) {
  return (
    <button
      type="button"
      className={cn("h-10 rounded-xl px-3.5 text-[13.5px] font-medium text-navy/75 transition-colors hover:bg-white hover:text-navy disabled:opacity-35", className)}
      {...props}
    >
      {children}
    </button>
  );
}
